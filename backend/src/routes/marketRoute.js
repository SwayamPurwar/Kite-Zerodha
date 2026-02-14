const router = require("express").Router();
const { 
  getLivePrices, 
  getHistoricalData, 
  searchStocks,
  getUserWatchlist, 
  addToWatchlist,
  removeFromWatchlist // ✅ Import
} = require("../controllers/marketController");

const authMiddleware = require("../middleware/authMiddleware");

// Live prices
router.get("/prices", getLivePrices);

// Search
router.get("/search", searchStocks);

// Personalized Watchlist Routes (Protected)
router.get("/my-watchlist", authMiddleware, getUserWatchlist);
router.post("/watchlist/add", authMiddleware, addToWatchlist);
router.post("/watchlist/remove", authMiddleware, removeFromWatchlist); // ✅ New Route

// Historical Data
router.get("/history/:symbol", getHistoricalData);

module.exports = router;