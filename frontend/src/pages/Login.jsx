import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./Auth.css";
import { API_URL } from "../config";
import { UserContext } from "../context/UserContext";

const Login = () => {
  const [identifier, setIdentifier] = useState(""); 
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useContext(UserContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { identifier, password });
      
      localStorage.removeItem("avatar");
      login(res.data.token, res.data.walletBalance);
      toast.success("Welcome back to Kite!");
      
      setTimeout(() => { navigate("/"); }, 1000);
      
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <img 
          src="https://zerodha.com/static/images/logo.svg" 
          alt="Logo" 
          style={{ width: "140px", marginBottom: "30px", filter: "invert(1) opacity(0.8)" }} 
        />
        <h2>Login to Kite</h2>
        
        <form className="auth-form" onSubmit={handleLogin}>
          <input 
            type="text" 
            placeholder="Email Address or Phone Number" 
            value={identifier} 
            onChange={(e) => setIdentifier(e.target.value)} 
            disabled={isLoading} 
            autoFocus 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            disabled={isLoading} 
            required 
          />
          <button type="submit" className="auth-btn" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="auth-link">
          Don't have an account? <span onClick={() => navigate("/signup")}>Sign up</span>
        </p>
      </div>
    </div>
  );
};

export default Login;