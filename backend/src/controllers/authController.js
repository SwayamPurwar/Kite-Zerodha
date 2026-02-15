const UserModel = require("../models/UserModel");
const TempUser = require("../models/TempUserModel"); // Import the new model
const jwt = require("jsonwebtoken");
const twilio = require("twilio");
const nodemailer = require("nodemailer");

// 1. Initialize Nodemailer (Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// 2. Initialize Twilio
let twilioClient;
try {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
} catch (error) {
  console.log("⚠️ Twilio configuration is invalid.");
}

/**
 * 1. SIGNUP
 * Saves data to "TempUser" (Temporary Collection).
 * Data automatically vanishes in 10 mins if not verified.
 */
module.exports.signup = async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    
    // Check if user already exists
    const existingUser = await UserModel.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) return res.status(400).json({ message: "Account already exists." });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save to DB
    await TempUser.findOneAndUpdate(
      { email }, 
      { email, password, name, phone, otp, createdAt: Date.now() }, 
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );

    console.log(`\n🔑 [SIGNUP] OTP FOR ${name}: ${otp}\n`);

    // [FIX] REMOVED 'await' so the code doesn't freeze here
    transporter.sendMail({
      from: `"Kite Zerodha" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify your Kite Account',
      text: `Hello ${name}, your signup OTP is: ${otp}`
    }).then(() => {
        console.log(`✅ Signup Email sent to ${email}`);
    }).catch((err) => {
        console.log("❌ Email failed:", err.message);
    });

    // Send SMS (Non-blocking)
    if (twilioClient) {
      twilioClient.messages.create({
          body: `Kite Signup OTP: ${otp}`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: `+91${phone}`
      }).then(() => console.log(`✅ SMS sent to ${phone}`))
        .catch(() => console.log("❌ SMS failed."));
    }

    // [FIX] Send response IMMEDIATELY
    res.status(201).json({ message: "OTP sent! Check your email." });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Signup failed", error: error.message });
  }
};
/**
 * 2. SEND OTP (LOGIN ONLY)
 * Only generates OTP for users who are already verified/permanent.
 */
module.exports.sendOtp = async (req, res) => {
  try {
    const { identifier } = req.body; 
    
    const user = await UserModel.findOne({
      $or: [{ email: identifier }, { phone: identifier }]
    });

    if (!user) return res.status(404).json({ message: "Account not found." });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();

    console.log(`\n🔑 [LOGIN] OTP FOR ${user.name}: ${otp}\n`);

    try {
      await transporter.sendMail({
        from: `"Kite Zerodha" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Your Kite Login OTP',
        text: `Hello ${user.name}, your login code is: ${otp}`
      });
    } catch (err) { console.log("❌ Email failed:", err.message); }

    // SMS logic omitted for brevity (same as signup)

    res.json({ message: "OTP sent successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Internal Error" });
  }
};

/**
 * 3. VERIFY OTP (HANDLES BOTH SIGNUP AND LOGIN)
 * Checks Permanent DB first (Login), then Temp DB (Signup).
 */
module.exports.verifyOtp = async (req, res) => {
  try {
    const { identifier, otp } = req.body;

    // --- CASE A: LOGIN VERIFICATION (User exists in Permanent DB) ---
    let user = await UserModel.findOne({
      $or: [{ email: identifier }, { phone: identifier }]
    });

    if (user) {
      if (user.otp === otp && user.otpExpiry > Date.now()) {
        user.otp = null;
        user.otpExpiry = null;
        await user.save();
        
        // Send Alert
        sendLoginAlert(user);

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
        return res.json({ message: "Login success!", token, walletBalance: user.walletBalance });
      } else {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }
    }

    // --- CASE B: SIGNUP VERIFICATION (User is in Temp DB) ---
    const tempUser = await TempUser.findOne({
      $or: [{ email: identifier }, { phone: identifier }]
    });

    if (tempUser) {
      if (tempUser.otp === otp) {
        // 1. Move data from TempUser to UserModel (PERMANENT SAVE)
        const newUser = new UserModel({
          email: tempUser.email,
          password: tempUser.password,
          name: tempUser.name,
          phone: tempUser.phone,
          walletBalance: 100000 // Default balance
        });
        
        await newUser.save();

        // 2. DELETE the temp record immediately
        await TempUser.deleteOne({ _id: tempUser._id });

        // 3. Generate Token
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
        
        return res.json({ 
          message: "Signup successful! Welcome to Kite.", 
          token, 
          walletBalance: newUser.walletBalance 
        });
      } else {
        return res.status(400).json({ message: "Invalid OTP" });
      }
    }

    return res.status(404).json({ message: "User not found or session expired." });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Verification failed" });
  }
};

// Helper function for login alerts
async function sendLoginAlert(user) {
  try {
    const loginTime = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    await transporter.sendMail({
      from: `"Kite Security" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '⚠️ Login Alert',
      html: `<p>New login detected at ${loginTime}.</p>`
    });
  } catch (e) {
    console.error("Alert failed");
  }
}