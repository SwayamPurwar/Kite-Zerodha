import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Holdings.css"; // Reuse the table CSS

const Orders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = () => {
      const token = localStorage.getItem("token");
      axios.get("http://localhost:3002/allOrders", {
        headers: { Authorization: `Bearer ${token}` }
      }).then((res) => {
        // Sort orders so newest are at the top
        const sortedOrders = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(sortedOrders);
      }).catch((err) => {
        console.error("Error fetching orders:", err);
      });
    };

    fetchOrders(); // Initial fetch
    
    // Poll the orders every 3 seconds to see if Pending orders got Executed by the engine!
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="holdings-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h3 className="title">Order Book ({orders.length})</h3>
      </div>
      
      {orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px", color: "#888", backgroundColor: "#fbfbfb", border: "1px solid #eee", borderRadius: "8px" }}>
          <p style={{ fontSize: "1.2rem", marginBottom: "10px" }}>You haven't placed any orders yet</p>
          <Link to="/" style={{ color: "#387ed1", textDecoration: "none" }}>Go to Watchlist to start trading</Link>
        </div>
      ) : (
        <div className="order-table">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Instrument</th>
                <th>Type</th>
                <th>Qty.</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => {
                const isBuy = order.mode === "BUY";
                const isPending = order.status === "Pending";
               const timeStr = order.createdAt 
  ? new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})
  : "--:--:--"; // Fallback for old orders

                return (
                  <tr key={index}>
                    <td style={{ color: "#888", fontSize: "0.9rem" }}>{timeStr}</td>
                    <td style={{ fontWeight: "500" }}>{order.name}</td>
                    <td style={{ color: isBuy ? "#4caf50" : "#df514d", fontWeight: "bold" }}>{order.mode}</td>
                    <td>{order.qty}</td>
                    <td>₹{order.price.toFixed(2)}</td>
                    <td>
                      <span style={{
                        padding: "5px 12px",
                        borderRadius: "20px",
                        fontSize: "0.85rem",
                        fontWeight: "500",
                        backgroundColor: isPending ? "#fff3cd" : "#d4edda",
                        color: isPending ? "#856404" : "#155724",
                        border: `1px solid ${isPending ? "#ffeeba" : "#c3e6cb"}`
                      }}>
                        {order.status || "Executed"}
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