const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { 
    type: String, 
    enum: ["DEPOSIT", "WITHDRAW"], 
    required: true 
  },
  amount: { type: Number, required: true },
  transactionId: { type: String, required: true }, // Razorpay Payment ID or Withdrawal ID
  status: { type: String, default: "COMPLETED" },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Transaction", TransactionSchema);