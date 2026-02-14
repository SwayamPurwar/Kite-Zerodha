const router = require("express").Router();
const { getLivePrices, getHistoricalData, searchStocks } = require("../controllers/marketController");

// The live prices route (loads default + dynamically tracked stocks)
router.get("/prices", getLivePrices);

// NEW: Dynamic search route
router.get("/search", searchStocks);

// The historical data route for the Candlestick chart
router.get("/history/:symbol", getHistoricalData);

module.exports = router;