const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
const uri = "mongodb://127.0.0.1:27017"; // Update this if using MongoDB Atlas
const client = new MongoClient(uri);

const dbName = "chinnus_bakery";

(async () => {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    const db = client.db(dbName);
    const usersCollection = db.collection("users");

    // Register User
    // Register User
    app.post("/register", async (req, res) => {
        const { name, email, password } = req.body;
    
        // Check if user already exists
        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
        return res.status(400).json({ message: "User already exists!" });
        }
    
        // Insert new user
        await usersCollection.insertOne({ name, email, password });
        res.status(201).json({ message: "User registered successfully!" });
    });
  

    // Login User
    app.post("/login", async (req, res) => {
      const { email, password } = req.body;

      // Validate credentials
      const user = await usersCollection.findOne({ email, password });
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password!" });
      }

      res.status(200).json({ message: "Login successful!" });
    });

    // Start the server
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
})();
