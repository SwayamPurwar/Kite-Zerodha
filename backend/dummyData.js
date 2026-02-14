require("dotenv").config();
const mongoose = require("mongoose");
const HoldingsModel = require("./src/models/HoldingsModel");
const OrdersModel = require("./src/models/OrdersModel");
const UserModel = require("./src/models/UserModel");

const DB_URL = process.env.MONGO_URL; 

mongoose.connect(DB_URL)
    .then(() => console.log("DB Connected!"))
    .catch((err) => console.log(err));

const seedDB = async () => {
    try {
        await HoldingsModel.deleteMany({}); 
        await OrdersModel.deleteMany({});   
        // We do NOT delete users here usually, but for this fix, we should ensures clean state
        // If you want to keep users, you'd have to manually update them. 
        // For dev, it's easier to create a fresh valid user.
        await UserModel.deleteMany({ email: "test@zerodha.com" });

        let dummyUser = new UserModel({
            email: "test@zerodha.com",
            password: "password123", 
            name: "Test User", // Added Name
            phone: "9999999999", // Added Phone
            walletBalance: 100000
        });
        
        await dummyUser.save();

        const tempHoldings = [
          { userId: dummyUser._id, name: "BHARTIARTL", qty: 2, avg: 538.05, price: 541.15, net: "+0.58%", day: "+2.99%" },
          { userId: dummyUser._id, name: "HDFCBANK", qty: 2, avg: 1383.4, price: 1522.35, net: "+10.04%", day: "+0.11%" },
          { userId: dummyUser._id, name: "RELIANCE", qty: 1, avg: 2331.5, price: 2343.25, net: "+0.50%", day: "+0.21%" },
          { userId: dummyUser._id, name: "TCS", qty: 1, avg: 3225.05, price: 3384.75, net: "+4.95%", day: "-0.24%" },
          { userId: dummyUser._id, name: "WIPRO", qty: 4, avg: 489.3, price: 577.75, net: "+18.08%", day: "+0.32%" },
        ];

        const tempOrders = [
          { userId: dummyUser._id, name: "INFY", qty: 4, price: 1555.5, mode: "BUY", status: "Pending" },
          { userId: dummyUser._id, name: "TATASTEEL", qty: 10, price: 120.5, mode: "SELL", status: "Pending" },
        ];

        await HoldingsModel.insertMany(tempHoldings);
        await OrdersModel.insertMany(tempOrders);
        
        console.log("Holdings & Orders Seeded Successfully for user test@zerodha.com!");
    } catch (e) {
        console.log("Error Seeding Data:", e);
    } finally {
        mongoose.connection.close();
    }
};

seedDB();