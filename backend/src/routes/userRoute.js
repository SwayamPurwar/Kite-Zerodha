const router = require("express").Router();
// 1. Add updateProfile to your imports:
const { updateFunds, getUserProfile, updateAvatar, getTransactions, updateProfile } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/funds", authMiddleware, updateFunds);
router.get("/transactions", authMiddleware, getTransactions); 
router.get("/profile", authMiddleware, getUserProfile);
router.put("/avatar", authMiddleware, updateAvatar);
// 2. Add the new PUT route for profile updates:
router.put("/profile", authMiddleware, updateProfile);

module.exports = router;