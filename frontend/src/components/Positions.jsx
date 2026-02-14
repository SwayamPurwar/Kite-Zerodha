import React, { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client"; 
import { API_URL } from "../config";
import "../pages/Holdings.css"; // Reuse the layout styles from Holdings

const Positions = () => {
  const [positions, setPositions] = useState([]);
  const [livePrices, setLivePrices] = useState({});
  const [activeTab, setActiveTab] = useState("Net");

  useEffect(() => {
    const token = localStorage.getItem("token");
    // In a real app, this would be a dedicated /positions endpoint. 
    // We'll use holdings data here to simulate Net Positions.
    axios.get(`${API_URL}/allHoldings`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setPositions(res.data))
      .catch((err) => console.error("Error fetching positions:", err));
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
  
  positions.forEach(stock => {
    const currentPrice = livePrices[stock.name] || stock.price;
    totalInvestment += (stock.avg * stock.qty);
    totalCurrentValue += (currentPrice * stock.qty);
  });
  
  const totalPnL = totalCurrentValue - totalInvestment;
  const isTotalProfit = totalPnL >= 0;

  return (
    <div className="holdings-container">
      
      {/* Top Header & Tabs */}
      <div className="holdings-header">
        <h3 style={{ fontSize: "1.2rem", fontWeight: "400", color: "#cecece", margin: 0 }}>
           Positions ({positions.length})
        </h3>
        <div className="tabs" style={{ margin: "0 auto", paddingRight: "100px" }}>
          <span 
            className={activeTab === "Net" ? "active" : ""} 
            onClick={() => setActiveTab("Net")}
            style={{ cursor: "pointer" }}
          >
            Net
          </span>
          <span 
            className={activeTab === "Day" ? "active" : ""} 
            onClick={() => setActiveTab("Day")}
            style={{ cursor: "pointer" }}
          >
            Day
          </span>
        </div>
        <div style={{ display: "flex", gap: "15px", fontSize: "12px", color: "#4184f3", cursor: "pointer" }}>
          <span><i className="fa-solid fa-magnifying-glass"></i> Search</span>
          <span><i className="fa-solid fa-chart-pie"></i> Analytics</span>
          <span><i className="fa-solid fa-download"></i> Download</span>
        </div>
      </div>

      {/* Real-time Summary */}
      <div className="holdings-top-summary" style={{ justifyContent: "flex-end", gap: "60px", borderBottom: "1px solid #2b2b2b", paddingBottom: "30px", marginBottom: "0" }}>
        <div className="summary-block" style={{ textAlign: "right" }}>
          <p>Total P&L</p>
          <h2 className={isTotalProfit ? "profit" : "loss"} style={{ fontSize: "2rem" }}>
            {isTotalProfit ? "+" : ""}{totalPnL.toFixed(2)}
          </h2>
        </div>
      </div>

      {/* Data Table */}
      {positions.length === 0 ? (
        <div style={{ textAlign: "center", padding: "100px 0", color: "#888" }}>
          <i className="fa-solid fa-briefcase" style={{ fontSize: "3rem", color: "#2b2b2b", marginBottom: "15px" }}></i>
          <p style={{ fontSize: "1.1rem" }}>You don't have any open positions</p>
        </div>
      ) : (
        <div className="order-table">
          <table>
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Product</th>
                <th style={{ textAlign: "left" }}>Instrument</th>
                <th>Qty.</th>
                <th>Avg.</th>
                <th>LTP</th>
                <th>P&L</th>
                <th>Chg.</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((stock, index) => {
                const currentPrice = livePrices[stock.name] || stock.price;
                const invested = stock.avg * stock.qty;
                const curValue = currentPrice * stock.qty;
                const pnl = curValue - invested;
                const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0;
                const profClass = pnl >= 0 ? "profit" : "loss";

                return (
                  <tr key={index}>
                    <td style={{ textAlign: "left" }}>
                       <span style={{ backgroundColor: "rgba(255, 87, 34, 0.1)", color: "#ff5722", padding: "3px 6px", borderRadius: "2px", fontSize: "10px", fontWeight: "600" }}>
                          CNC
                       </span>
                    </td>
                    <td style={{ textAlign: "left", color: "#cecece", fontWeight: "500" }}>{stock.name}</td>
                    <td>{stock.qty}</td>
                    <td>{stock.avg.toFixed(2)}</td>
                    <td>{currentPrice.toFixed(2)}</td>
                    <td className={profClass} style={{ fontWeight: "500" }}>{pnl.toFixed(2)}</td>
                    <td className={profClass}>{pnlPct.toFixed(2)}%</td>
                  </tr>
                );
              })}
              
              {/* Table Footer / Total Row */}
              <tr style={{ backgroundColor: "transparent", borderTop: "1px solid #2b2b2b", fontWeight: "500" }}>
                 <td colSpan="5" style={{ textAlign: "left", color: "#888" }}>Total</td>
                 <td className={isTotalProfit ? "profit" : "loss"}>{totalPnL.toFixed(2)}</td>
                 <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Positions;