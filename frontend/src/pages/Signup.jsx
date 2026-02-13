import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./Auth.css";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3002/auth/signup", {
        email,
        password,
      });
      
      // IMPORTANT: Clear any leftover avatar from a previous user's session
      localStorage.removeItem("avatar");
      
      // Show success toast
      toast.success(res.data.message);
      
      // Wait 1.5 seconds for the toast to show, then redirect to login
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
        <img src="https://zerodha.com/static/images/logo.svg" alt="Logo" style={{ width: "150px", marginBottom: "20px" }} />
        <h2>Sign up to Kite</h2>
        <form className="auth-form" onSubmit={handleSignup}>
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
          Already have an account? <span onClick={() => navigate("/login")}>Login here</span>
        </p>
      </div>
    </div>
  );
};

export default Signup;