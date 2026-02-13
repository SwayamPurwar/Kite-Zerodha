const UserModel = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

module.exports.signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password for security
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const newUser = new UserModel({
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: "User created successfully! You can now log in." });
  } catch (error) {
    res.status(500).json({ message: "Error signing up", error });
  }
};

module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Create a JWT token (Valid for 1 day)
    // IMPORTANT: Make sure you have JWT_SECRET defined in your backend/.env file
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "supersecretkey123", {
      expiresIn: "1d",
    });

    res.json({ 
        message: "Logged in successfully", 
        token, 
        walletBalance: user.walletBalance 
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
};