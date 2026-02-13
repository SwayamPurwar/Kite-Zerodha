const HoldingsModel = require("../models/HoldingsModel");

module.exports.getAllHoldings = async (req, res) => {
  try {
    // req.user.id comes from our authMiddleware
    const userId = req.user.id; 
    
    // Only fetch holdings that belong to THIS specific user
    const allHoldings = await HoldingsModel.find({ userId: userId });
    
    res.json(allHoldings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching holdings", error });
  }
};