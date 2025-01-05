const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { 
            type: String, 
            required: true, 
            unique: true, 
            match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"] 
        },
        password: { type: String, required: true, select: false },
        role: { type: String, enum: ["user", "admin"], default: "user" },
    },
    { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

module.exports = mongoose.model("User", userSchema);

