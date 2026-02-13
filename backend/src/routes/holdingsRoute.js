const router = require("express").Router();
const { getAllHoldings } = require("../controllers/holdingsController");
const authMiddleware = require("../middleware/authMiddleware"); // <-- Import middleware

// GET http://localhost:3002/allHoldings
// Add authMiddleware before the controller function
router.get("/allHoldings", authMiddleware, getAllHoldings);

module.exports = router;