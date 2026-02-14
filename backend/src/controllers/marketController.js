const YahooFinance = require("yahoo-finance2").default;
const yahooFinance = new YahooFinance();

const OrdersModel = require("../models/OrdersModel");
const HoldingsModel = require("../models/HoldingsModel");
const UserModel = require("../models/UserModel");

// Base list of popular stocks to show by default
const BASE_SYMBOLS = [
  "^NSEI", "^BSESN", "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS",
  "ICICIBANK.NS", "HINDUNILVR.NS", "ITC.NS", "SBIN.NS", "BHARTIARTL.NS",
  "KOTAKBANK.NS", "LTIM.NS", "JIOFIN.NS", "LT.NS", "AXISBANK.NS",
  "BAJFINANCE.NS", "MARUTI.NS", "ASIANPAINT.NS", "HCLTECH.NS", "TITAN.NS",
  "SUNPHARMA.NS", "ULTRACEMCO.NS", "TATAMOTORS.NS", "NTPC.NS", "ONGC.NS",
  "POWERGRID.NS", "WIPRO.NS", "M&M.NS", "JSWSTEEL.NS", "ADANIENT.NS",
  "ADANIPORTS.NS",
];

let dynamicSymbols = [];
let marketData = [];

// Helper to start tracking a new symbol immediately
const addSymbolToTracking = (symbol) => {
  if (!BASE_SYMBOLS.includes(symbol) && !dynamicSymbols.includes(symbol)) {
    dynamicSymbols.push(symbol);
    console.log(`📡 Started tracking: ${symbol}`);
  }
};

module.exports.getMarketPrice = (symbol) => {
  const stock = marketData.find((s) => s.name === symbol);
  return stock ? stock.price : null;
};

module.exports.getLivePrices = (req, res) => {
  res.json(marketData);
};

// --- Get User's Personal Watchlist ---
module.exports.getUserWatchlist = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Map user's saved symbols to the latest market data
    const userWatchlist = user.watchlist.map(symbol => {
      const stockData = marketData.find(d => d.name === symbol);
      return stockData || { 
        name: symbol, 
        price: 0, 
        percent: "0.00%", 
        isDown: false, 
        exchange: "NSE" 
      };
    });

    res.json(userWatchlist);
  } catch (error) {
    res.status(500).json({ message: "Error fetching watchlist" });
  }
};

// --- Add Stock to Watchlist ---
module.exports.addToWatchlist = async (req, res) => {
  try {
    const { symbol } = req.body;
    const userId = req.user.id;

    if (!symbol) return res.status(400).json({ message: "Symbol is required" });

    const user = await UserModel.findById(userId);

    // Prevent Duplicates
    if (user.watchlist.includes(symbol)) {
      return res.status(400).json({ message: "Stock already in watchlist" });
    }

    user.watchlist.push(symbol);
    await user.save();

    const fullSymbol = (symbol.includes(".") || symbol.startsWith("^")) ? symbol : `${symbol}.NS`;
    addSymbolToTracking(fullSymbol);

    res.json({ message: `${symbol} added to watchlist`, watchlist: user.watchlist });
  } catch (error) {
    console.error("Add Watchlist Error:", error);
    res.status(500).json({ message: "Failed to add stock" });
  }
};

// --- ✅ NEW: Remove Stock from Watchlist ---
module.exports.removeFromWatchlist = async (req, res) => {
  try {
    const { symbol } = req.body;
    const userId = req.user.id;

    const user = await UserModel.findById(userId);
    
    // Filter out the symbol to remove it
    user.watchlist = user.watchlist.filter(s => s !== symbol);
    
    await user.save();

    res.json({ message: `${symbol} removed from watchlist`, watchlist: user.watchlist });
  } catch (error) {
    console.error("Remove Watchlist Error:", error);
    res.status(500).json({ message: "Failed to remove stock" });
  }
};

// Search Engine
module.exports.searchStocks = async (req, res) => {
  const query = req.query.q;
  if (!query) return res.json([]);

  try {
    const searchResults = await yahooFinance.search(query, { quotesCount: 25, newsCount: 0 });

    let validQuotes = searchResults.quotes.filter(
      (q) => q.quoteType === "EQUITY" && (q.symbol.endsWith(".NS") || q.symbol.endsWith(".BO"))
    );

    if (validQuotes.length === 0 && !query.endsWith(".NS") && !query.endsWith(".BO")) {
      const fallbackResults = await yahooFinance.search(`${query}.NS`, { quotesCount: 10, newsCount: 0 });
      validQuotes = fallbackResults.quotes.filter(
        (q) => q.quoteType === "EQUITY" && (q.symbol.endsWith(".NS") || q.symbol.endsWith(".BO"))
      );
    }

    if (validQuotes.length === 0) return res.json([]);

    const symbolsToFetch = [...new Set(validQuotes.map((q) => q.symbol))].slice(0, 8);
    symbolsToFetch.forEach((sym) => addSymbolToTracking(sym)); 

    const quotePromises = symbolsToFetch.map((sym) => yahooFinance.quote(sym).catch(() => null));
    const liveDataRaw = await Promise.all(quotePromises);
    const liveData = liveDataRaw.filter((quote) => quote !== null);

    const formattedData = liveData.map((stock) => {
      const change = stock.regularMarketChangePercent || 0;
      return {
        name: stock.symbol.replace(".NS", "").replace(".BO", ""),
        price: stock.regularMarketPrice || 0,
        percent: `${change > 0 ? "+" : ""}${change.toFixed(2)}%`,
        isDown: change < 0,
        exchange: stock.symbol.endsWith(".BO") ? "BSE" : "NSE",
      };
    });

    res.json(formattedData);
  } catch (err) {
    console.error("Search API Error:", err.message);
    res.status(500).json({ message: "Error searching stocks" });
  }
};

