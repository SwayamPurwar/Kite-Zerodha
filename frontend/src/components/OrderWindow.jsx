import React, { useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./BuyActionWindow.css"; // Reusing the existing CSS
import { API_URL } from "../config";
import { UserContext } from "../context/UserContext"; // Import Context

const OrderWindow = ({ uid, currentPrice, closeWindow, mode }) => {
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState(currentPrice || 0.0);

  // Access the global balance updater
  const { updateBalance } = useContext(UserContext);

  // Dynamic Styles based on Mode
  const isBuy = mode === "BUY";
  const buttonColor = isBuy ? "#4184f3" : "#df514d"; // Blue for Buy, Red for Sell
  const buttonHoverColor = isBuy ? "#2a6cd9" : "#c94642";

  const handleOrder = async () => {
    try {
      const token = localStorage.getItem("token");
      
      const response = await axios.post(`${API_URL}/newOrder`, {
        name: uid,
        qty: Number(qty),
        price: Number(price),
        mode: mode, // "BUY" or "SELL" passed from props
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 1. Update Global State (No Reload Needed!)
      if (response.data.newBalance !== undefined) {
        updateBalance(response.data.newBalance);
      }
      
      toast.success(`Successfully ${isBuy ? "bought" : "sold"} ${qty} shares of ${uid}`);
      
      // 2. Close window after a short delay
      setTimeout(() => {
        closeWindow();
      }, 1000);
      
    } catch (error) {
      toast.error(error.response?.data?.message || "Order failed"); 
    }
  };

  return (
    <div className="container" id="buy-window" draggable="true">
      <div className="regular-order">
        <div className="inputs">
          <fieldset>
            <legend>Qty.</legend>
            <input
              type="number"
              min="1"
              onChange={(e) => setQty(e.target.value)}
              value={qty}
            />
          </fieldset>
          <fieldset>
            <legend>Price</legend>
            <input
              type="number"
              step="0.05"
              onChange={(e) => setPrice(e.target.value)}
              value={price}
            />
          </fieldset>
        </div>
      </div>

      <div className="buttons">
        <span>
            {isBuy ? "Margin required" : "Margin released"} 
            ₹{(qty * price).toFixed(2)}
        </span>
        <div>
          <button 
            className="btn" 
            style={{ 
              backgroundColor: buttonColor, 
              color: "white", 
              border: "none",
              cursor: "pointer",
              transition: "background 0.2s"
            }}
            onClick={handleOrder}
            onMouseOver={(e) => e.target.style.backgroundColor = buttonHoverColor}
            onMouseOut={(e) => e.target.style.backgroundColor = buttonColor}
          >
            {mode}
          </button>
          <button 
            className="btn btn-grey" 
            onClick={closeWindow} 
            style={{ 
              border: "none", 
              cursor: "pointer",
              marginLeft: "10px"
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderWindow;