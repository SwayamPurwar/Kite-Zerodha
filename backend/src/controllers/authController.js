const UserModel = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

module.exports.signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check for existing user
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 2. Create user (DO NOT hash here, let the Model handle it)
    const newUser = new UserModel({
      email,
      password, // Pass plain password; Model hashes it on .save()
    });

    await newUser.save();
    res.status(201).json({ message: "User created successfully! You can now log in." });
  } catch (error) {
    console.error("Signup Error:", error.message);
    res.status(500).json({ message: "Error signing up", error: error.message });
  }
};

module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 2. Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (!process.env.JWT_SECRET) {
       throw new Error("JWT_SECRET is missing in environment variables.");
    }

    // 3. Create Token
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: "1d" }
    );

    res.json({ 
        message: "Logged in successfully", 
        token, 
        walletBalance: user.walletBalance 
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};