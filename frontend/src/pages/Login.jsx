import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./Auth.css";
import { API_URL } from "../config";
import { UserContext } from "../context/UserContext";

const Login = () => {
  const [identifier, setIdentifier] = useState(""); 
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); 
  const [timer, setTimer] = useState(0); 
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useContext(UserContext);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/send-otp`, { identifier });
      toast.success(res.data.message);
      setStep(2); 
      setTimer(60); 
    } catch (error) {
      toast.error(error.response?.data?.message || "User not found");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/verify-otp`, { identifier, otp });
      
      localStorage.removeItem("avatar");
      login(res.data.token, res.data.walletBalance);
      toast.success("Welcome back to Kite!");
      
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
                type="email" // Changed input type to email
                placeholder="Email Address" // Changed placeholder
                value={identifier} 
                onChange={(e) => setIdentifier(e.target.value)} 
                disabled={isLoading} 
                autoFocus 
                required 
              />
              <button type="submit" className="auth-btn" disabled={isLoading}>
                {isLoading ? "Sending..." : "Get OTP"}
              </button>
            </form>
        ) : (
            <form className="auth-form" onSubmit={handleVerifyOtp}>
              <p style={{ color: "#888", fontSize: "13px", margin: "0 0 15px 0" }}>
                  OTP sent to <strong>{identifier}</strong>
              </p>
              <input 
                type="text" 
                placeholder="Enter 6-digit OTP" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} 
                maxLength="6"
                disabled={isLoading}
                autoFocus
                required 
                style={{ textAlign: "center", letterSpacing: "5px", fontSize: "18px" }}
              />
              <button type="submit" className="auth-btn" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Verify & Login"}
              </button>

              <div style={{ marginTop: "20px", fontSize: "13px", textAlign: "center" }}>
                  {timer > 0 ? (
                    <span style={{ color: "#888" }}>Resend OTP in <strong>{timer}s</strong></span>
                  ) : (
                    <span 
                      onClick={handleSendOtp} 
                      style={{ color: "#4184f3", cursor: "pointer", fontWeight: "bold" }}
                    >
                      Resend OTP
                    </span>
                  )}
              </div>
              
              <span 
                onClick={() => { setStep(1); setOtp(""); }} 
                style={{ color: "#888", fontSize: "12px", cursor: "pointer", marginTop: "15px", display: "inline-block" }}
              >
                ← Use different Email
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