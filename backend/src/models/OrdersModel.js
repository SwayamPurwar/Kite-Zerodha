const mongoose = require("mongoose");

const OrdersSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: String,
    qty: Number,
    price: Number,
    mode: String,
    status: { type: String, default: "Pending" },
    // NEW FIELDS FOR GTT
    orderType: { type: String, default: "LIMIT" }, // "LIMIT" or "GTT"
    triggerPrice: { type: Number },               // The activation price
    isTriggered: { type: Boolean, default: false } // Has the trigger been hit?
}, { timestamps: true });

OrdersSchema.index({ status: 1 });
module.exports = mongoose.model("Order", OrdersSchema);