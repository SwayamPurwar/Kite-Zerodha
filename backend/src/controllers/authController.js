const UserModel = require("../models/UserModel");
const TempUser = require("../models/TempUserModel");
const jwt = require("jsonwebtoken");
const twilio = require("twilio");
const bcrypt = require("bcryptjs"); // Used for checking passwords securely

// ==========================================
// TWILIO INITIALIZATION
// ==========================================
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
        textContent: textContent,
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
// 1. SIGNUP (Creates TempUser and sends OTP)
// ==========================================
module.exports.signup = async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    
    // Check if user already exists in Permanent DB
    const existingUser = await UserModel.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) return res.status(400).json({ message: "Account already exists." });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save user details + plain text password to Temp DB 
    // (Password will be hashed later in verifyOtp before saving to Permanent DB)
    await TempUser.findOneAndUpdate(
      { email }, 
      { email, password, name, phone, otp, createdAt: Date.now() }, 
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );

    console.log(`\n🔑 [SIGNUP] OTP FOR ${name}: ${otp}\n`);

    // Send Email via Brevo
    sendEmailBrevo(
        email, 
        'Verify your Kite Account', 
        `Hello ${name}, your signup OTP is: ${otp}`,
        `<p>Hello ${name}, your signup OTP is: <strong>${otp}</strong></p>`
    );

    // Send SMS via Twilio
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

// ==========================================
// 2. VERIFY OTP (Finalizes Signup ONLY)
// ==========================================
module.exports.verifyOtp = async (req, res) => {
  try {
    const { identifier, otp } = req.body;

    // Find the temporary user
    const tempUser = await TempUser.findOne({
      $or: [{ email: identifier }, { phone: identifier }]
    });

    if (tempUser) {
      // Check if OTP matches
      if (tempUser.otp === otp) {
        
        // HASH THE PASSWORD BEFORE SAVING TO PERMANENT DB
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(tempUser.password, salt);

        // Move to Permanent Database
        const newUser = new UserModel({
          email: tempUser.email,
          password: hashedPassword, // Save the encrypted password
          name: tempUser.name,
          phone: tempUser.phone,
          walletBalance: 100000 
        });
        
        await newUser.save();
        await TempUser.deleteOne({ _id: tempUser._id });

        // Generate Token
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

// ==========================================
// 3. LOGIN (Uses Password instead of OTP)
// ==========================================
module.exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body; 
    
    // Find user by Email OR Phone
    const user = await UserModel.findOne({
      $or: [{ email: identifier }, { phone: identifier }]
    });

    if (!user) return res.status(404).json({ message: "Account not found." });

    // Compare entered password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
        return res.status(400).json({ message: "Invalid password." });
    }

    // Optional: Send Login Alert to Email
    sendLoginAlert(user);

    // Generate Token and Login
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ message: "Login success!", token, walletBalance: user.walletBalance });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Error" });
  }
};

// ==========================================
// HELPER: SEND LOGIN ALERT
// ==========================================
async function sendLoginAlert(user) {
  const loginTime = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  sendEmailBrevo(
      user.email, 
      '⚠️ Login Alert', 
      `New login detected at ${loginTime}.`,
      `<p>New login detected at ${loginTime}.</p>`
  );
}