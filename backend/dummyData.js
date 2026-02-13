require("dotenv").config();
const mongoose = require("mongoose");
const HoldingsModel = require("./src/models/HoldingsModel");
const OrdersModel = require("./src/models/OrdersModel");

const DB_URL = process.env.MONGO_URL; // Or use your hardcoded string if env failed

mongoose.connect(DB_URL)
    .then(() => console.log("DB Connected!"))
    .catch((err) => console.log(err));

// Existing Holdings Data
const tempHoldings = [
  { name: "BHARTIARTL", qty: 2, avg: 538.05, price: 541.15, net: "+0.58%", day: "+2.99%" },
  { name: "HDFCBANK", qty: 2, avg: 1383.4, price: 1522.35, net: "+10.04%", day: "+0.11%" },
  { name: "RELIANCE", qty: 1, avg: 2331.5, price: 2343.25, net: "+0.50%", day: "+0.21%" },
  { name: "TCS", qty: 1, avg: 3225.05, price: 3384.75, net: "+4.95%", day: "-0.24%" },
  { name: "WIPRO", qty: 4, avg: 489.3, price: 577.75, net: "+18.08%", day: "+0.32%" },
];

// NEW: Orders Data
const tempOrders = [
  { name: "INFY", qty: 4, price: 1555.5, mode: "BUY" },
  { name: "TATASTEEL", qty: 10, price: 120.5, mode: "SELL" },
];

const seedDB = async () => {
    try {
        await HoldingsModel.deleteMany({}); // Clear old data
        await OrdersModel.deleteMany({});   // Clear old orders
        
        await HoldingsModel.insertMany(tempHoldings);
        await OrdersModel.insertMany(tempOrders);
        
        console.log("Holdings & Orders Seeded Successfully!");
    } catch (e) {
        console.log(e);
    } finally {
        mongoose.connection.close();
    }
};

seedDB();