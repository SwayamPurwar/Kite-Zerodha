const OrdersModel = require("../models/OrdersModel");
const HoldingsModel = require("../models/HoldingsModel");
const UserModel = require("../models/UserModel");
const { getMarketPrice } = require("./marketController"); // <-- Import live price helper

module.exports.createNewOrder = async (req, res) => {
  try {
    const { name, qty, price, mode } = req.body;
    const userId = req.user.id;
    let quantity = Number(qty);
    let requestedPrice = Number(price);
    let totalCost = quantity * requestedPrice;

    // Get the exact price at this millisecond
    const livePrice = getMarketPrice(name);
    if (!livePrice) return res.status(400).json({ message: "Invalid stock symbol" });

    const user = await UserModel.findById(userId);
    let existingHolding = await HoldingsModel.findOne({ name, userId });

    // 1. DETERMINE ORDER STATUS (Limit order logic)
    let isPending = false;
    if (mode === "BUY" && requestedPrice < livePrice) isPending = true;
    if (mode === "SELL" && requestedPrice > livePrice) isPending = true;

    // 2. PROCESS BUY
    if (mode === "BUY") {
      if (user.walletBalance < totalCost) {
        return res.status(400).json({ message: "Insufficient funds." });
      }
      
      // We deduct money immediately to BLOCK the margin, even if the order is pending!
      user.walletBalance -= totalCost;
      await user.save();

      if (!isPending) {
        // Execute immediately: Update Holdings
        if (existingHolding) {
          let totalOldCost = existingHolding.qty * existingHolding.avg;
          let newTotalQty = existingHolding.qty + quantity;
          let newAvgPrice = (totalOldCost + totalCost) / newTotalQty;

          existingHolding.qty = newTotalQty;
          existingHolding.avg = newAvgPrice;
          await existingHolding.save();
        } else {
          const newHolding = new HoldingsModel({
            userId, name, qty: quantity, avg: requestedPrice, price: livePrice, net: "0.00%", day: "0.00%", isLoss: false
          });
          await newHolding.save();
        }
      }
    } 
    
    // 3. PROCESS SELL
    else if (mode === "SELL") {
      if (!existingHolding || existingHolding.qty < quantity) {
        return res.status(400).json({ message: "Insufficient shares." });
      }

      // We deduct the shares immediately to BLOCK them from being sold twice!
      if (existingHolding.qty === quantity) {
        await HoldingsModel.deleteOne({ _id: existingHolding._id });
      } else {
        existingHolding.qty -= quantity;
        await existingHolding.save();
      }

      if (!isPending) {
        // Execute immediately: Add money to wallet
        user.walletBalance += totalCost;
        await user.save();
      }
    }

    // 4. SAVE THE ORDER
    const status = isPending ? "Pending" : "Executed";
    const newOrder = new OrdersModel({
      userId, name, qty: quantity, price: requestedPrice, mode, status
    });
    await newOrder.save();

    res.json({ 
      message: `Order placed! Status: ${status}`, 
      newOrder, 
      newBalance: user.walletBalance 
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error executing order", error });
  }
};