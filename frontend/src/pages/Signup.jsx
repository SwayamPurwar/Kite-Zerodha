import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./Auth.css";
import { API_URL } from "../config";
import { UserContext } from "../context/UserContext";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
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

  const handleSignupStep1 = async (e) => {
    if (e) e.preventDefault();
    if(phone.length !== 10) return toast.error("Please enter a valid 10-digit phone number");

    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/signup`, { email, password, name, phone });
      toast.success(res.data.message);
      setStep(2); 
      setTimer(60); 
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // ✅ FIX: Send 'identifier' instead of 'phone' to match backend
      const res = await axios.post(`${API_URL}/auth/verify-otp`, { 
        identifier: phone, 
        otp 
      });
      
      localStorage.removeItem("avatar");
      login(res.data.token, res.data.walletBalance);
      
      toast.success("Signup complete! Welcome to Kite.");
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
        <h2>Sign up to Kite</h2>
        
        {step === 1 ? (
            <form className="auth-form" onSubmit={handleSignupStep1}>
              <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
              <div style={{ display: "flex", gap: "10px" }}>
                  <input type="text" value="+91" disabled style={{ width: "50px", textAlign: "center", backgroundColor: "#1e1e1e", color: "#888" }} />
                  <input 
                    type="tel" placeholder="10-digit Mobile Number" value={phone} 
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    maxLength="10" required style={{ flex: 1 }}
                  />
              </div>
              <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <input type="password" placeholder="Create Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="submit" className="auth-btn" disabled={isLoading}>{isLoading ? "Sending OTP..." : "Sign Up"}</button>
            </form>
        ) : (
            <form className="auth-form" onSubmit={handleVerifyOtp}>
              <p style={{ color: "#888", fontSize: "13px", margin: "0 0 15px 0" }}>Verification OTP sent to <strong>+91 {phone}</strong></p>
              <input 
                type="text" placeholder="Enter 6-digit OTP" value={otp} 
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} 
                maxLength="6" required style={{ textAlign: "center", letterSpacing: "5px", fontSize: "18px" }}
              />
              <button type="submit" className="auth-btn" disabled={isLoading}>{isLoading ? "Verifying..." : "Verify & Start Trading"}</button>

              <div style={{ marginTop: "20px", fontSize: "13px", textAlign: "center" }}>
                  {timer > 0 ? (
                    <span style={{ color: "#888" }}>Resend OTP in <strong>{timer}s</strong></span>
                  ) : (
                    <span onClick={handleSignupStep1} style={{ color: "#4184f3", cursor: "pointer", fontWeight: "bold" }}>Resend OTP</span>
                  )}
              </div>
              <span onClick={() => setStep(1)} style={{ color: "#888", fontSize: "12px", cursor: "pointer", marginTop: "15px", display: "inline-block" }}>← Go Back</span>
            </form>
        )}
        {step === 1 && (
            <p className="auth-link">Already have an account? <span onClick={() => navigate("/login")}>Login</span></p>
        )}
      </div>
    </div>
  );
};

export default Signup;