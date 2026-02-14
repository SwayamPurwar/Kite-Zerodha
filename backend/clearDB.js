require("dotenv").config();
const mongoose = require("mongoose");
const UserModel = require("./src/models/UserModel");
const HoldingsModel = require("./src/models/HoldingsModel");
const OrdersModel = require("./src/models/OrdersModel");
const TransactionModel = require("./src/models/TransactionModel");

const DB_URL = process.env.MONGO_URL;

mongoose.connect(DB_URL)
    .then(() => console.log("DB Connected!"))
    .catch((err) => console.log(err));

const clearDB = async () => {
    try {
        await UserModel.deleteMany({});
        await HoldingsModel.deleteMany({});
        await OrdersModel.deleteMany({});
        await TransactionModel.deleteMany({});
        console.log("All data cleared! You can now signup with a fresh user.");
    } catch (e) {
        console.log("Error clearing data:", e);
    } finally {
        mongoose.connection.close();
    }
};

clearDB();