import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./BuyActionWindow.css";

const BuyActionWindow = ({ uid, currentPrice, closeBuyWindow }) => {
  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockPrice, setStockPrice] = useState(currentPrice || 0.0);

  const handleBuy = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.post("http://localhost:3002/newOrder", {
        name: uid,
        qty: stockQuantity,
        price: stockPrice,
        mode: "BUY",
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.newBalance) {
        localStorage.setItem("walletBalance", response.data.newBalance);
      }
      
      // Show elegant toast instead of alert
      toast.success(`Successfully bought ${stockQuantity} shares of ${uid}`); 
      
      setTimeout(() => {
        closeBuyWindow();
        window.location.reload(); 
      }, 1500);
      
    } catch (error) {
      toast.error(error.response?.data?.message || "Order failed"); 
    }
  };

  const handleCancel = () => {
    closeBuyWindow();
  };

  return (
    <div className="container" id="buy-window" draggable="true">
      <div className="regular-order">
        <div className="inputs">
          <fieldset>
            <legend>Qty.</legend>
            <input
              type="number"
              name="qty"
              id="qty"
              onChange={(e) => setStockQuantity(e.target.value)}
              value={stockQuantity}
            />
          </fieldset>
          <fieldset>
            <legend>Price</legend>
            <input
              type="number"
              name="price"
              id="price"
              step="0.05"
              onChange={(e) => setStockPrice(e.target.value)}
              value={stockPrice}
            />
          </fieldset>
        </div>
      </div>

      <div className="buttons">
        <span>Margin required ₹{(stockQuantity * stockPrice).toFixed(2)}</span>
        <div>
          <Link to="" className="btn btn-blue" onClick={handleBuy}>
            Buy
          </Link>
          <Link to="" className="btn btn-grey" onClick={handleCancel}>
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BuyActionWindow;