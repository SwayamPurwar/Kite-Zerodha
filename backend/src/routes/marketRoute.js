const router = require("express").Router();
const { getLivePrices, getHistoricalData } = require("../controllers/marketController");

// The live prices route
router.get("/prices", getLivePrices);

// The historical data route for the Candlestick chart
router.get("/history/:symbol", getHistoricalData);

module.exports = router;