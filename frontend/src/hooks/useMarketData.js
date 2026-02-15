import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { API_URL } from "../config";

// Singleton socket instance to prevent multiple connections
let socket;

export const useMarketData = () => {
  const [marketData, setMarketData] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize socket only once
    if (!socket) {
      socket = io(API_URL, {
        transports: ["websocket"], // Force websocket for better performance
        reconnection: true,
      });
    }

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    
    const handleData = (data) => {
      setMarketData(data);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("market-data", handleData);

    // Cleanup listeners on unmount (but keep socket alive for other components)
    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("market-data", handleData);
    };
  }, []);

  // Helper to get a specific stock's price
  const getPrice = (symbol) => {
    const stock = marketData.find((s) => s.name === symbol);
    return stock ? stock.price : 0;
  };

  return { marketData, isConnected, getPrice };
};