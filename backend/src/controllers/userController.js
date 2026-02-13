const UserModel = require("../models/UserModel");

module.exports.updateFunds = async (req, res) => {
  try {
    const { amount } = req.body; 
    const userId = req.user.id; 

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (amount < 0 && user.walletBalance + amount < 0) {
      return res.status(400).json({ message: "Insufficient funds to withdraw" });
    }

    user.walletBalance += amount;
    await user.save();

    res.json({ message: "Funds updated successfully", newBalance: user.walletBalance });
  } catch (error) {
    res.status(500).json({ message: "Error updating funds", error });
  }
};

module.exports.getUserProfile = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile", error });
  }
};

// NEW: Update user avatar
module.exports.updateAvatar = async (req, res) => {
  try {
    const { avatar } = req.body; 
    const userId = req.user.id;

    if (!avatar) return res.status(400).json({ message: "No image provided" });

    const user = await UserModel.findByIdAndUpdate(
      userId, 
      { avatar: avatar }, 
      { new: true }
    ).select("-password");

    res.json({ message: "Profile picture updated successfully!", user });
  } catch (error) {
    res.status(500).json({ message: "Error updating avatar", error });
  }
};