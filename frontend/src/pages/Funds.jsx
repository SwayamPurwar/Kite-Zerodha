import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { API_URL } from "../config";
import { UserContext } from "../context/UserContext";
import FundsWindow from "../components/FundsWindow"; 

const Funds = () => {
  const { user, updateBalance } = useContext(UserContext);
  const [transactions, setTransactions] = useState([]);
  const [isWindowOpen, setIsWindowOpen] = useState(false);
  const [windowType, setWindowType] = useState("deposit");

  useEffect(() => {
    fetchTransactions();
  }, [user.walletBalance]); 

  const fetchTransactions = async () => {
    try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/user/transactions`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setTransactions(res.data);
    } catch (err) {
        console.error("Failed to load transactions");
    }
  };

  const openModal = (type) => {
    setWindowType(type);
    setIsWindowOpen(true);
  };

  const handleTransaction = async (amount, type) => {
    const value = type === "deposit" ? Number(amount) : -Number(amount);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_URL}/user/funds`, { amount: value }, { headers: { Authorization: `Bearer ${token}` } });
      updateBalance(res.data.newBalance);
      toast.success(`Successfully ${type === "deposit" ? "added" : "withdrew"} ₹${amount}`);
      setIsWindowOpen(false);
      fetchTransactions(); 
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
      
      {isWindowOpen && (
        <FundsWindow 
            type={windowType} 
            closeWindow={() => setIsWindowOpen(false)} 
            handleTransaction={handleTransaction} 
        />
      )}

      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #2b2b2b", paddingBottom: "20px", marginBottom: "30px" }}>
        <div style={{ display: "flex", gap: "20px", fontSize: "13px", color: "#cecece" }}>
          <span style={{ color: "#ff5722", borderBottom: "2px solid #ff5722", paddingBottom: "20px", marginBottom: "-22px", fontWeight: "500" }}>Funds</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <span style={{ fontSize: "11px", color: "#888" }}>Instant, zero-cost fund transfers with UPI</span>
          <button onClick={() => openModal("deposit")} style={{ backgroundColor: "#4caf50", color: "#fff", border: "none", padding: "8px 15px", borderRadius: "3px", cursor: "pointer", fontSize: "13px", fontWeight: "500" }}>
            <i className="fa-solid fa-plus" style={{marginRight: "5px"}}></i> Add funds
          </button>
          <button onClick={() => openModal("withdraw")} style={{ backgroundColor: "#4184f3", color: "#fff", border: "none", padding: "8px 15px", borderRadius: "3px", cursor: "pointer", fontSize: "13px", fontWeight: "500" }}>
            <i className="fa-solid fa-arrow-rotate-right" style={{marginRight: "5px"}}></i> Withdraw
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: "flex", gap: "80px", marginBottom: "60px" }}>
        
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
          
          {/* UPDATED: Dynamic Used Margin */}
          <RowItem label="Used margin" value={Number(user.usedMargin || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})} />
          
          <RowItem label="Available cash" value={Number(user.walletBalance).toLocaleString('en-IN', {minimumFractionDigits: 2})} />
          <div style={{ height: "20px" }}></div>
          <RowItem label="Opening balance" value={Number(user.walletBalance + (user.usedMargin || 0)).toLocaleString('en-IN', {minimumFractionDigits: 2})} />
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
        </div>
      </div>

      {/* Transaction History Table */}
      <h3 style={{ fontSize: "1.1rem", fontWeight: "400", color: "#cecece", marginBottom: "20px" }}>Recent Transactions</h3>
      
      {transactions.length === 0 ? (
          <div style={{ color: "#888", fontSize: "13px", textAlign: "center", padding: "20px", border: "1px dashed #2b2b2b" }}>
              No recent transactions
          </div>
      ) : (
        <div className="order-table">
          <table>
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Date</th>
                <th style={{ textAlign: "left" }}>Transaction ID</th>
                <th style={{ textAlign: "left" }}>Type</th>
                <th style={{ textAlign: "right" }}>Amount</th>
                <th style={{ textAlign: "right" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn, index) => (
                <tr key={index}>
                  <td style={{ textAlign: "left", color: "#888" }}>{new Date(txn.createdAt).toLocaleString()}</td>
                  <td style={{ textAlign: "left", color: "#cecece" }}>{txn.transactionId}</td>
                  <td style={{ textAlign: "left" }}>
                      <span style={{ 
                          color: txn.type === "DEPOSIT" ? "#4caf50" : "#df514d", 
                          fontWeight: "500",
                          fontSize: "11px",
                          background: txn.type === "DEPOSIT" ? "rgba(76, 175, 80, 0.1)" : "rgba(223, 81, 77, 0.1)",
                          padding: "3px 6px",
                          borderRadius: "3px"
                      }}>
                          {txn.type}
                      </span>
                  </td>
                  <td style={{ textAlign: "right", color: "#cecece", fontWeight: "500" }}>₹{txn.amount.toFixed(2)}</td>
                  <td style={{ textAlign: "right", color: "#4caf50", fontSize: "11px" }}>{txn.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

export default Funds;