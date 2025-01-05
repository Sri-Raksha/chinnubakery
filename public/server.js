require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { MongoClient } = require("mongodb");

// Initialize app
const app = express();
const port = process.env.PORT || 5005;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public")); // Serve frontend files from the 'public' directory

// MongoDB Connection
const uri = process.env.MONGO_URI || "mongodb+srv://sriraksha17siva:raksaur@cluster0.mcilc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);
const dbName = "chinnus_bakery"; // Replace with your database name

(async () => {
  try {
    await client.connect();
    console.log("Connected to MongoDB Atlas");
    const db = client.db(dbName);
    const usersCollection = db.collection("users");

    // Serve the homepage
    app.get("/", (req, res) => {
      res.sendFile(__dirname + "/public/index.html");
    });

    // Register Route
    app.post("/register", async (req, res) => {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required." });
      }

      try {
        // Check if the user already exists
        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ message: "User already exists!" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the user into the database
        await usersCollection.insertOne({ name, email, password: hashedPassword });

        res.status(201).json({ message: "User registered successfully!" });
      } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ message: "Internal server error." });
      }
    });

    // Login Route
    app.post("/login", async (req, res) => {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "All fields are required." });
      }

      try {
        // Find the user in the database
        const user = await usersCollection.findOne({ email });
        if (!user) {
          return res.status(400).json({ message: "Invalid email or password." });
        }

        // Compare the password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(400).json({ message: "Invalid email or password." });
        }

        // Generate a JWT
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "default_jwt_secret", { expiresIn: "1h" });

        res.status(200).json({ message: "Login successful!", token });
      } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Internal server error." });
      }
    });

    // Start the server
    app.listen(port, () => {
      console.log(`Server running at https://chinnubakery.onrender.com`);
    });
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  }
})();
