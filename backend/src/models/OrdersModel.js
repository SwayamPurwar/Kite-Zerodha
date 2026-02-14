const mongoose = require("mongoose");

const OrdersSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: String,
    qty: Number,
    price: Number,
    mode: String,
    status: { type: String, default: "Pending" } 
}, { timestamps: true });

// PERFORMANCE FIX: Create an index on 'status' for fast lookups
OrdersSchema.index({ status: 1 });

module.exports = mongoose.model("Order", OrdersSchema);