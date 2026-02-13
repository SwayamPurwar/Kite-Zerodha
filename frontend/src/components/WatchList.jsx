import React, { useState, useEffect } from "react";
import { Tooltip, Grow } from "@mui/material";
import { BarChartOutlined, KeyboardArrowDown, KeyboardArrowUp, MoreHoriz } from "@mui/icons-material";
import { io } from "socket.io-client"; 

import BuyActionWindow from "./BuyActionWindow"; 
import SellActionWindow from "./SellActionWindow"; 
import GeneralGraph from "./GeneralGraph"; // NEW: Import Graph Component
import "./WatchList.css";

const WatchList = () => {
  const [watchlist, setWatchlist] = useState([]);
  
  // Window states
  const [isBuyWindowOpen, setIsBuyWindowOpen] = useState(false);
  const [isSellWindowOpen, setIsSellWindowOpen] = useState(false);
  const [isChartOpen, setIsChartOpen] = useState(false); // NEW: Chart State
  
  // Selected stock data
  const [selectedStockUID, setSelectedStockUID] = useState("");
  const [selectedPrice, setSelectedPrice] = useState(0);

  // Connect to Socket.io for live prices
  useEffect(() => {
    const socket = io("http://localhost:3002");

    socket.on("market-data", (data) => {
      setWatchlist(data); 
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleBuyClick = (uid, currentPrice) => {
    setSelectedStockUID(uid);
    setSelectedPrice(currentPrice); 
    setIsBuyWindowOpen(true);
    setIsSellWindowOpen(false);
    setIsChartOpen(false);
  };

  const handleSellClick = (uid, currentPrice) => {
    setSelectedStockUID(uid);
    setSelectedPrice(currentPrice);
    setIsSellWindowOpen(true);
    setIsBuyWindowOpen(false);
    setIsChartOpen(false);
  };

  // NEW: Handler to open the graph
  const handleChartClick = (uid) => {
    setSelectedStockUID(uid);
    setIsChartOpen(true);
    setIsBuyWindowOpen(false);
    setIsSellWindowOpen(false);
  };

  const handleCloseWindows = () => {
    setIsBuyWindowOpen(false);
    setIsSellWindowOpen(false);
    setIsChartOpen(false);
    setSelectedStockUID("");
  };

  return (
    <div className="watchlist-sub-container">
      
      {/* Action Windows */}
      {isBuyWindowOpen && <BuyActionWindow uid={selectedStockUID} currentPrice={selectedPrice} closeBuyWindow={handleCloseWindows} />}
      {isSellWindowOpen && <SellActionWindow uid={selectedStockUID} currentPrice={selectedPrice} closeSellWindow={handleCloseWindows} />}
      {isChartOpen && <GeneralGraph uid={selectedStockUID} closeChart={handleCloseWindows} />}

      <div className="search-container">
        <input type="text" placeholder="Search eg: infy, bse..." className="search" />
        <span className="counts"> {watchlist.length} / 50</span>
      </div>

      <ul className="list">
        {watchlist.map((stock, index) => (
          <li key={index}>
            <div className="item">
              <p className={stock.isDown ? "down" : "up"}>{stock.name}</p>
              <div className="itemInfo">
                  <span className="percent">{stock.percent}</span>
                  {stock.isDown ? <KeyboardArrowDown className="down"/> : <KeyboardArrowUp className="up"/>} 
              </div>
            </div>
            
            <div className="item">
              <span className={`price ${stock.isDown ? "down" : "up"}`}>{stock.price}</span>
            </div>

            <div className="actions">
                <Tooltip title="Buy (B)" placement="top" arrow TransitionComponent={Grow}>
                    <button className="action-btn buy-btn" onClick={() => handleBuyClick(stock.name, stock.price)}>B</button>
                </Tooltip>
                
                <Tooltip title="Sell (S)" placement="top" arrow TransitionComponent={Grow}>
                    <button className="action-btn sell-btn" onClick={() => handleSellClick(stock.name, stock.price)}>S</button>
                </Tooltip>
                
                {/* NEW: Updated Analytics Button */}
                <Tooltip title="Analytics (A)" placement="top" arrow TransitionComponent={Grow}>
                    <button className="action-btn" onClick={() => handleChartClick(stock.name)}>
                        <BarChartOutlined className="icon"/>
                    </button>
                </Tooltip>
                
                <Tooltip title="More" placement="top" arrow TransitionComponent={Grow}>
                    <button className="action-btn"><MoreHoriz className="icon"/></button>
                </Tooltip>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WatchList;