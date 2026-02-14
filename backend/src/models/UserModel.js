const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email address is required"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  walletBalance: {
    type: Number,
    default: 100000,
  },
  avatar: {
    type: String,
    default: "", 
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

// FIXED: Removed 'next' parameter. 
// The async function returns a promise, which Mongoose waits for automatically.
UserSchema.pre("save", async function () {
  // If password is not modified, return early (resolves the promise)
  if (!this.isModified("password")) {
    return;
  }
  
  // Hashing logic
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model("User", UserSchema);