import React, { useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { API_URL } from "../config";
import { UserContext } from "../context/UserContext";

const Funds = () => {
  const { user, updateBalance } = useContext(UserContext);

  const handleTransaction = async (type) => {
    // Basic prompt for quick demo of layout functionality
    const amountStr = prompt(`Enter amount to ${type}:`);
    const value = Number(amountStr);
    
    if (!value || value <= 0) return toast.warning("Invalid amount");

    const updateValue = type === "add" ? value : -value;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_URL}/user/funds`, { amount: updateValue }, { headers: { Authorization: `Bearer ${token}` } });
      updateBalance(res.data.newBalance);
      toast.success(`Successfully ${type === "add" ? "added" : "withdrew"} ₹${value}!`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Transaction failed");
    }
  };

  const RowItem = ({ label, value, isBlue }) => (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "15px 0", borderBottom: "1px solid #2b2b2b", fontSize: "13px" }}>
      <span style={{ color: "#888" }}>{label}</span>
      <span style={{ color: isBlue ? "#4184f3" : "#cecece", fontWeight: isBlue ? "500" : "400" }}>{value}</span>
    </div>
  );

  return (
    <div style={{ padding: "30px 40px", maxWidth: "1200px", margin: "0 auto" }}>
      
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #2b2b2b", paddingBottom: "20px", marginBottom: "30px" }}>
        <div style={{ display: "flex", gap: "20px", fontSize: "13px", color: "#cecece" }}>
          <span style={{ color: "#ff5722", borderBottom: "2px solid #ff5722", paddingBottom: "20px", marginBottom: "-22px", fontWeight: "500" }}>Funds</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <span style={{ fontSize: "11px", color: "#888" }}>Instant, zero-cost fund transfers with UPI</span>
          <button onClick={() => handleTransaction("add")} style={{ backgroundColor: "#4caf50", color: "#fff", border: "none", padding: "8px 15px", borderRadius: "3px", cursor: "pointer", fontSize: "13px", fontWeight: "500" }}>Add funds</button>
          <button onClick={() => handleTransaction("withdraw")} style={{ backgroundColor: "#4184f3", color: "#fff", border: "none", padding: "8px 15px", borderRadius: "3px", cursor: "pointer", fontSize: "13px", fontWeight: "500" }}>Withdraw</button>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: "flex", gap: "80px" }}>
        
        {/* Equity Column */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
             <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                 <i className="fa-solid fa-chart-pie" style={{ color: "#888" }}></i>
                 <h3 style={{ fontSize: "1rem", color: "#cecece", fontWeight: "400" }}>Equity</h3>
             </div>
             <span style={{ fontSize: "11px", color: "#4184f3", cursor: "pointer" }}><i className="fa-solid fa-circle-info"></i> View statement</span>
          </div>

          <RowItem label="Available margin" value={Number(user.walletBalance).toLocaleString('en-IN', {minimumFractionDigits: 2})} isBlue={true} />
          <RowItem label="Used margin" value="0.00" />
          <RowItem label="Available cash" value={Number(user.walletBalance).toLocaleString('en-IN', {minimumFractionDigits: 2})} />
          
          <div style={{ height: "20px" }}></div>
          
          <RowItem label="Opening balance" value={Number(user.walletBalance).toLocaleString('en-IN', {minimumFractionDigits: 2})} />
          <RowItem label="Payin" value="0.00" />
          <RowItem label="Payout" value="0.00" />
          <RowItem label="SPAN" value="0.00" />
          <RowItem label="Delivery margin" value="0.00" />
          <RowItem label="Exposure" value="0.00" />
          <RowItem label="Options premium" value="0.00" />
          
          <div style={{ height: "20px" }}></div>
          
          <RowItem label="Collateral (Liquid funds)" value="0.00" />
          <RowItem label="Collateral (Equity)" value="0.00" />
          <RowItem label="Total collateral" value="0.00" />
        </div>

        {/* Commodity Column */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
             <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                 <i className="fa-solid fa-droplet" style={{ color: "#888" }}></i>
                 <h3 style={{ fontSize: "1rem", color: "#cecece", fontWeight: "400" }}>Commodity</h3>
             </div>
             <span style={{ fontSize: "11px", color: "#4184f3", cursor: "pointer" }}><i className="fa-solid fa-circle-info"></i> View statement</span>
          </div>

          <RowItem label="Available margin" value="0.00" />
          <RowItem label="Used margin" value="0.00" />
          <RowItem label="Available cash" value="0.00" />
          
          <div style={{ height: "20px" }}></div>
          
          <RowItem label="Opening balance" value="0.00" />
          <RowItem label="Payin" value="0.00" />
          <RowItem label="Payout" value="0.00" />
          <RowItem label="SPAN" value="0.00" />
          <RowItem label="Delivery margin" value="0.00" />
          <RowItem label="Exposure" value="0.00" />
          <RowItem label="Options premium" value="0.00" />
        </div>

      </div>
    </div>
  );
};

export default Funds;