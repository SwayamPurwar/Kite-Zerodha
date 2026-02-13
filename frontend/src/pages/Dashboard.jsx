import React, { useState, useEffect } from "react";
import axios from "axios";
import Positions from "../components/Positions";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const balance = localStorage.getItem("walletBalance") || "0.00";
  const [userName, setUserName] = useState("User"); // Default fallback

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:3002/user/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Extract the name from the email (e.g., "johndoe" from "johndoe@email.com")
        const emailPrefix = res.data.email.split('@')[0];
        
        // Capitalize the first letter for a nice greeting (e.g., "Johndoe")
        const formattedName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
        
        setUserName(formattedName);
      } catch (error) {
        console.error("Failed to fetch user name:", error);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div style={{ padding: "30px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ color: "#444", fontWeight: "400" }}>Hi, {userName}</h2>
      </div>
      
      <hr style={{ border: "none", borderBottom: "1px solid #eee", marginBottom: "40px" }} />

      <div style={{ display: "flex", gap: "40px" }}>
        {/* Left Side: The Chart */}
        <div style={{ flex: 1, backgroundColor: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <Positions />
        </div>

        {/* Right Side: Account Overview */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
          
          <div style={{ border: "1px solid #eee", padding: "30px", borderRadius: "8px", backgroundColor: "#fff" }}>
            <h3 style={{ fontSize: "1.1rem", color: "#666", marginBottom: "15px", fontWeight: "500" }}>
              <i className="fa-solid fa-wallet" style={{ marginRight: "10px", color: "#4184f3" }}></i>
              Equity Margin
            </h3>
            <p style={{ fontSize: "2.5rem", color: "#444", margin: "10px 0", fontWeight: "400" }}>
              ₹{Number(balance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p style={{ color: "#888", fontSize: "0.9rem" }}>Available cash to trade</p>
            
            <Link to="/funds" style={{ 
              color: "#fff", 
              backgroundColor: "#387ed1", 
              padding: "10px 20px", 
              borderRadius: "4px",
              textDecoration: "none", 
              marginTop: "20px", 
              display: "inline-block",
              fontSize: "0.9rem"
            }}>
              View Funds
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;