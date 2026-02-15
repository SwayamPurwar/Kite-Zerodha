const mongoose = require("mongoose");

const TempUserSchema = new mongoose.Schema({
  email: { type: String, required: true },
  phone: { type: String, required: true },
  name: { type: String, required: true },
  password: { type: String, required: true }, // Store hashed password if you are hashing
  otp: { type: String, required: true },
  // 💡 TTL INDEX: Automatically deletes this document 10 minutes after creation
  createdAt: { type: Date, default: Date.now, expires: 600 } 
});

module.exports = mongoose.model("TempUser", TempUserSchema);