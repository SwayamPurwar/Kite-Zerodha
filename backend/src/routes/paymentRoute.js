const router = require("express").Router();
const { createOrder, verifyPayment, withdrawFunds, getTransactions } = require("../controllers/paymentController");
const authMiddleware = require("../middleware/authMiddleware");

// All routes are protected
router.post("/create-order", authMiddleware, createOrder);
router.post("/verify-payment", authMiddleware, verifyPayment);
router.post("/withdraw", authMiddleware, withdrawFunds);
router.get("/transactions", authMiddleware, getTransactions);

module.exports = router;