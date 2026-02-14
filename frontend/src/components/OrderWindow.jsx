import React, { useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./BuyActionWindow.css";
import { API_URL } from "../config";
import { UserContext } from "../context/UserContext";

const OrderWindow = ({ uid, currentPrice, closeWindow, mode }) => {
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState(currentPrice || 0.0);
  
  // NEW: State for Order Type and Trigger Price
  const [orderType, setOrderType] = useState("LIMIT"); // "LIMIT" or "GTT"
  const [triggerPrice, setTriggerPrice] = useState(currentPrice || 0.0);

  const { updateBalance } = useContext(UserContext);
  const isBuy = mode === "BUY";
  const buttonColor = isBuy ? "#4184f3" : "#df514d";

  const handleOrder = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${API_URL}/newOrder`, {
        name: uid,
        qty: Number(qty),
        price: Number(price),
        mode: mode,
        orderType: orderType,          // Send Type
        triggerPrice: Number(triggerPrice) // Send Trigger
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.newBalance !== undefined) {
        updateBalance(response.data.newBalance);
      }
      
      toast.success(`${orderType} Order Placed Successfully`);
      setTimeout(() => closeWindow(), 1000);
      
    } catch (error) {
      toast.error(error.response?.data?.message || "Order failed"); 
    }
  };

  return (
    <div className="container" id="buy-window" draggable="true">
      <div className="regular-order">
        
        {/* NEW: Toggle Tabs for Order Type */}
        <div style={{ display: "flex", gap: "15px", marginBottom: "15px", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
            <span 
                onClick={() => setOrderType("LIMIT")}
                style={{ cursor: "pointer", fontWeight: orderType === "LIMIT" ? "bold" : "normal", color: orderType === "LIMIT" ? buttonColor : "#888" }}
            >
                Regular
            </span>
            <span 
                onClick={() => setOrderType("GTT")}
                style={{ cursor: "pointer", fontWeight: orderType === "GTT" ? "bold" : "normal", color: orderType === "GTT" ? buttonColor : "#888" }}
            >
                GTT (Long Standing)
            </span>
        </div>

        <div className="inputs">
          <fieldset>
            <legend>Qty.</legend>
            <input type="number" min="1" onChange={(e) => setQty(e.target.value)} value={qty} />
          </fieldset>
          <fieldset>
            <legend>Price</legend>
            <input type="number" step="0.05" onChange={(e) => setPrice(e.target.value)} value={price} />
          </fieldset>
          
          {/* NEW: Trigger Price Field (Only visible for GTT) */}
          {orderType === "GTT" && (
              <fieldset>
                <legend>Trigger Price</legend>
                <input type="number" step="0.05" onChange={(e) => setTriggerPrice(e.target.value)} value={triggerPrice} />
              </fieldset>
          )}
        </div>
      </div>

      <div className="buttons">
        <span>Margin required ₹{(qty * price).toFixed(2)}</span>
        <div>
          <button className="btn" style={{ backgroundColor: buttonColor, color: "white", border: "none" }} onClick={handleOrder}>
            {mode}
          </button>
          <button className="btn btn-grey" onClick={closeWindow} style={{ marginLeft: "10px", border: "none" }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderWindow;