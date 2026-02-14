import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./Auth.css";
import { API_URL } from "../config";
import { UserContext } from "../context/UserContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(UserContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });
      
      localStorage.removeItem("avatar");
      login(res.data.token, res.data.walletBalance);
      toast.success(res.data.message);
      
      setTimeout(() => { navigate("/"); }, 1000);
      
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <img 
          src="https://zerodha.com/static/images/logo.svg" 
          alt="Logo" 
          // Added filter to make logo white for dark mode
          style={{ width: "140px", marginBottom: "30px", filter: "invert(1) opacity(0.8)" }} 
        />
        <h2>Login to Kite</h2>
        <form className="auth-form" onSubmit={handleLogin}>
          <input 
            type="email" 
            placeholder="Email Address" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          <button type="submit" className="auth-btn">Login</button>
        </form>
        <p className="auth-link">
          Don't have an account? <span onClick={() => navigate("/signup")}>Sign up</span>
        </p>
      </div>
    </div>
  );
};

export default Login;