const router = require("express").Router();
// Import the new functions
const { signup, login, sendOtp, verifyOtp } = require("../controllers/authController");

router.post("/signup", signup);
router.post("/login", login); // Keep old login just in case
router.post("/send-otp", sendOtp);       // NEW
router.post("/verify-otp", verifyOtp);   // NEW

module.exports = router;