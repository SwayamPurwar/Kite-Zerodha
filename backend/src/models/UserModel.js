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
    default: "", // Stores the Base64 image string
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next(); // Move next() inside the try block
  } catch (error) {
    next(error); // Pass error to the next middleware
  }
});
module.exports = mongoose.model("User", UserSchema);