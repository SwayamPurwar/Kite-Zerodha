import React, { useState, useEffect } from "react";
import { Tooltip, Grow } from "@mui/material";
import { BarChartOutlined, KeyboardArrowDown, KeyboardArrowUp, MoreHoriz } from "@mui/icons-material";
import { io } from "socket.io-client"; 
import { API_URL } from "../config";
import axios from "axios";
import OrderWindow from "./OrderWindow"; 
import CandleStickChart from "./CandleStickChart";
import "./WatchList.css";

const WatchList = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [isBuyWindowOpen, setIsBuyWindowOpen] = useState(false);
  const [isSellWindowOpen, setIsSellWindowOpen] = useState(false);
  const [isChartOpen, setIsChartOpen] = useState(false); 
  const [selectedStockUID, setSelectedStockUID] = useState("");
  const [selectedPrice, setSelectedPrice] = useState(0);

  // 1. WebSocket for updating whichever list is currently being viewed
  useEffect(() => {
    const socket = io(API_URL); 

    axios.get(`${API_URL}/market/prices`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    }).then(res => setWatchlist(res.data));

    socket.on("market-data", (data) => {
       setWatchlist(data); // Update standard watchlist
       
       // Sync real-time prices to search results if they are actively being viewed
       setSearchResults(prev => prev.map(searchedItem => {
           const liveUpdate = data.find(d => d.name === searchedItem.name);
           return liveUpdate ? liveUpdate : searchedItem;
       }));
    });

    return () => socket.disconnect();
  }, []);

  // 2. Debounced API call for searching UNLIMITED stocks
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length > 1) {
        setIsSearching(true);
        axios.get(`${API_URL}/market/search?q=${searchQuery}`)
          .then(res => {
            setSearchResults(res.data);
            setIsSearching(false);
          })
          .catch(err => {
            console.error("Search Error", err);
            setIsSearching(false);
          });
      } else {
        setSearchResults([]);
      }
    }, 500); // Waits 500ms after you stop typing to fetch data

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleBuyClick = (uid, currentPrice) => {
    setSelectedStockUID(uid); setSelectedPrice(currentPrice); 
    setIsBuyWindowOpen(true); setIsSellWindowOpen(false); setIsChartOpen(false);
  };
  const handleSellClick = (uid, currentPrice) => {
    setSelectedStockUID(uid); setSelectedPrice(currentPrice);
    setIsSellWindowOpen(true); setIsBuyWindowOpen(false); setIsChartOpen(false);
  };
  const handleChartClick = (uid) => {
    setSelectedStockUID(uid);
    setIsChartOpen(true); setIsBuyWindowOpen(false); setIsSellWindowOpen(false);
  };
  const handleCloseWindows = () => {
    setIsBuyWindowOpen(false); setIsSellWindowOpen(false); setIsChartOpen(false);
  };

  // Determine what list to show: Search Results or Default Watchlist
  const displayList = searchQuery.length > 1 ? searchResults : watchlist;

  return (
    <div className="watchlist-sub-container">
      {isBuyWindowOpen && <OrderWindow uid={selectedStockUID} currentPrice={selectedPrice} closeWindow={handleCloseWindows} mode="BUY" />}
      {isSellWindowOpen && <OrderWindow uid={selectedStockUID} currentPrice={selectedPrice} closeWindow={handleCloseWindows} mode="SELL" />}
      {isChartOpen && (
    <CandleStickChart 
        uid={selectedStockUID} 
        closeChart={handleCloseWindows} 
    />
)}

      <div className="search-container">
        <input 
          type="text" 
          placeholder="Search eg: infy, bse, zoloto..." 
          className="search" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <span className="counts">{displayList.length} / 50</span>
      </div>

      <ul className="list">
        {isSearching && searchQuery.length > 1 ? (
           <li style={{ padding: "20px", textAlign: "center", color: "#888", borderBottom: "none" }}>Searching Market...</li>
        ) : displayList.length === 0 && searchQuery.length > 1 ? (
           <li style={{ padding: "20px", textAlign: "center", color: "#888", borderBottom: "none" }}>No stocks found for "{searchQuery}"</li>
        ) : (
          displayList.map((stock, index) => (
            <li key={index}>
              <div className="item">
                <p className={stock.isDown ? "loss" : "profit"}>{stock.name}</p>
                <span style={{fontSize: "9px", color: "#666", marginLeft: "5px", border: "1px solid #333", padding: "1px 3px", borderRadius: "2px"}}>
                   {stock.exchange || "NSE"}
                </span>
              </div>
              
              <div className="item">
                <span className="percent">{stock.percent}</span>
                {stock.isDown ? <KeyboardArrowDown style={{fontSize:"14px", color:"#df514d"}}/> : <KeyboardArrowUp style={{fontSize:"14px", color:"#4caf50"}}/>} 
                <span className={`price ${stock.isDown ? "loss" : "profit"}`}>{stock.price.toFixed(2)}</span>
              </div>

              <div className="actions">
                  <Tooltip title="Buy (B)" placement="top" arrow TransitionComponent={Grow}>
                      <button className="action-btn buy-btn" onClick={() => handleBuyClick(stock.name, stock.price)}>B</button>
                  </Tooltip>
                  <Tooltip title="Sell (S)" placement="top" arrow TransitionComponent={Grow}>
                      <button className="action-btn sell-btn" onClick={() => handleSellClick(stock.name, stock.price)}>S</button>
                  </Tooltip>
                  <Tooltip title="Analytics (A)" placement="top" arrow TransitionComponent={Grow}>
                      <button className="action-btn" onClick={() => handleChartClick(stock.name)}><BarChartOutlined className="icon"/></button>
                  </Tooltip>
                  <Tooltip title="More" placement="top" arrow TransitionComponent={Grow}>
                      <button className="action-btn"><MoreHoriz className="icon"/></button>
                  </Tooltip>
              </div>
            </li>
          ))
        )}
      </ul>
      
      <div className="watchlist-pagination">
        <div className="pages">
          <span className="active">1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
          <span>6</span>
        </div>
        <div><i className="fa-solid fa-gear"></i></div>
      </div>
    </div>
  );
};

export default WatchList;