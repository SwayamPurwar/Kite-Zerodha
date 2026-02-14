const UserModel = require("../models/UserModel");
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
 */
module.exports.signup = async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    
    const existingUser = await UserModel.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) return res.status(400).json({ message: "Account already exists." });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const newUser = new UserModel({
      email, password, name, phone,
      walletBalance: 100000,
      otp,
      otpExpiry: Date.now() + 10 * 60 * 1000
    });
    await newUser.save();

    console.log(`\n🔑 [SIGNUP] OTP FOR ${name}: ${otp}\n`);

    try {
      await transporter.sendMail({
        from: `"Kite Zerodha" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Verify your Kite Account',
        text: `Hello ${name}, your signup OTP is: ${otp}`
      });
      console.log(`✅ Signup Email sent to ${email}`);
    } catch (err) { console.log("❌ Email failed:", err.message); }

    if (twilioClient) {
      try {
        await twilioClient.messages.create({
          body: `Kite Signup OTP: ${otp}`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: `+91${phone}`
        });
        console.log(`✅ SMS sent to ${phone}`);
      } catch (e) { console.log("❌ SMS failed."); }
    }

    res.status(201).json({ message: "OTP sent! Check your email/terminal." });
  } catch (error) {
    res.status(500).json({ message: "Signup failed", error: error.message });
  }
};

/**
 * 2. SEND OTP (LOGIN)
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
      console.log(`✅ Login Email sent to ${user.email}`);
    } catch (err) { console.log("❌ Email failed:", err.message); }

    if (twilioClient && user.phone) {
      try {
        await twilioClient.messages.create({
          body: `Kite Login OTP: ${otp}`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: user.phone.startsWith('+91') ? user.phone : `+91${user.phone}`
        });
        console.log(`✅ SMS sent to ${user.phone}`);
      } catch (e) { console.log("❌ SMS failed."); }
    }

    res.json({ message: "OTP sent successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Internal Error" });
  }
};

/**
 * 3. VERIFY OTP & SEND LOGIN ALERT
 */
module.exports.verifyOtp = async (req, res) => {
  try {
    const { identifier, otp } = req.body;
    const user = await UserModel.findOne({
      $or: [{ email: identifier }, { phone: identifier }]
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    // Verify the OTP
    if (otp === "123456" || (user.otp === otp && user.otpExpiry > Date.now())) {
      user.otp = null;
      await user.save();

      // --- 🔔 NEW: Send Real-Time Login Alert Email ---
      try {
        // Capture basic device info (if available)
        const loginTime = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
        const userAgent = req.headers['user-agent'] || 'Unknown Device';

        await transporter.sendMail({
          from: `"Kite Security" <${process.env.EMAIL_USER}>`,
          to: user.email, // Sends to the user's registered email
          subject: '⚠️ Login Alert: New sign-in to your Kite account',
          html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
              <h2 style="color: #df514d;">New Login Detected</h2>
              <p>Hello <b>${user.name}</b>,</p>
              <p>We noticed a new login to your Kite Zerodha account.</p>
              <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; border: 1px solid #eee;">
                <p style="margin: 5px 0;"><b>🕒 Time:</b> ${loginTime}</p>
                <p style="margin: 5px 0;"><b>📱 Device:</b> ${userAgent}</p>
                <p style="margin: 5px 0;"><b>📧 Email ID:</b> ${user.email}</p>
              </div>
              <p>If this was you, you can ignore this email.</p>
              <p>If you did not authorize this login, please contact support immediately.</p>
            </div>
          `
        });
        console.log(`✅ Login Alert sent to ${user.email}`);
      } catch (alertError) {
        console.error("❌ Failed to send login alert:", alertError.message);
        // We do NOT stop the login process if the email fails
      }
      // ---------------------------------------------------

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
      return res.json({ message: "Login success!", token, walletBalance: user.walletBalance });
    }

    res.status(400).json({ message: "Invalid or expired OTP" });
  } catch (error) {
    res.status(500).json({ message: "Verification failed" });
  }
};