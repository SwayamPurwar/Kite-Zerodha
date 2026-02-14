import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../context/UserContext"; 
import { io } from "socket.io-client"; // Import socket
import { API_URL } from "../config";
import "./TopBar.css";

const TopBar = () => {
  const { user } = useContext(UserContext);
  const [indices, setIndices] = useState({
    nifty: { price: 0, change: 0, percent: 0 },
    sensex: { price: 0, change: 0, percent: 0 }
  });

  useEffect(() => {
    const socket = io(API_URL);

    socket.on("market-data", (data) => {
      const niftyData = data.find(s => s.name === "^NSEI");
      const sensexData = data.find(s => s.name === "^BSESN");

      if (niftyData && sensexData) {
        setIndices({
          nifty: {
            price: niftyData.price,
            // Calculate raw change since Yahoo only gives percent sometimes
            // Or just parse the percentage string you already have
            percent: niftyData.percent 
          },
          sensex: {
            price: sensexData.price,
            percent: sensexData.percent
          }
        });
      }
    });

    return () => socket.disconnect();
  }, []);

  const initials = user.name ? user.name.substring(0,2).toUpperCase() : "UR";

  return (
    <div className="topbar-container">
      {/* Left: Tickers */}
      <div className="left-section">
        <div className="index-item">
          <strong>NIFTY 50</strong> 
          <span className="value">{indices.nifty.price.toFixed(2)}</span> 
          <span className="change">{indices.nifty.percent}</span>
        </div>
        <div className="index-item">
          <strong>SENSEX</strong> 
          <span className="value">{indices.sensex.price.toFixed(2)}</span> 
          <span className="change">{indices.sensex.percent}</span>
        </div>
      </div>

      {/* ... Keep the Center and Right sections exactly as they were ... */}
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