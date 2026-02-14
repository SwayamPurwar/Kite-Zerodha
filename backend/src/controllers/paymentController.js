const Razorpay = require("razorpay");
const crypto = require("crypto");
const UserModel = require("../models/UserModel");
const TransactionModel = require("../models/TransactionModel");

// Initialize Razorpay
// ⚠️ IMPORTANT: Ensure these keys are in your backend .env file
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID, 
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 1. Create Order (Deposit)
module.exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount < 1) return res.status(400).json({ message: "Invalid amount" });

    const options = {
      amount: amount * 100, // Amount in paise (e.g., 500 INR = 50000 paise)
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error("Razorpay Error:", error);
    res.status(500).json({ message: "Failed to create order" });
  }
};

// 2. Verify Payment (Deposit)
module.exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;
    const userId = req.user.id;

    // Verify Signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      // ✅ Payment Verified: Add Funds
      const user = await UserModel.findById(userId);
      user.walletBalance += parseFloat(amount);
      await user.save();

      // Log Transaction
      await TransactionModel.create({
        userId,
        type: "DEPOSIT",
        amount,
        transactionId: razorpay_payment_id,
        status: "COMPLETED"
      });

      res.json({ message: "Payment successful", newBalance: user.walletBalance });
    } else {
      res.status(400).json({ message: "Invalid signature" });
    }
  } catch (error) {
    console.error("Verify Error:", error);
    res.status(500).json({ message: "Payment verification failed" });
  }
};

// 3. Withdraw Funds
module.exports.withdrawFunds = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id;

    const user = await UserModel.findById(userId);

    if (user.walletBalance < amount) {
      return res.status(400).json({ message: "Insufficient funds" });
    }

    user.walletBalance -= parseFloat(amount);
    await user.save();

    await TransactionModel.create({
      userId,
      type: "WITHDRAW",
      amount,
      transactionId: `WD_${Date.now()}`,
      status: "COMPLETED"
    });

    res.json({ message: "Withdrawal successful", newBalance: user.walletBalance });
  } catch (error) {
    res.status(500).json({ message: "Withdrawal failed" });
  }
};

// 4. Get Transaction History
module.exports.getTransactions = async (req, res) => {
  try {
    const transactions = await TransactionModel.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching transactions" });
  }
};