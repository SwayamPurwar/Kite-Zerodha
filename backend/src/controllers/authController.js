const UserModel = require("../models/UserModel");
const TempUser = require("../models/TempUserModel");
const jwt = require("jsonwebtoken");
const twilio = require("twilio");

// Initialize Twilio
let twilioClient;
try {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
} catch (error) {
  console.log("⚠️ Twilio configuration is invalid.");
}

// ==========================================
// BREVO HTTP EMAIL HELPER FUNCTION
// ==========================================
async function sendEmailBrevo(toEmail, subject, textContent, htmlContent) {
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { email: process.env.EMAIL_USER, name: 'Kite Zerodha' }, 
        to: [{ email: toEmail }], 
        subject: subject,
        textContent: textContent, // Added for spam filter bypass
        htmlContent: htmlContent
      })
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(JSON.stringify(data));
    console.log(`✅ Email sent to ${toEmail} via Brevo`);
  } catch (error) {
    console.error("❌ Email failed:", error.message);
  }
}
// ==========================================

/**
 * 1. SIGNUP
 */
module.exports.signup = async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    
    const existingUser = await UserModel.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) return res.status(400).json({ message: "Account already exists." });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await TempUser.findOneAndUpdate(
      { email }, 
      { email, password, name, phone, otp, createdAt: Date.now() }, 
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );

    console.log(`\n🔑 [SIGNUP] OTP FOR ${name}: ${otp}\n`);

    // Send via Brevo API (includes plain text and HTML)
    sendEmailBrevo(
        email, 
        'Verify your Kite Account', 
        `Hello ${name}, your signup OTP is: ${otp}`, // Text version
        `<p>Hello ${name}, your signup OTP is: <strong>${otp}</strong></p>` // HTML version
    );

    if (twilioClient) {
      twilioClient.messages.create({
          body: `Kite Signup OTP: ${otp}`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: `+91${phone}`
      }).then(() => console.log(`✅ SMS sent to ${phone}`))
        .catch(() => console.log("❌ SMS failed."));
    }

    res.status(201).json({ message: "OTP sent! Check your email." });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Signup failed", error: error.message });
  }
};

/**
 * 2. SEND OTP (LOGIN ONLY)
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

    // Send via Brevo API
    sendEmailBrevo(
        user.email, 
        'Your Kite Login OTP', 
        `Hello ${user.name}, your login code is: ${otp}`,
        `<p>Hello ${user.name}, your login code is: <strong>${otp}</strong></p>`
    );

    res.json({ message: "OTP sent successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Internal Error" });
  }
};

/**
 * 3. VERIFY OTP
 */
module.exports.verifyOtp = async (req, res) => {
  try {
    const { identifier, otp } = req.body;

    let user = await UserModel.findOne({
      $or: [{ email: identifier }, { phone: identifier }]
    });

    if (user) {
      if (user.otp === otp && user.otpExpiry > Date.now()) {
        user.otp = null;
        user.otpExpiry = null;
        await user.save();
        
        sendLoginAlert(user);

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
        return res.json({ message: "Login success!", token, walletBalance: user.walletBalance });
      } else {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }
    }

    const tempUser = await TempUser.findOne({
      $or: [{ email: identifier }, { phone: identifier }]
    });

    if (tempUser) {
      if (tempUser.otp === otp) {
        const newUser = new UserModel({
          email: tempUser.email,
          password: tempUser.password,
          name: tempUser.name,
          phone: tempUser.phone,
          walletBalance: 100000 
        });
        
        await newUser.save();
        await TempUser.deleteOne({ _id: tempUser._id });

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
  const loginTime = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  sendEmailBrevo(
      user.email, 
      '⚠️ Login Alert', 
      `New login detected at ${loginTime}.`,
      `<p>New login detected at ${loginTime}.</p>`
  );
}