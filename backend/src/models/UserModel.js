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
  name: {
    type: String,
    required: [true, "Your name is required"],
  },
  phone: {
    type: String,
    required: [true, "Phone number is required"],
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

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model("User", UserSchema);