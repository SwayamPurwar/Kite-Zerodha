require("dotenv").config();
const mongoose = require("mongoose");

// Import your models
const HoldingsModel = require("./src/models/HoldingsModel");
const OrdersModel = require("./src/models/OrdersModel");
const UserModel = require("./src/models/UserModel");

const DB_URL = process.env.MONGO_URL; 

mongoose.connect(DB_URL)
    .then(() => console.log("🔌 Connected to MongoDB!"))
    .catch((err) => {
        console.error("❌ Database connection error:", err);
        process.exit(1);
    });

const wipeDatabase = async () => {
    try {
        console.log("🗑️  Wiping database collections...");

        // Delete all documents from all collections
        await HoldingsModel.deleteMany({});
        await OrdersModel.deleteMany({});
        await UserModel.deleteMany({});

        console.log("✅ Database completely cleared! You are starting fresh.");
    } catch (error) {
        console.error("❌ Error clearing database:", error);
    } finally {
        // Close the connection so the script exits automatically
        mongoose.connection.close();
    }
};

wipeDatabase();