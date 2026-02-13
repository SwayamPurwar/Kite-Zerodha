const OrdersModel = require("../models/OrdersModel");
const HoldingsModel = require("../models/HoldingsModel");
const UserModel = require("../models/UserModel");

// Base market data
let marketData = [
  { name: "INFY", price: 1555.45, percent: "-1.60%", isDown: true },
  { name: "ONGC", price: 116.80, percent: "-0.09%", isDown: true },
  { name: "TCS", price: 3194.80, percent: "-0.25%", isDown: true },
  { name: "KPITTECH", price: 266.60, percent: "+3.54%", isDown: false },
  { name: "QUICKHEAL", price: 308.55, percent: "-0.15%", isDown: true },
  { name: "WIPRO", price: 577.75, percent: "+0.32%", isDown: false },
];

// NEW HELPER: Get the exact live price of a stock at this millisecond
module.exports.getMarketPrice = (symbol) => {
  const stock = marketData.find(s => s.name === symbol);
  return stock ? stock.price : null;
};

// Fallback HTTP route
module.exports.getLivePrices = (req, res) => {
  res.json(marketData);
};

// SOCKET.IO & BACKGROUND ORDER MATCHING ENGINE
module.exports.startMarketEngine = (io) => {
  // We use async here because we are interacting with the database
  setInterval(async () => {
    // 1. FLUCTUATE PRICES
    marketData = marketData.map(stock => {
      const volatility = (Math.random() * 4 - 2); 
      const newPrice = stock.price + volatility;
      const isDown = newPrice < stock.price;
      const percentChange = ((volatility / stock.price) * 100).toFixed(2);
      
      return {
        ...stock,
        price: parseFloat(newPrice.toFixed(2)),
        percent: `${percentChange > 0 ? '+' : ''}${percentChange}%`,
        isDown: isDown
      };
    });
    
    // Broadcast live prices to the frontend
    io.emit("market-data", marketData);

    // 2. BACKGROUND MATCHING ENGINE (Check Pending Orders)
    try {
      // Find all orders that are waiting to be executed
      const pendingOrders = await OrdersModel.find({ status: "Pending" });

      for (let order of pendingOrders) {
        const stock = marketData.find(s => s.name === order.name);
        if (!stock) continue;

        let executed = false;

        // BUY LIMIT ORDER LOGIC: Execute if the live market drops to or below the requested price
        if (order.mode === "BUY" && stock.price <= order.price) {
          let existingHolding = await HoldingsModel.findOne({ name: order.name, userId: order.userId });
          
          if (existingHolding) {
            let totalOldCost = existingHolding.qty * existingHolding.avg;
            let newTotalQty = existingHolding.qty + order.qty;
            let newAvgPrice = (totalOldCost + (order.qty * order.price)) / newTotalQty;

            existingHolding.qty = newTotalQty;
            existingHolding.avg = newAvgPrice;
            await existingHolding.save();
          } else {
            const newHolding = new HoldingsModel({
              userId: order.userId, name: order.name, qty: order.qty, avg: order.price, 
              price: stock.price, net: "0.00%", day: "0.00%", isLoss: false
            });
            await newHolding.save();
          }
          executed = true;
        }
        
        // SELL LIMIT ORDER LOGIC: Execute if the live market rises to or above the requested price
        else if (order.mode === "SELL" && stock.price >= order.price) {
          let user = await UserModel.findById(order.userId);
          if (user) {
            user.walletBalance += (order.qty * order.price); // Add funds to user
            await user.save();
          }
          executed = true;
        }

        // If conditions met, mark order as executed!
        if (executed) {
          order.status = "Executed";
          await order.save();
        }
      }
    } catch (err) {
      console.error("Matching engine error:", err);
    }
  }, 2000);
};

// History Generator (Unchanged)
module.exports.getHistoricalData = (req, res) => {
    const symbol = req.params.symbol;
    const stock = marketData.find(s => s.name === symbol);
    let currentPrice = stock ? stock.price : 1000;
    const data = [];
    const now = new Date();
    
    for (let i = 100; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const open = currentPrice;
      const volatility = (Math.random() * 20 - 10);
      const close = open + volatility;
      const high = Math.max(open, close) + (Math.random() * 5);
      const low = Math.min(open, close) - (Math.random() * 5);
      
      data.push({
        time: date.toISOString().split('T')[0],
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
      });
      currentPrice = close;
    }
    res.json(data);
};