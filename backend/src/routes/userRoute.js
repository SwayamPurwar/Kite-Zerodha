const router = require("express").Router();
const { updateFunds, getUserProfile, updateAvatar } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/funds", authMiddleware, updateFunds);
router.get("/profile", authMiddleware, getUserProfile);
router.put("/avatar", authMiddleware, updateAvatar); // NEW ROUTE

module.exports = router;