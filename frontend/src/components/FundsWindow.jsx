import React, { useState } from "react";
import "./BuyActionWindow.css"; // Reuse existing styles for consistency

const FundsWindow = ({ type, closeWindow, handleTransaction }) => {
  const [amount, setAmount] = useState("");
  
  const onSubmit = () => {
    if (!amount || amount <= 0) return;
    handleTransaction(Number(amount), type);
  };

  const isDeposit = type === "deposit";

  return (
    <div className="container" id="buy-window" draggable="true" style={{ top: "20%" }}>
      <div className="regular-order">
        <div className="inputs">
          <fieldset style={{ width: "100%" }}>
            <legend>Amount ({isDeposit ? "+ Add" : "- Withdraw"})</legend>
            <input
              type="number"
              placeholder="Enter amount"
              onChange={(e) => setAmount(e.target.value)}
              value={amount}
              autoFocus
            />
          </fieldset>
        </div>
        
        {/* Quick Amount Chips */}
        {isDeposit && (
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                {[1000, 5000, 10000].map(val => (
                    <span 
                        key={val} 
                        onClick={() => setAmount(val)}
                        style={{ padding: "4px 8px", background: "#f0f0f0", borderRadius: "3px", fontSize: "11px", cursor: "pointer", color: "#666" }}
                    >
                        +{val}
                    </span>
                ))}
            </div>
        )}
      </div>

      <div className="buttons">
        <span>{isDeposit ? "UPI / Netbanking" : "Transfer to Bank Account"}</span>
        <div>
          <button 
            className="btn" 
            style={{ backgroundColor: isDeposit ? "#4caf50" : "#4184f3", border: "none", color: "#fff", cursor: "pointer" }} 
            onClick={onSubmit}
          >
            {isDeposit ? "Add Funds" : "Withdraw"}
          </button>
          <button className="btn btn-grey" onClick={closeWindow} style={{ border: "none", marginLeft: "10px", cursor: "pointer" }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default FundsWindow;