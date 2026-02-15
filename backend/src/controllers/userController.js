const UserModel = require("../models/UserModel");
const TransactionModel = require("../models/TransactionModel");
const HoldingsModel = require("../models/HoldingsModel"); // <--- YOU MISSED THIS IMPORT

module.exports.updateFunds = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id;

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate Withdrawal
    if (amount < 0 && user.walletBalance + amount < 0) {
      return res
        .status(400)
        .json({ message: "Insufficient funds to withdraw" });
    }

    // Update Balance
    user.walletBalance += Number(amount); 
    await user.save();

    // Create Transaction Record
    try {
      await TransactionModel.create({
        userId,
        type: amount > 0 ? "DEPOSIT" : "WITHDRAWAL",
        amount: Math.abs(amount),
        transactionId: "TXN" + Date.now() + Math.floor(Math.random() * 1000),
      });
    } catch (txnError) {
      console.error("Transaction History Error:", txnError);
    }

    res.json({
      message: "Funds updated successfully",
      newBalance: user.walletBalance,
    });
  } catch (error) {
    console.error("Update Funds Error:", error);
    res
      .status(500)
      .json({ message: "Error updating funds", error: error.message });
  }
};

module.exports.getTransactions = async (req, res) => {
  try {
    const transactions = await TransactionModel.find({
      userId: req.user.id,
    }).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    console.error("Get Transactions Error:", error);
    res
      .status(500)
      .json({ message: "Error fetching transactions", error: error.message });
  }
};

module.exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Fetch User
    const user = await UserModel.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Fetch Holdings to calculate Used Margin
    // This line works now because we imported HoldingsModel at the top
    const holdings = await HoldingsModel.find({ userId });
    
    // Calculate total invested amount (Used Margin)
    const usedMargin = holdings.reduce((total, stock) => {
        return total + (stock.qty * stock.avg);
    }, 0);

    // Send both user data and the calculated margin
    res.json({ 
        ...user.toObject(), 
        usedMargin: usedMargin 
    });

  } catch (error) {
    console.error("Profile Error:", error);
    res.status(500).json({ message: "Error fetching profile", error });
  }
};

module.exports.updateAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;
    const userId = req.user.id;
    if (!avatar) return res.status(400).json({ message: "No image provided" });
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { avatar: avatar },
      { returnDocument: "after" } 
    ).select("-password");
    res.json({ message: "Profile picture updated successfully!", user });
  } catch (error) {
    res.status(500).json({ message: "Error updating avatar", error });
  }
};

module.exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const userId = req.user.id;

    // Find the user and update their name and phone
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { name, phone },
      { returnDocument: "after" } // [FIX] Updated
    ).select("-password");

    res.json({ message: "Profile updated successfully!", user: updatedUser });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: "Error updating profile", error: error.message });
  }
};