import React from "react";
import "./Summary.css";

const Summary = ({ allHoldings, livePrices }) => {
  let currentValue = 0;
  let investmentValue = 0;

  // Perform calculations using LIVE prices if available
  allHoldings.forEach((stock) => {
    // If we have a live price for this stock, use it. Otherwise, fallback to the database price.
    const currentLivePrice = livePrices[stock.name] || stock.price; 
    
    currentValue += currentLivePrice * stock.qty;
    investmentValue += stock.avg * stock.qty;
  });

  const pnl = currentValue - investmentValue;
  const pnlPercent = investmentValue !== 0 ? (pnl / investmentValue) * 100 : 0;
  const isProfit = pnl >= 0;

  return (
    <div className="summary-container">
      <div className="section">
        <span>Total investment</span>
        <h3>{investmentValue.toFixed(2)}</h3>
      </div>

      <div className="section">
        <span>Current value</span>
        <h3>{currentValue.toFixed(2)}</h3>
      </div>

      <div className="section">
        <span>P&L</span>
        <h3 className={isProfit ? "profit" : "loss"}>
          {isProfit ? "+" : ""}{pnl.toFixed(2)} <small>({pnlPercent.toFixed(2)}%)</small>
        </h3>
      </div>
    </div>
  );
};

export default Summary;