import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { API_URL } from "../config";
const Account = () => {
  const [userData, setUserData] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null); 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/user/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserData(res.data);
        
        // Save avatar to local storage for the TopBar
        if (res.data.avatar) {
          localStorage.setItem("avatar", res.data.avatar);
        }
      } catch (error) {
        toast.error("Failed to load profile data");
      }
    };

    fetchProfile();
  }, []);

  // Convert File to Base64 String
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => resolve(fileReader.result);
      fileReader.onerror = (error) => reject(error);
    });
  };

  // Handle Image Selection
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // INCREASED LIMIT: Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return toast.warning("Image must be smaller than 10MB");
    }

    setIsUploading(true);
    try {
      const base64Image = await convertToBase64(file);
      const token = localStorage.getItem("token");

      const res = await axios.put(`${API_URL}/user/avatar`, 
        { avatar: base64Image }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUserData(res.data.user);
      localStorage.setItem("avatar", res.data.user.avatar);
      
      toast.success(res.data.message);
      
      // Update the TopBar instantly
      setTimeout(() => window.location.reload(), 1000);
      
    } catch (error) {
      // If the backend rejects it because it's still too large, show this:
      if (error.response?.status === 413) {
         toast.error("Image is too large for the server to process.");
      } else {
         toast.error("Failed to upload image.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("walletBalance");
    localStorage.removeItem("avatar"); // Clear avatar on logout
    toast.info("Logged out successfully");
    setTimeout(() => { navigate("/login"); window.location.reload(); }, 1000);
  };

  if (!userData) return <div style={{ padding: "50px", textAlign: "center" }}>Loading profile...</div>;

  const joinDate = new Date(userData.createdAt).toLocaleDateString("en-IN", {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div style={{ padding: "30px", maxWidth: "800px", margin: "0 auto" }}>
      <h2 style={{ color: "#444", fontWeight: "500", marginBottom: "20px" }}>Account & Settings</h2>
      <hr style={{ border: "none", borderBottom: "1px solid #eee", marginBottom: "30px" }} />

      <div style={{ display: "flex", gap: "30px" }}>
        
        {/* Left Side: Profile Card */}
        <div style={{ flex: 1, border: "1px solid #eee", padding: "30px", borderRadius: "8px", backgroundColor: "#fff", textAlign: "center", height: "fit-content" }}>
          
          {/* Clickable Avatar Container */}
          <div 
            onClick={() => fileInputRef.current.click()} 
            style={{ 
              width: "100px", height: "100px", borderRadius: "50%", backgroundColor: "#e8eaf6", 
              color: "#3f51b5", fontSize: "35px", display: "flex", alignItems: "center", 
              justifyContent: "center", margin: "0 auto 20px auto", fontWeight: "bold",
              cursor: "pointer", overflow: "hidden", position: "relative",
              border: "3px solid #f0f3fa", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
            }}
            title="Click to change profile picture"
          >
            {isUploading ? (
              <span style={{ fontSize: "14px", color: "#888" }}>...</span>
            ) : userData.avatar ? (
              <img src={userData.avatar} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              userData.email.charAt(0).toUpperCase()
            )}
            
            <input 
              type="file" 
              accept="image/jpeg, image/png, image/jpg"
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              style={{ display: "none" }} 
            />
          </div>
          
          <h3 style={{ fontSize: "1.2rem", color: "#444", margin: "0 0 5px 0" }}>{userData.email}</h3>
          <p style={{ color: "#888", fontSize: "0.9rem", margin: "0 0 20px 0" }}>User ID: {userData._id.substring(0, 8).toUpperCase()}</p>
          
          <button onClick={handleLogout} style={{ backgroundColor: "#fff", color: "#df514d", border: "1px solid #df514d", padding: "10px 20px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", width: "100%", transition: "0.2s" }} onMouseOver={(e) => { e.target.style.backgroundColor = "#df514d"; e.target.style.color = "#fff"; }} onMouseOut={(e) => { e.target.style.backgroundColor = "#fff"; e.target.style.color = "#df514d"; }}>
            Logout
          </button>
        </div>

        {/* Right Side: Account Details Grid */}
        <div style={{ flex: 2, border: "1px solid #eee", padding: "30px", borderRadius: "8px", backgroundColor: "#fbfbfb" }}>
          <h4 style={{ color: "#666", marginBottom: "20px", fontSize: "1.1rem" }}>Profile Information</h4>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "30px" }}>
            <div>
              <span style={{ color: "#888", fontSize: "0.85rem", display: "block", marginBottom: "5px" }}>Email Address</span>
              <strong style={{ color: "#444" }}>{userData.email}</strong>
            </div>
            <div>
              <span style={{ color: "#888", fontSize: "0.85rem", display: "block", marginBottom: "5px" }}>Phone Number</span>
              <strong style={{ color: "#444" }}>+91 XXXXX XXXXX</strong>
            </div>
            <div>
              <span style={{ color: "#888", fontSize: "0.85rem", display: "block", marginBottom: "5px" }}>Joined Kite On</span>
              <strong style={{ color: "#444" }}>{joinDate}</strong>
            </div>
            <div>
              <span style={{ color: "#888", fontSize: "0.85rem", display: "block", marginBottom: "5px" }}>Available Margin</span>
              <strong style={{ color: "#4caf50" }}>₹{userData.walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
            </div>
          </div>
          
          <hr style={{ border: "none", borderBottom: "1px solid #eee", margin: "20px 0" }} />
          
          <p style={{ color: "#888", fontSize: "0.85rem" }}>
            Need help with your account? Visit the <a href="#" style={{ color: "#387ed1", textDecoration: "none" }}>Support Center</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Account;