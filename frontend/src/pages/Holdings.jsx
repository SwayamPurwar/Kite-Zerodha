import React, { useState, useEffect } from "react";
import axios from "axios";
// MUST IMPORT io HERE FOR WEBSOCKETS TO WORK
import { io } from "socket.io-client"; 
import Summary from "../components/Summary";
import "./Holdings.css";

const Holdings = () => {
  const [allHoldings, setAllHoldings] = useState([]);
  const [livePrices, setLivePrices] = useState({}); 

  // 1. Fetch User's Holdings securely from the database
  useEffect(() => {
    const token = localStorage.getItem("token");

    axios.get("http://localhost:3002/allHoldings", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        setAllHoldings(res.data);
      })
      .catch((err) => {
        console.error("Error fetching holdings:", err);
      });
  }, []);

  // 2. Connect to WebSockets for Live Market Prices
  useEffect(() => {
    // Connect to the backend socket
    const socket = io("http://localhost:3002");

    // Listen for the live data stream
    socket.on("market-data", (data) => {
      const priceMap = {};
      data.forEach(stock => {
        priceMap[stock.name] = stock.price;
      });
      setLivePrices(priceMap); // Update state instantly
    });

    // Disconnect when leaving the page
    return () => socket.disconnect();
  }, []);

  return (
    <div className="holdings-container">
      <h3 className="title">Holdings ({allHoldings.length})</h3>

      <Summary allHoldings={allHoldings} livePrices={livePrices} />

      <div className="order-table">
        <table>
          <thead>
            <tr>
              <th>Instrument</th>
              <th>Qty.</th>
              <th>Avg. cost</th>
              <th>LTP (Live)</th>
              <th>Cur. val</th>
              <th>P&L</th>
            </tr>
          </thead>
          <tbody>
            {allHoldings.map((stock, index) => {
              // Calculate dynamic values using the Live Price (or fallback to original price if socket is loading)
              const currentPrice = livePrices[stock.name] || stock.price;
              const curValue = currentPrice * stock.qty;
              const pnl = curValue - (stock.avg * stock.qty);
              const isProfit = pnl >= 0;
              const profClass = isProfit ? "profit" : "loss";

              return (
                <tr key={index}>
                  <td>{stock.name}</td>
                  <td>{stock.qty}</td>
                  <td>{stock.avg.toFixed(2)}</td>
                  
                  {/* Live Price Column */}
                  <td className={profClass} style={{ fontWeight: "500" }}>
                     {currentPrice.toFixed(2)}
                  </td>
                  
                  {/* Current Value Column */}
                  <td>{curValue.toFixed(2)}</td>
                  
                  {/* P&L Column */}
                  <td className={profClass}>
                     {isProfit ? "+" : ""}{pnl.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Holdings;