import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../context/UserContext"; 
import "./TopBar.css";

const TopBar = () => {
  const { user } = useContext(UserContext);
  const initials = user.name ? user.name.substring(0,2).toUpperCase() : (user.email ? user.email.substring(0,2).toUpperCase() : "JU");

  return (
    <div className="topbar-container">
      {/* Left: Tickers */}
      <div className="left-section">
        <div className="index-item">
          <strong>NIFTY 50</strong> <span className="value">25471.10</span> <span className="change">-336.10 (-1.30%)</span>
        </div>
        <div className="index-item">
          <strong>SENSEX</strong> <span className="value">82626.76</span> <span className="change">-1048.16 (-1.25%)</span>
        </div>
      </div>

      {/* Center: Logo & Nav */}
      <div className="center-section">
        <img src="https://zerodha.com/static/images/logo.svg" alt="Logo" style={{ height: "16px", filter: "brightness(0) invert(1) sepia(1) saturate(10000%) hue-rotate(15deg) opacity(0.8)" }} />
        
        <div className="menu-section">
          <div className="menu-item"><Link to="/">Dashboard</Link></div>
          <div className="menu-item"><Link to="/orders">Orders</Link></div>
          <div className="menu-item"><Link to="/holdings">Holdings</Link></div>
          <div className="menu-item"><Link to="/positions">Positions</Link></div>
          <div className="menu-item"><Link to="/funds">Funds</Link></div>
        </div>
      </div>

      {/* Right: Profile */}
      <Link to="/account" style={{ textDecoration: "none" }}>
        <div className="profile-section" style={{ cursor: "pointer" }}>
          <div className="avatar">
            {user.avatar ? <img src={user.avatar} alt="User" style={{ width: "100%", height: "100%", borderRadius:"50%", objectFit: "cover" }} /> : initials}
          </div>
          <div className="userid">{user.email ? user.email.split('@')[0].toUpperCase() : "USER"}</div>
        </div>
      </Link>
    </div>
  );
};

export default TopBar;