import React, { useState, useEffect } from "react";
import { Tooltip, Grow } from "@mui/material";
import { 
  BarChartOutlined, 
  KeyboardArrowDown, 
  KeyboardArrowUp, 
  MoreHoriz,
  Add,
  Delete // ✅ Import Delete Icon
} from "@mui/icons-material";
import { io } from "socket.io-client"; 
import { API_URL } from "../config";
import axios from "axios";
import { toast } from "react-toastify"; 
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

  // 1. Fetch USER Watchlist
  const fetchWatchlist = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.get(`${API_URL}/market/my-watchlist`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWatchlist(res.data);
    } catch (err) {
      console.error("Error fetching watchlist", err);
    }
  };

  useEffect(() => {
    fetchWatchlist();
    
    const socket = io(API_URL); 
    socket.on("market-data", (data) => {
       setWatchlist(prevList => prevList.map(item => {
          const updatedItem = data.find(d => d.name === item.name);
          return updatedItem ? updatedItem : item;
       }));
       
       setSearchResults(prev => prev.map(searchedItem => {
           const liveUpdate = data.find(d => d.name === searchedItem.name);
           return liveUpdate ? liveUpdate : searchedItem;
       }));
    });

    return () => socket.disconnect();
  }, []);

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
    }, 500); 

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // 2. Add to Watchlist Handler
  const handleAddToWatchlist = async (symbol) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_URL}/market/watchlist/add`, 
        { symbol }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`${symbol} added to watchlist`);
      fetchWatchlist(); 
      setSearchQuery(""); 
      setSearchResults([]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add");
    }
  };

  // ✅ 3. Remove from Watchlist Handler
  const handleRemoveFromWatchlist = async (symbol) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_URL}/market/watchlist/remove`, 
        { symbol }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.info(`${symbol} removed`);
      fetchWatchlist(); // Refresh list immediately
    } catch (err) {
      toast.error("Failed to remove");
    }
  };

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

  const displayList = searchQuery.length > 1 ? searchResults : watchlist;

  return (
    <div className="watchlist-sub-container">
      {isBuyWindowOpen && <OrderWindow uid={selectedStockUID} currentPrice={selectedPrice} closeWindow={handleCloseWindows} mode="BUY" />}
      {isSellWindowOpen && <OrderWindow uid={selectedStockUID} currentPrice={selectedPrice} closeWindow={handleCloseWindows} mode="SELL" />}
      {isChartOpen && <CandleStickChart uid={selectedStockUID} closeChart={handleCloseWindows} />}

      <div className="search-container">
        <input 
          type="text" 
          placeholder="Search & Add (e.g. RELIANCE, TCS)" 
          className="search" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <span className="counts">{watchlist.length} / 50</span>
      </div>

      <ul className="list">
        {isSearching && searchQuery.length > 1 ? (
           <li style={{ padding: "20px", textAlign: "center", color: "#888", borderBottom: "none" }}>Searching Market...</li>
        ) : displayList.length === 0 && searchQuery.length > 1 ? (
           <li style={{ padding: "20px", textAlign: "center", color: "#888", borderBottom: "none" }}>No stocks found for "{searchQuery}"</li>
        ) : (
          displayList.map((stock, index) => {
            const isInWatchlist = watchlist.some(w => w.name === stock.name);

            return (
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
                    {/* CASE 1: Searching + Not in List -> ADD BUTTON */}
                    {searchQuery.length > 1 && !isInWatchlist ? (
                        <Tooltip title="Add to Watchlist" placement="top" arrow TransitionComponent={Grow}>
                            <button className="action-btn" style={{backgroundColor: "#4caf50", color: "#fff"}} onClick={() => handleAddToWatchlist(stock.name)}>
                               <Add style={{ fontSize: "16px" }}/>
                            </button>
                        </Tooltip>
                    ) : (
                      <>
                        <Tooltip title="Buy (B)" placement="top" arrow TransitionComponent={Grow}>
                            <button className="action-btn buy-btn" onClick={() => handleBuyClick(stock.name, stock.price)}>B</button>
                        </Tooltip>
                        <Tooltip title="Sell (S)" placement="top" arrow TransitionComponent={Grow}>
                            <button className="action-btn sell-btn" onClick={() => handleSellClick(stock.name, stock.price)}>S</button>
                        </Tooltip>
                        <Tooltip title="Analytics (A)" placement="top" arrow TransitionComponent={Grow}>
                            <button className="action-btn" onClick={() => handleChartClick(stock.name)}><BarChartOutlined className="icon"/></button>
                        </Tooltip>
                        
                        {/* ✅ CASE 2: Already in Watchlist -> REMOVE BUTTON */}
                        <Tooltip title="Remove" placement="top" arrow TransitionComponent={Grow}>
                            <button className="action-btn" style={{color: "#df514d"}} onClick={() => handleRemoveFromWatchlist(stock.name)}>
                               <Delete className="icon" style={{color: "#df514d"}}/>
                            </button>
                        </Tooltip>
                      </>
                    )}
                </div>
              </li>
            );
          })
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