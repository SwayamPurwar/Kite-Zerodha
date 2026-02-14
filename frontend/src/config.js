// Automatically switch between local development and production
export const API_URL = window.location.hostname === "localhost" 
  ? "http://localhost:3002" 
  : "https://kite-zerodha.onrender.com";