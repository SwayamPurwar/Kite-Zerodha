const YahooFinance = require("yahoo-finance2").default; 
const yahooFinance = new YahooFinance(); 

const OrdersModel = require("../models/OrdersModel");
const HoldingsModel = require("../models/HoldingsModel");
const UserModel = require("../models/UserModel");

// Base list of popular stocks to show by default
const BASE_SYMBOLS = [
  "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS", "ICICIBANK.NS",
  "HINDUNILVR.NS", "ITC.NS", "SBIN.NS", "BHARTIARTL.NS", "KOTAKBANK.NS",
  "LTIM.NS", "JIOFIN.NS", "LT.NS", "AXISBANK.NS", "BAJFINANCE.NS",
  "MARUTI.NS", "ASIANPAINT.NS", "HCLTECH.NS", "TITAN.NS", "SUNPHARMA.NS",
  "ULTRACEMCO.NS", "TATAMOTORS.NS", "NTPC.NS", "ONGC.NS", "POWERGRID.NS",
  "WIPRO.NS", "M&M.NS", "JSWSTEEL.NS", "ADANIENT.NS", "ADANIPORTS.NS"
];

let dynamicSymbols = [];
let marketData = [];

module.exports.getMarketPrice = (symbol) => {
  const stock = marketData.find(s => s.name === symbol);
  return stock ? stock.price : null;
};

module.exports.getLivePrices = (req, res) => {
  res.json(marketData);
};

// IMPROVED: Smart Search Engine
module.exports.searchStocks = async (req, res) => {
  const query = req.query.q;
  if (!query) return res.json([]);

  try {
    // 1. Search deeper (top 25 results) to bypass global generic matches
    const searchResults = await yahooFinance.search(query, { quotesCount: 25, newsCount: 0 });

    // 2. Filter exclusively for Indian stocks
    let validQuotes = searchResults.quotes.filter(q => 
      q.quoteType === 'EQUITY' && (q.symbol.endsWith('.NS') || q.symbol.endsWith('.BO'))
    );

    // 3. SMART FALLBACK: If "Tata" doesn't yield Indian stocks immediately, force an Indian search
    if (validQuotes.length === 0 && !query.endsWith('.NS') && !query.endsWith('.BO')) {
        const fallbackResults = await yahooFinance.search(`${query}.NS`, { quotesCount: 10, newsCount: 0 });
        validQuotes = fallbackResults.quotes.filter(q => 
            q.quoteType === 'EQUITY' && (q.symbol.endsWith('.NS') || q.symbol.endsWith('.BO'))
        );
    }

    if (validQuotes.length === 0) return res.json([]);

    // Get unique symbols and limit to top 8 to prevent UI clutter and rate limits
    const symbolsToFetch = [...new Set(validQuotes.map(q => q.symbol))].slice(0, 8);

    // 4. Register to the real-time WebSocket loop
    symbolsToFetch.forEach(sym => {
      if (!BASE_SYMBOLS.includes(sym) && !dynamicSymbols.includes(sym)) {
         dynamicSymbols.push(sym);
         if (dynamicSymbols.length > 60) dynamicSymbols.shift(); // Keep memory clean
      }
    });

    // 5. Fetch live prices safely (If one stock fails, it won't crash the rest)
    const quotePromises = symbolsToFetch.map(sym => yahooFinance.quote(sym).catch(() => null));
    const liveDataRaw = await Promise.all(quotePromises);
    const liveData = liveDataRaw.filter(quote => quote !== null);

    const formattedData = liveData.map(stock => {
      const change = stock.regularMarketChangePercent || 0;
      return {
        name: stock.symbol.replace(".NS", "").replace(".BO", ""),
        price: stock.regularMarketPrice || 0,
        percent: `${change > 0 ? "+" : ""}${change.toFixed(2)}%`,
        isDown: change < 0,
        exchange: stock.symbol.endsWith(".BO") ? "BSE" : "NSE"
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
      const allSymbolsToFetch = [...BASE_SYMBOLS, ...dynamicSymbols];
      
      const results = await yahooFinance.quote(allSymbolsToFetch);

      marketData = results.map(stock => {
        const change = stock.regularMarketChangePercent || 0;
        return {
          name: stock.symbol.replace(".NS", "").replace(".BO", ""), 
          price: stock.regularMarketPrice,
          percent: `${change > 0 ? "+" : ""}${change.toFixed(2)}%`,
          isDown: change < 0,
          exchange: stock.symbol.endsWith(".BO") ? "BSE" : "NSE"
        };
      });

      io.emit("market-data", marketData);
      await processPendingOrders(marketData, io);

    } catch (error) {
      console.error("Market Engine Error:", error.message);
    }
  };

  fetchMarketData();
  setInterval(fetchMarketData, 10000); 
};

const processPendingOrders = async (currentMarketData, io) => {
  try {
    const pendingOrders = await OrdersModel.find({ status: "Pending" });

    await Promise.all(pendingOrders.map(async (order) => {
      const stock = currentMarketData.find(s => s.name === order.name);
      if (!stock) return;

      let executed = false;

      if (order.mode === "BUY" && stock.price <= order.price) {
        const existingHolding = await HoldingsModel.findOne({ name: order.name, userId: order.userId });
        
        if (existingHolding) {
          let totalOldCost = existingHolding.qty * existingHolding.avg;
          let newTotalQty = existingHolding.qty + order.qty;
          let newAvgPrice = (totalOldCost + (order.qty * order.price)) / newTotalQty;

          existingHolding.qty = newTotalQty;
          existingHolding.avg = newAvgPrice;
          await existingHolding.save();
        } else {
          await HoldingsModel.create({
            userId: order.userId, name: order.name, qty: order.qty, avg: order.price, 
            price: stock.price, net: "0.00%", day: "0.00%", isLoss: false
          });
        }
        executed = true;
      }
      else if (order.mode === "SELL" && stock.price >= order.price) {
        await UserModel.findByIdAndUpdate(order.userId, { 
            $inc: { walletBalance: order.qty * order.price } 
        });
        executed = true;
      }

      if (executed) {
        order.status = "Executed";
        await order.save();
        if (io) io.emit("order-executed", order);
      }
    }));
  } catch (err) {
    console.error("Order matching error:", err);
  }
};

module.exports.getHistoricalData = async (req, res) => {
    try {
      const symbol = req.params.symbol;
      const queryOptions = { period1: "2023-01-01", interval: "1d" };
      const result = await yahooFinance.chart(`${symbol}.NS`, queryOptions);

      if (!result || !result.quotes) return res.status(404).json({ message: "Data not found" });

      const formattedData = result.quotes.map(candle => ({
        time: candle.date.toISOString().split("T")[0], 
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close
      }));

      res.json(formattedData);
    } catch (error) {
      console.error("Error fetching history:", error.message);
      res.status(500).json({ message: "Failed to fetch graph data" });
    }
};