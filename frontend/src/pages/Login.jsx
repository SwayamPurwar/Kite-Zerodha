import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./Auth.css";
import { API_URL } from "../config";
import { UserContext } from "../context/UserContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // Step 1: Email, Step 2: OTP
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useContext(UserContext);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/send-otp`, { email });
      toast.success(res.data.message);
      setStep(2); // Move to OTP screen
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/verify-otp`, { email, otp });
      
      localStorage.removeItem("avatar");
      login(res.data.token, res.data.walletBalance);
      toast.success(res.data.message);
      
      setTimeout(() => { navigate("/"); }, 1000);
      
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP");
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
        
        {step === 1 ? (
            <form className="auth-form" onSubmit={handleSendOtp}>
              <input 
                type="email" 
                placeholder="Email Address" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
              <button type="submit" className="auth-btn" disabled={isLoading}>
                {isLoading ? "Sending..." : "Get OTP"}
              </button>
            </form>
        ) : (
            <form className="auth-form" onSubmit={handleVerifyOtp}>
              <p style={{ color: "#888", fontSize: "13px", margin: "0 0 15px 0" }}>
                  OTP sent to <strong>{email}</strong>
              </p>
              <input 
                type="text" 
                placeholder="Enter 6-digit OTP" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value)} 
                maxLength="6"
                required 
                style={{ textAlign: "center", letterSpacing: "5px", fontSize: "18px" }}
              />
              <button type="submit" className="auth-btn" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Verify & Login"}
              </button>
              
              <span 
                onClick={() => setStep(1)} 
                style={{ color: "#4184f3", fontSize: "12px", cursor: "pointer", marginTop: "15px", display: "inline-block" }}
              >
                Change Email
              </span>
            </form>
        )}

        <p className="auth-link">
          Don't have an account? <span onClick={() => navigate("/signup")}>Sign up</span>
        </p>
      </div>
    </div>
  );
};

export default Login;