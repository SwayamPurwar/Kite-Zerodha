const mongoose = require("mongoose");

const OrdersSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: String,
    qty: Number,
    price: Number,
    mode: String,
    status: { type: String, default: "Pending" } // <-- NEW: "Pending", "Executed", or "Rejected"
}, { timestamps: true }); // Adding timestamps so we know when the order was placed

module.exports = mongoose.model("Order", OrdersSchema);