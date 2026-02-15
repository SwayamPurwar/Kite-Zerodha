import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../config";
import { useMarketData } from "../hooks/useMarketData"; 
import "./Holdings.css";

const Holdings = () => {
  const [allHoldings, setAllHoldings] = useState([]);
  const { marketData } = useMarketData(); 

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get(`${API_URL}/allHoldings`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setAllHoldings(res.data))
      .catch((err) => console.error("Error fetching holdings:", err));
  }, []);

  // Calculate totals
  let totalInvestment = 0;
  let totalCurrentValue = 0;
  let totalDayPnL = 0; // [NEW] Track Day's P&L

  const tableData = allHoldings.map(stock => {
      const liveStock = marketData.find(d => d.name === stock.name);
      const currentPrice = liveStock ? liveStock.price : stock.price;
      
      // [NEW] Parse percentage string (e.g., "+0.50%") into a number (0.50)
      const dayChangePercentStr = liveStock ? liveStock.percent : "0.00%";
      const dayChangePercent = parseFloat(dayChangePercentStr.replace("%", "").replace("+", ""));

      // [NEW] Calculate Day's P&L: (Current Price - Previous Close) * Qty
      // Previous Close = Current Price / (1 + Change/100)
      const previousClose = currentPrice / (1 + (dayChangePercent / 100));
      const dayPnL = (currentPrice - previousClose) * stock.qty;

      const invested = stock.avg * stock.qty;
      const curValue = currentPrice * stock.qty;
      const pnl = curValue - invested;
      const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0;

      totalInvestment += invested;
      totalCurrentValue += curValue;
      totalDayPnL += dayPnL; // Add to total

      return {
          ...stock,
          currentPrice,
          invested,
          curValue,
          pnl,
          pnlPct,
          dayPnL,
          dayChangePercentStr
      };
  });
  
  const totalPnL = totalCurrentValue - totalInvestment;
  const pnlPercent = totalInvestment > 0 ? (totalPnL / totalInvestment) * 100 : 0;
  const isTotalProfit = totalPnL >= 0;
  const isDayProfit = totalDayPnL >= 0;

  return (
    <div className="holdings-container">
      
      <div className="holdings-header">
        <h3 style={{ fontSize: "1.2rem", fontWeight: "400", color: "#cecece" }}>Holdings ({allHoldings.length})</h3>
        <div className="tabs">
          <span>All</span>
          <span className="active">Equity</span>
          <span>Mutual funds</span>
        </div>
      </div>

      <div className="holdings-top-summary">
        <div className="summary-block">
          <p>Total investment</p>
          <h2>{totalInvestment.toFixed(2)}</h2>
        </div>
        <div className="summary-block">
          <p>Current value</p>
          <h2>{totalCurrentValue.toFixed(2)}</h2>
        </div>
        
        {/* [NEW] Dynamic Day's P&L */}
        <div className="summary-block">
          <p>Day's P&L</p>
          <h2 className={isDayProfit ? "profit" : "loss"}>
             {isDayProfit ? "+" : ""}{totalDayPnL.toFixed(2)} 
             <span style={{fontSize:"14px", marginLeft: "5px"}}>
               ({(totalInvestment > 0 ? (totalDayPnL / totalInvestment) * 100 : 0).toFixed(2)}%)
             </span>
          </h2>
        </div>

        <div className="summary-block">
          <p>Total P&L</p>
          <h2 className={isTotalProfit ? "profit" : "loss"}>
            {isTotalProfit ? "+" : ""}{totalPnL.toFixed(2)} <span style={{fontSize:"14px"}}>{pnlPercent.toFixed(2)}%</span>
          </h2>
        </div>
      </div>

      <div className="order-table">
        <table>
          <thead>
            <tr>
              <th>Instrument</th>
              <th>Qty.</th>
              <th>Avg. cost</th>
              <th>LTP</th>
              <th>Cur. val</th>
              <th>P&L</th>
              <th>Net chg.</th>
              <th>Day chg.</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((stock, index) => {
              const profClass = stock.pnl >= 0 ? "profit" : "loss";
              const dayClass = stock.dayPnL >= 0 ? "profit" : "loss";

              return (
                <tr key={index}>
                  <td style={{color: "#4184f3"}}>{stock.name}</td>
                  <td>{stock.qty}</td>
                  <td>{stock.avg.toFixed(2)}</td>
                  <td>{stock.currentPrice.toFixed(2)}</td>
                  <td>{stock.curValue.toFixed(2)}</td>
                  <td className={profClass}>{stock.pnl.toFixed(2)}</td>
                  <td className={profClass}>{stock.pnlPct.toFixed(2)}%</td>
                  {/* [NEW] Show Day Change % from Market Data */}
                  <td className={dayClass}>{stock.dayChangePercentStr}</td>
                </tr>
              );
            })}
            <tr style={{ backgroundColor: "transparent", borderTop: "1px solid #2b2b2b", fontWeight: "bold" }}>
               <td colSpan="5" style={{ textAlign: "left", color: "#888" }}>Total</td>
               <td className={isTotalProfit ? "profit" : "loss"}>{totalPnL.toFixed(2)}</td>
               <td className={isTotalProfit ? "profit" : "loss"}>{pnlPercent.toFixed(2)}%</td>
               <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Progress Bar */}
      <div className="bar-container">
         <div className="progress-bar">
            <div className="progress-inner" style={{ width: totalCurrentValue > 0 ? `${(totalInvestment/totalCurrentValue)*100}%` : '50%' }}></div>
         </div>
         <div className="bar-legend">
            <span>{totalInvestment.toFixed(2)}</span>
            <div style={{ display: "flex", gap: "20px" }}>
               <span><span style={{color:"#4184f3"}}>●</span> Current value</span>
               <span>○ Investment value</span>
               <span>○ P&L</span>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Holdings;