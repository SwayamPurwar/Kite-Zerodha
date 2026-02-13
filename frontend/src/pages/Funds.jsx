import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const Funds = () => {
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState(Number(localStorage.getItem("walletBalance") || 0));

  const handleTransaction = async (type) => {
    const value = Number(amount);
    if (!value || value <= 0) return toast.warning("Please enter a valid amount greater than 0");

    const updateValue = type === "add" ? value : -value;

    try {
      const token = localStorage.getItem("token");
      
      const res = await axios.post("http://localhost:3002/user/funds", {
        amount: updateValue
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const newBalance = res.data.newBalance;
      setBalance(newBalance);
      localStorage.setItem("walletBalance", newBalance);
      setAmount(""); 
      
      toast.success(`Successfully ${type === "add" ? "added" : "withdrew"} ₹${value}!`);
      
    } catch (error) {
      toast.error(error.response?.data?.message || "Transaction failed");
    }
  };

  return (
    <div style={{ padding: "30px", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ color: "#444", fontWeight: "500" }}>Funds</h2>
      </div>
      
      <hr style={{ border: "none", borderBottom: "1px solid #eee", marginBottom: "30px" }} />

      <div style={{ display: "flex", gap: "20px" }}>
        {/* Left Side */}
        <div style={{ flex: 1, border: "1px solid #eee", padding: "30px", borderRadius: "8px", backgroundColor: "#fff" }}>
          <p style={{ fontSize: "1rem", color: "#666", marginBottom: "10px" }}>
             <i className="fa-solid fa-coins" style={{ marginRight: "10px", color: "#f39c12" }}></i>
             Available Margin
          </p>
          <h1 style={{ fontSize: "3rem", color: "#444", margin: "0", fontWeight: "400" }}>
            ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h1>
          <p style={{ color: "#888", fontSize: "0.85rem", marginTop: "10px" }}>
            This is the total cash available in your account for trading.
          </p>
        </div>

        {/* Right Side */}
        <div style={{ flex: 1, border: "1px solid #eee", padding: "30px", borderRadius: "8px", backgroundColor: "#fbfbfb" }}>
          <h3 style={{ fontSize: "1.1rem", color: "#444", marginBottom: "20px", fontWeight: "500" }}>Manage Funds</h3>
          
          <input 
            type="number" 
            placeholder="Enter amount (₹)" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ 
              width: "100%", padding: "12px", border: "1px solid #ddd", 
              borderRadius: "4px", fontSize: "16px", marginBottom: "20px", outline: "none" 
            }}
          />

          <div style={{ display: "flex", gap: "10px" }}>
            <button 
              onClick={() => handleTransaction("add")}
              style={{ flex: 1, backgroundColor: "#4caf50", color: "#fff", padding: "12px", border: "none", borderRadius: "4px", fontSize: "15px", cursor: "pointer", fontWeight: "bold" }}>
              Add Funds
            </button>
            <button 
              onClick={() => handleTransaction("withdraw")}
              style={{ flex: 1, backgroundColor: "#df514d", color: "#fff", padding: "12px", border: "none", borderRadius: "4px", fontSize: "15px", cursor: "pointer", fontWeight: "bold" }}>
              Withdraw
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Funds;