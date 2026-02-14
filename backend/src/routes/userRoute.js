const router = require("express").Router();
// 1. ADD getTransactions TO THIS IMPORT LIST:
const { updateFunds, getUserProfile, updateAvatar, getTransactions } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/funds", authMiddleware, updateFunds);
router.get("/transactions", authMiddleware, getTransactions); // This line works now
router.get("/profile", authMiddleware, getUserProfile);
router.put("/avatar", authMiddleware, updateAvatar);

module.exports = router;