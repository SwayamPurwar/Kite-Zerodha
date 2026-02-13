import React from "react";
import { Link } from "react-router-dom";
import "./TopBar.css";

const TopBar = () => {
  const avatar = localStorage.getItem("avatar");

  return (
    <div className="topbar-container">
      <div className="logo-section">
        <img 
          src="https://zerodha.com/static/images/logo.svg" 
          alt="Logo" 
          style={{ height: "20px", marginRight: "10px" }} 
        />
        <div className="divider">|</div>
        <div className="link" style={{ fontWeight: "500", color: "#444" }}>Kite</div>
      </div>

      <div className="menu-section">
        <div className="menu-item"><Link to="/" style={{ textDecoration: "none", color: "#444" }}>Dashboard</Link></div>
        <div className="menu-item"><Link to="/orders" style={{ textDecoration: "none", color: "#444" }}>Orders</Link></div>
        <div className="menu-item"><Link to="/holdings" style={{ textDecoration: "none", color: "#444" }}>Holdings</Link></div>
        <div className="menu-item"><Link to="/positions" style={{ textDecoration: "none", color: "#444" }}>Positions</Link></div>
        <div className="menu-item"><Link to="/funds" style={{ textDecoration: "none", color: "#444" }}>Funds</Link></div>
      </div>

      <Link to="/account" style={{ textDecoration: "none" }}>
        <div className="profile-section" style={{ cursor: "pointer" }}>
          
          {/* Avatar Rendering */}
          <div className="avatar" style={{ overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "center", width: "30px", height: "30px", borderRadius: "50%", backgroundColor: "#e8eaf6", color: "#3f51b5", fontSize: "12px", fontWeight: "bold" }}>
            {avatar && avatar !== "undefined" ? (
              <img src={avatar} alt="User" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              "KB"
            )}
          </div>
          
          <div className="userid" style={{ color: "#444", fontWeight: "500" }}>Profile</div>
        </div>
      </Link>
    </div>
  );
};

export default TopBar;