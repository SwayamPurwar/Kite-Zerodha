import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./Auth.css";
import { API_URL } from "../config";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/auth/signup`, {
        email,
        password,
        name,
        phone,
      });
      
      localStorage.removeItem("avatar");
      toast.success(res.data.message);
      
      setTimeout(() => {
        navigate("/login");
      }, 1500); 
      
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred during signup");
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
        <h2>Sign up to Kite</h2>
        <form className="auth-form" onSubmit={handleSignup}>
          <input 
            type="text" 
            placeholder="Full Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
          />
          <input 
            type="text" 
            placeholder="Phone Number" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
            required 
          />
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
          <button type="submit" className="auth-btn">Sign Up</button>
        </form>
        <p className="auth-link">
          Already have an account? <span onClick={() => navigate("/login")}>Login</span>
        </p>
      </div>
    </div>
  );
};

export default Signup;