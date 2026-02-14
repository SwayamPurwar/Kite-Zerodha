import React, { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client"; 
import "./Holdings.css";
import { API_URL } from "../config";

const Holdings = () => {
  const [allHoldings, setAllHoldings] = useState([]);
  const [livePrices, setLivePrices] = useState({}); 

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get(`${API_URL}/allHoldings`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setAllHoldings(res.data))
      .catch((err) => console.error("Error fetching holdings:", err));
  }, []);

  useEffect(() => {
    const socket = io(API_URL);
    socket.on("market-data", (data) => {
      const priceMap = {};
      data.forEach(stock => priceMap[stock.name] = stock.price);
      setLivePrices(priceMap);
    });
    return () => socket.disconnect();
  }, []);

  // Calculate totals
  let totalInvestment = 0;
  let totalCurrentValue = 0;
  
  allHoldings.forEach(stock => {
    const currentPrice = livePrices[stock.name] || stock.price;
    totalInvestment += (stock.avg * stock.qty);
    totalCurrentValue += (currentPrice * stock.qty);
  });
  
  const totalPnL = totalCurrentValue - totalInvestment;
  const pnlPercent = totalInvestment > 0 ? (totalPnL / totalInvestment) * 100 : 0;
  const isTotalProfit = totalPnL >= 0;

  return (
    <div className="holdings-container">
      
      <div className="holdings-header">
        <h3 style={{ fontSize: "1.2rem", fontWeight: "400", color: "#cecece" }}>Holdings ({allHoldings.length})</h3>
        <div className="tabs">
          <span>All</span>
          <span className="active">Equity</span>
          <span>Mutual funds</span>
        </div>
        <div style={{ display: "flex", gap: "15px", fontSize: "12px", color: "#4184f3" }}>
          <span><i className="fa-solid fa-magnifying-glass"></i> Search</span>
          <span><i className="fa-solid fa-chart-pie"></i> Analytics</span>
          <span><i className="fa-solid fa-download"></i> Download</span>
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
        <div className="summary-block">
          <p>Day's P&L</p>
          <h2 className={isTotalProfit ? "profit" : "loss"}>0.00 <span style={{fontSize:"14px"}}>0.00%</span></h2>
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
              <th>Invested</th>
              <th>Cur. val</th>
              <th>P&L</th>
              <th>Net chg.</th>
              <th>Day chg.</th>
            </tr>
          </thead>
          <tbody>
            {allHoldings.map((stock, index) => {
              const currentPrice = livePrices[stock.name] || stock.price;
              const invested = stock.avg * stock.qty;
              const curValue = currentPrice * stock.qty;
              const pnl = curValue - invested;
              const pnlPct = (pnl / invested) * 100;
              const profClass = pnl >= 0 ? "profit" : "loss";

              return (
                <tr key={index}>
                  <td style={{color: "#4184f3"}}>{stock.name}</td>
                  <td>{stock.qty}</td>
                  <td>{stock.avg.toFixed(2)}</td>
                  <td>{currentPrice.toFixed(2)}</td>
                  <td>{invested.toFixed(2)}</td>
                  <td>{curValue.toFixed(2)}</td>
                  <td className={profClass}>{pnl.toFixed(2)}</td>
                  <td className={profClass}>{pnlPct.toFixed(2)}%</td>
                  <td>0.00%</td>
                </tr>
              );
            })}
            {/* Total Row */}
            <tr style={{ backgroundColor: "transparent", borderTop: "1px solid #2b2b2b", fontWeight: "bold" }}>
               <td colSpan="4"></td>
               <td>Total</td>
               <td></td>
               <td className={isTotalProfit ? "profit" : "loss"}>{totalPnL.toFixed(2)}</td>
               <td className={isTotalProfit ? "profit" : "loss"}>{pnlPercent.toFixed(2)}%</td>
               <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Progress Bar matching Screenshot 2 */}
      <div className="bar-container">
         <div className="progress-bar">
            {/* The width represents Investment vs Total Value roughly */}
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