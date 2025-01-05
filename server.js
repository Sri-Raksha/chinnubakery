require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Environment variables
const PORT = process.env.PORT || 5005;
const JWT_SECRET = process.env.JWT_SECRET;
const MONGO_URI = process.env.MONGO_URI;

if (!JWT_SECRET || !MONGO_URI) {
    console.error("Environment variables MONGO_URI or JWT_SECRET are not set.");
    process.exit(1);
}

// MongoDB connection
mongoose
    .connect(MONGO_URI)
    .then(() => console.log("Connected to MongoDB Atlas"))
    .catch((err) => {
        console.error("Error connecting to MongoDB Atlas:", err);
        process.exit(1); // Exit the app on connection failure
    });

// User model
const User = require("./models/User");

// API Routes
app.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required." });
    }
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists." });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Error registering user.", error });
    }
});

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if fields are provided
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Find user in the database
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password." });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password." });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });

        return res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        console.error("Login Error:", error); // Log error details
        res.status(500).json({ message: "Error logging in.", error });
    }
});


// Serve static files
app.use(express.static("public"));

// Fallback route for frontend
app.get("*", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

// Start the server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