module.exports.startMarketEngine = (io) => {
  const fetchMarketData = async () => {
    try {
      const allSymbolsToFetch = [...new Set([...BASE_SYMBOLS, ...dynamicSymbols])];
      const results = await yahooFinance.quote(allSymbolsToFetch);

      marketData = results.map((stock) => {
        const change = stock.regularMarketChangePercent || 0;
        return {
          name: stock.symbol.replace(".NS", "").replace(".BO", ""),
          price: stock.regularMarketPrice,
          percent: `${change > 0 ? "+" : ""}${change.toFixed(2)}%`,
          isDown: change < 0,
          exchange: stock.symbol.endsWith(".BO") ? "BSE" : "NSE",
        };
      });

      io.emit("market-data", marketData);
      await processPendingOrders(marketData, io);
    } catch (error) {
      console.error("Market Engine Error:", error.message);
    }
  };

  fetchMarketData();
  setInterval(fetchMarketData, 5000); 
};

const processPendingOrders = async (currentMarketData, io) => {
  try {
    const pendingOrders = await OrdersModel.find({ status: "Pending" });

    await Promise.all(
      pendingOrders.map(async (order) => {
        const stock = currentMarketData.find((s) => s.name === order.name);
        if (!stock) return;

        let executed = false;
        
        // GTT Logic
        if (order.orderType === "GTT" && !order.isTriggered) {
          if (
            (order.mode === "BUY" && stock.price <= order.triggerPrice) ||
            (order.mode === "SELL" && stock.price >= order.triggerPrice)
          ) {
            order.isTriggered = true;
            await order.save();
            return;
          }
          return;
        }

        // Limit Order Logic
        if (order.mode === "BUY" && stock.price <= order.price) {
          const existingHolding = await HoldingsModel.findOne({ name: order.name, userId: order.userId });

          if (existingHolding) {
            let totalOldCost = existingHolding.qty * existingHolding.avg;
            let newTotalQty = existingHolding.qty + order.qty;
            let newAvgPrice = (totalOldCost + order.qty * order.price) / newTotalQty;

            existingHolding.qty = newTotalQty;
            existingHolding.avg = newAvgPrice;
            await existingHolding.save();
          } else {
            await HoldingsModel.create({
              userId: order.userId,
              name: order.name,
              qty: order.qty,
              avg: order.price,
              price: stock.price,
              net: "0.00%",
              day: "0.00%",
              isLoss: false,
            });
          }
          executed = true;
        } else if (order.mode === "SELL" && stock.price >= order.price) {
          await UserModel.findByIdAndUpdate(order.userId, { $inc: { walletBalance: order.qty * order.price } });
          executed = true;
        }

        if (executed) {
          order.status = "Executed";
          await order.save();
          if (io) io.emit("order-executed", order);
        }
      })
    );
  } catch (err) {
    console.error("Order matching error:", err);
  }
};

module.exports.getHistoricalData = async (req, res) => {
  try {
    let symbol = req.params.symbol; 
    let fetchSymbol = symbol;
    if (!symbol.startsWith("^") && !symbol.includes(".")) {
      fetchSymbol = `${symbol}.NS`;
    }

    const pastDate = new Date();
    pastDate.setFullYear(pastDate.getFullYear() - 5); 
    const period1 = pastDate.toISOString().split("T")[0];

    const queryOptions = { period1: period1, interval: "1d" };
    const result = await yahooFinance.chart(fetchSymbol, queryOptions);

    if (!result || !result.quotes || result.quotes.length === 0) {
      return res.status(404).json({ message: `Data not found for ${fetchSymbol}` });
    }

    const formattedData = result.quotes
      .filter((candle) => candle.date && candle.open !== null && candle.close !== null)
      .map((candle) => ({
        time: candle.date.toISOString().split("T")[0],
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      }));

    res.json(formattedData);
  } catch (error) {
    console.error("Error fetching history for:", req.params.symbol, error.message);
    res.status(500).json({ message: "Failed to fetch graph data" });
  }
};