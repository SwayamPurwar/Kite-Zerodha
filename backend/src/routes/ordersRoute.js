const router = require("express").Router();
const { createNewOrder } = require("../controllers/ordersController");
const OrdersModel = require("../models/OrdersModel");
const authMiddleware = require("../middleware/authMiddleware"); // <-- Import middleware

// GET all orders for the LOGGED IN user
router.get("/allOrders", authMiddleware, async (req, res) => {
  // Only find orders matching this user's ID
  const allOrders = await OrdersModel.find({ userId: req.user.id });
  res.json(allOrders);
});

// POST new order (protected with authMiddleware)
router.post("/newOrder", authMiddleware, createNewOrder);

module.exports = router;