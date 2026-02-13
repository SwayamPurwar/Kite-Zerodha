import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./Auth.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3002/auth/login", {
        email,
        password,
      });
      
      // IMPORTANT: Clear any leftover avatar from a previous user's session
      localStorage.removeItem("avatar");
      
      // Save the new user's secure details
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("walletBalance", res.data.walletBalance);
      
      // Show success toast
      toast.success(res.data.message);
      
      // Wait 1.5 seconds for the toast to show, then redirect and reload the app state
      setTimeout(() => {
        navigate("/"); 
        window.location.reload(); 
      }, 1500);
      
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <img src="https://zerodha.com/static/images/logo.svg" alt="Logo" style={{ width: "150px", marginBottom: "20px" }} />
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
          Don't have an account? <span onClick={() => navigate("/signup")}>Sign up here</span>
        </p>
      </div>
    </div>
  );
};

export default Login;