require("dotenv").config();
const mongoose = require("mongoose");
const HoldingsModel = require("./src/models/HoldingsModel");
const OrdersModel = require("./src/models/OrdersModel");
const UserModel = require("./src/models/UserModel");

const DB_URL = process.env.MONGODB_URL;

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
        await UserModel.deleteMany({ email: "test@swayamcapital.com" });

        let dummyUser = new UserModel({
            email: "test@swayamcapital.com",
            password: "test@swayamcapital.com", 
            name: "Test User", // Added Name
            phone: "9999999999", // Added Phone
            walletBalance: 130000000
        });
        
        await dummyUser.save();

        const tempHoldings = [
          { userId: dummyUser._id, name: "BHARTIARTL", qty: 200000, avg: 338.05, price: 541.15, net: "+0.58%", day: "+2.99%" },
          { userId: dummyUser._id, name: "HDFCBANK", qty: 200000, avg: 1083.4, price: 1522.35, net: "+10.04%", day: "+0.11%" },
          { userId: dummyUser._id, name: "RELIANCE", qty: 100000, avg: 1331.5, price: 2343.25, net: "+0.50%", day: "+0.21%" },
          { userId: dummyUser._id, name: "TCS", qty: 100000, avg: 2225.05, price: 3384.75, net: "+4.95%", day: "-0.24%" },
          { userId: dummyUser._id, name: "WIPRO", qty: 450000, avg: 400.3, price: 577.75, net: "+18.08%", day: "+0.32%" },
          { userId: dummyUser._id, name: "MRF", qty: 450000, avg: 40000.3, price: 48000.3, net: "+18.08%", day: "+0.32%" },
          { userId: dummyUser._id, name: "OLAELEC", qty: 100000, avg: 40, price: 40, net: "+4.95%", day: "-0.24%" },
           { userId: dummyUser._id, name: "ATHERENERG", qty: 105000, avg: 900, price: 3384.75, net: "+4.95%", day: "-0.24%" },
        ];

        const tempOrders = [
          { userId: dummyUser._id, name: "INFY", qty: 400000, price: 1555.5, mode: "BUY", status: "Pending" },
          { userId: dummyUser._id, name: "TATASTEEL", qty: 100000, price: 120.5, mode: "SELL", status: "Pending" },
        ];

        await HoldingsModel.insertMany(tempHoldings);
        await OrdersModel.insertMany(tempOrders);
        
        console.log("Holdings & Orders Seeded Successfully for user test@swayamcapital.com!");
    } catch (e) {
        console.log("Error Seeding Data:", e);
    } finally {
        mongoose.connection.close();
    }
};

seedDB();