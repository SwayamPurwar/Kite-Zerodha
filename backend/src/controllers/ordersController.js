const OrdersModel = require("../models/OrdersModel");
const HoldingsModel = require("../models/HoldingsModel");
const UserModel = require("../models/UserModel");
const { getMarketPrice } = require("./marketController");
const { z } = require("zod"); 

// Validation Schema
const orderSchema = z.object({
  name: z.string().min(1),
  qty: z.number().int().positive("Quantity must be a positive integer"),
  price: z.number().positive("Price must be positive"),
  mode: z.enum(["BUY", "SELL"]),
  triggerPrice: z.number().optional(), // New optional field
  orderType: z.enum(["LIMIT", "GTT"]).optional(), // New optional field
});

module.exports.createNewOrder = async (req, res) => {
 
  try {
    // 1. INPUT VALIDATION
    const validation = orderSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ message: validation.error.errors[0].message });
    }

    const { name, qty, price, mode, triggerPrice, orderType } = validation.data;
    const userId = req.user.id;
    const totalCost = qty * price;

    // Get live price
    const livePrice = getMarketPrice(name);
    if (!livePrice) return res.status(400).json({ message: "Invalid stock symbol or market closed" });

    // Determine Status (Limit Order Logic)
    let isPending = false;
    if (mode === "BUY" && price < livePrice) isPending = true;
    if (mode === "SELL" && price > livePrice) isPending = true;

    // 2. PROCESS BUY ORDER (Atomic Transaction Pattern)
    if (mode === "BUY") {
      const user = await UserModel.findOneAndUpdate(
        { _id: userId, walletBalance: { $gte: totalCost } }, 
        { $inc: { walletBalance: -totalCost } },             
        { returnDocument: "after" } // [FIX] Updated                              
      );

      if (!user) {
        return res.status(400).json({ message: "Insufficient funds" });
      }

      if (!isPending) {
        const existingHolding = await HoldingsModel.findOne({ name, userId });
        
        if (existingHolding) {
          const totalOldCost = existingHolding.qty * existingHolding.avg;
          const newTotalQty = existingHolding.qty + qty;
          const newAvgPrice = (totalOldCost + totalCost) / newTotalQty;

          existingHolding.qty = newTotalQty;
          existingHolding.avg = newAvgPrice;
          await existingHolding.save();
        } else {
          await HoldingsModel.create({
            userId, name, qty, avg: price, price: livePrice, 
            net: "0.00%", day: "0.00%", isLoss: false
          });
        }
      }
      
      const newOrder = await OrdersModel.create({
  userId, name, qty, price, mode, 
  status: "Pending", // GTT is always pending initially
  orderType: orderType || "LIMIT",
  triggerPrice: triggerPrice || 0
});

      return res.json({ message: "Buy order placed!", newOrder, newBalance: user.walletBalance });
    } 
    
    // 3. PROCESS SELL ORDER
    else if (mode === "SELL") {
      const holding = await HoldingsModel.findOne({ name, userId });
      
      if (!holding || holding.qty < qty) {
        return res.status(400).json({ message: "Insufficient shares to sell" });
      }

      if (holding.qty === qty) {
        await HoldingsModel.deleteOne({ _id: holding._id });
      } else {
        holding.qty -= qty;
        await holding.save();
      }

      if (!isPending) {
        await UserModel.findByIdAndUpdate(userId, { $inc: { walletBalance: totalCost } });
      }

      const newOrder = await OrdersModel.create({
        userId, name, qty, price, mode, status: isPending ? "Pending" : "Executed"
      });

      const updatedUser = await UserModel.findById(userId);
      
      return res.json({ message: "Sell order placed!", newOrder, newBalance: updatedUser.walletBalance });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error processing order" });
  }
};