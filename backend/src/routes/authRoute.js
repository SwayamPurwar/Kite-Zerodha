const express = require("express");
const router = express.Router();
const { signup, verifyOtp, login } = require("../controllers/authController");

// Signup Route (Generates OTP)
router.post("/signup", signup);

// Verify OTP Route (Finalizes Signup ONLY)
router.post("/verify-otp", verifyOtp);

// Login Route (Uses Password, NO OTP)
router.post("/login", login);

module.exports = router;