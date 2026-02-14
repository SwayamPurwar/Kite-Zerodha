import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { io } from "socket.io-client"; 
import { API_URL } from "../config";
import "./Holdings.css"; // Reuse the dark theme layout classes

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("Regular");

  useEffect(() => {
    const fetchOrders = () => {
      const token = localStorage.getItem("token");
      axios.get(`${API_URL}/allOrders`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then((res) => {
        // Sort orders so newest are at the top
        const sortedOrders = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(sortedOrders);
      }).catch((err) => {
        console.error("Error fetching orders:", err);
      });
    };

    fetchOrders(); 
    
    // Connect to socket to listen for real-time order execution updates
    const socket = io(API_URL);
    socket.on("order-executed", (executedOrder) => {
      setOrders(prevOrders => prevOrders.map(o => 
          o._id === executedOrder._id ? { ...o, status: "Executed" } : o
      ));
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div className="holdings-container">
      
      {/* Top Header & Tabs matching Kite's UI */}
      <div className="holdings-header">
        <h3 style={{ fontSize: "1.2rem", fontWeight: "400", color: "#cecece", margin: 0 }}>
           Orders ({orders.length})
        </h3>
        <div className="tabs" style={{ margin: "0 auto", paddingRight: "100px" }}>
          {["Regular", "GTT", "Baskets", "SIPs", "Alerts"].map(tab => (
            <span 
              key={tab}
              className={activeTab === tab ? "active" : ""} 
              onClick={() => setActiveTab(tab)}
              style={{ cursor: "pointer" }}
            >
              {tab}
            </span>
          ))}
        </div>
        <div style={{ display: "flex", gap: "15px", fontSize: "12px", color: "#4184f3", cursor: "pointer" }}>
          <span><i className="fa-solid fa-magnifying-glass"></i> Search</span>
          <span><i className="fa-solid fa-download"></i> Download</span>
        </div>
      </div>

      {/* Orders Content */}
      {orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "120px 0", color: "#888" }}>
          <i className="fa-regular fa-clock" style={{ fontSize: "3.5rem", color: "#2b2b2b", marginBottom: "20px" }}></i>
          <p style={{ fontSize: "1.1rem" }}>You haven't placed any orders today</p>
          <Link to="/" style={{ color: "#4184f3", textDecoration: "none", display: "inline-block", marginTop: "15px" }}>
             Go to Watchlist to start trading
          </Link>
        </div>
      ) : (
        <div className="order-table">
          <table>
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Time</th>
                <th style={{ textAlign: "left" }}>Type</th>
                <th style={{ textAlign: "left" }}>Instrument</th>
                <th style={{ textAlign: "left" }}>Product</th>
                <th>Qty.</th>
                <th>Avg. price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => {
                const isBuy = order.mode === "BUY";
                const isPending = order.status === "Pending";
                const timeStr = order.createdAt 
                  ? new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})
                  : "--:--:--"; 

                return (
                  <tr key={index}>
                    {/* Time */}
                    <td style={{ color: "#888", textAlign: "left", fontSize: "12px" }}>{timeStr}</td>
                    
                    {/* Type Badge (Buy/Sell) */}
                    <td style={{ textAlign: "left" }}>
                      <span className={isBuy ? "buy" : "sell"} style={{ padding: "3px 6px", borderRadius: "2px", fontSize: "10px", fontWeight: "600" }}>
                        {order.mode}
                      </span>
                    </td>

                    {/* Instrument Name */}
                    <td style={{ textAlign: "left", color: "#cecece", fontWeight: "500" }}>{order.name}</td>
                    
                    {/* Product Type (CNC) */}
                    <td style={{ textAlign: "left" }}>
                       <span style={{ backgroundColor: "rgba(255, 87, 34, 0.1)", color: "#ff5722", padding: "3px 6px", borderRadius: "2px", fontSize: "10px", fontWeight: "600" }}>
                          CNC
                       </span>
                    </td>

                    {/* Quantity (Completed / Total) */}
                    <td>{order.qty} / {order.qty}</td>

                    {/* Price */}
                    <td>{order.price.toFixed(2)}</td>

                    {/* Status Badge */}
                    <td>
                      <span style={{
                        padding: "4px 8px",
                        borderRadius: "2px",
                        fontSize: "10px",
                        fontWeight: "600",
                        backgroundColor: isPending ? "rgba(255, 152, 0, 0.1)" : "rgba(76, 175, 80, 0.1)",
                        color: isPending ? "#ff9800" : "#4caf50",
                        border: `1px solid ${isPending ? "rgba(255, 152, 0, 0.2)" : "rgba(76, 175, 80, 0.2)"}`,
                        textTransform: "uppercase"
                      }}>
                        {isPending ? "OPEN" : "COMPLETE"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Orders;