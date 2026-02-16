import React, { useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { API_URL } from "../config";
import { UserContext } from "../context/UserContext";

const TelegramSettings = () => {
  const { user } = useContext(UserContext);
  
  // Pre-fill the input if the user already has an ID saved
  const [telegramId, setTelegramId] = useState(user?.telegramChatId || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Get the JWT token from local storage
      const token = localStorage.getItem("token"); 
      
      const res = await axios.post(
        `${API_URL}/user/update-telegram`, 
        { telegramChatId: telegramId },
        { headers: { Authorization: `Bearer ${token}` } } // Pass token for security
      );
      
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save ID");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", border: "1px solid #444", borderRadius: "8px", marginTop: "20px", maxWidth: "500px" }}>
      <h3>📱 Setup Telegram Push Alerts</h3>
      <p style={{ color: "#888", marginBottom: "15px" }}>
        Get instant notifications on your phone when your GTT orders execute, even if the app is closed.
      </p>

      {/* User Instructions Box */}
      <div style={{ backgroundColor: "#1e1e1e", padding: "15px", borderRadius: "5px", marginBottom: "20px" }}>
        <h4 style={{ marginTop: 0 }}>How to get your Telegram Chat ID:</h4>
        <ol style={{ color: "#bbb", paddingLeft: "20px", lineHeight: "1.6", margin: 0 }}>
          <li>Open your Telegram app.</li>
          <li>Search for the bot <strong>@userinfobot</strong> in the top search bar.</li>
          <li>Click on the bot and press <strong>Start</strong>.</li>
          <li>It will instantly reply with a numeric ID (e.g., <code>123456789</code>).</li>
          <li>Copy that exact number and paste it below.</li>
        </ol>
      </div>

      {/* Save Form */}
      <form onSubmit={handleSave} style={{ display: "flex", gap: "10px" }}>
        <input 
          type="text" 
          placeholder="Enter your Chat ID..." 
          value={telegramId}
          onChange={(e) => setTelegramId(e.target.value)}
          required
          style={{ flex: 1, padding: "10px", borderRadius: "4px", border: "1px solid #555", backgroundColor: "#222", color: "#fff" }}
        />
        <button 
          type="submit" 
          disabled={isLoading}
          style={{ padding: "10px 20px", backgroundColor: "#387ed1", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          {isLoading ? "Saving..." : "Save ID"}
        </button>
      </form>
    </div>
  );
};

export default TelegramSettings;