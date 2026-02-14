const UserModel = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer"); // NEW IMPORT

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || "your-email@gmail.com", 
        pass: process.env.EMAIL_PASS || "your-app-password"
    }
});

module.exports.signup = async (req, res) => {
  try {
    const { email, password, name, phone } = req.body; // Destructure new fields

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new UserModel({
      email,
      password,
      name,  // Save Name
      phone, // Save Phone
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
module.exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    let user = await UserModel.findOne({ email });
    
    // 1. AUTO-CREATE ACCOUNT IF IT DOESN'T EXIST
    if (!user) {
      user = new UserModel({
        email,
        password: "OTP_LOGIN_DEFAULT", 
        name: email.split('@')[0],     
        phone: "Not Provided",
        walletBalance: 100000          
      });
    }

    // 2. GENERATE A 6-DIGIT OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save to database with a 10-minute expiration
    user.otp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000; 
    await user.save();

    console.log(`\n🔑 [TESTING] OTP for ${email} is: ${otp}\n`);

    // 3. ACTUALLY SEND THE EMAIL TO THE NEW USER
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your Kite Login OTP',
            text: `Welcome to Kite! Your login OTP is ${otp}. It is valid for 10 minutes.`
        });
        console.log(`Email successfully sent to ${email}`);
    } catch (emailErr) {
        console.log("Email failed to send. Check your .env EMAIL_USER and EMAIL_PASS.");
    }

    // Tell the frontend to show the OTP entry screen
    res.json({ message: "OTP sent successfully! Check your email." });
    
  } catch (error) {
    res.status(500).json({ message: "Error generating OTP", error: error.message });
  }
};
// 2. VERIFY OTP AND LOGIN
module.exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await UserModel.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if OTP matches and is not expired
    if (user.otp !== otp || user.otpExpiry < Date.now()) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Clear the OTP from DB so it can't be reused
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    // Create Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({ 
        message: "Logged in successfully", 
        token, 
        walletBalance: user.walletBalance 
    });
  } catch (error) {
    res.status(500).json({ message: "Error verifying OTP", error: error.message });
  }
};