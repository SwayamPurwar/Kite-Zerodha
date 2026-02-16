import React, { useContext, useRef, useState } from "react";
import { UserContext } from "../context/UserContext";
import { toast } from "react-toastify";
import axios from "axios";
import { API_URL } from "../config";
import TelegramSettings from "../components/TelegramSettings";

const Account = () => {
  const { user, setUser, logout } = useContext(UserContext);
  const fileInputRef = useRef(null); 
  
  // New States for Editing Profile
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || "",
    phone: user.phone || ""
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Safety Check: Limit to 60KB
    if (file.size > 60000) {
        toast.error("Image too large! Please choose a file under 60KB.");
        return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.put(`${API_URL}/user/avatar`, { avatar: reader.result }, { headers: { Authorization: `Bearer ${token}` } });
        
        // Update context and local storage immediately
        setUser(prev => ({ ...prev, avatar: res.data.user.avatar }));
        localStorage.setItem("avatar", res.data.user.avatar);
        
        toast.success("Profile photo updated");
      } catch (err) {
        toast.error("Upload failed");
      }
    };
  };

  // Function to save the updated name and phone to the database
  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`${API_URL}/user/profile`, formData, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      // Update the global user context smoothly without refreshing
      setUser(prev => ({ ...prev, name: res.data.user.name, phone: res.data.user.phone }));
      setIsEditing(false);
      toast.success(res.data.message);
    } catch (error) {
      toast.error("Failed to update profile details");
    }
  };

  const InfoRow = ({ label, value, isBlue }) => (
     <div style={{ display: "flex", marginBottom: "25px", fontSize: "13px" }}>
        <div style={{ width: "40%", color: "#888" }}>{label}</div>
        <div style={{ width: "60%", color: isBlue ? "#4184f3" : "#cecece", fontWeight: isBlue ? "500" : "400" }}>{value}</div>
     </div>
  );

  const formattedName = user.name ? user.name : (user.email ? user.email.split('@')[0] : "User");
  
  // Format the user's dynamic creation date
  const joinDate = user.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) 
    : "Recently";

  const handleLogout = () => {
    logout(); 
  };

  return (
    <div style={{ padding: "40px", maxWidth: "900px", margin: "0 auto" }}>
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #2b2b2b", paddingBottom: "15px", marginBottom: "40px" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: "400", color: "#cecece", margin: 0 }}>Profile</h2>
        <div style={{ display: "flex", gap: "20px", fontSize: "12px", color: "#4184f3" }}>
           <span style={{ cursor: "pointer" }}>Apps</span>
           <span style={{ cursor: "pointer" }}>Password & Security</span>
        </div>
      </div>

      {/* Top Profile Card */}
      <div style={{ display: "flex", alignItems: "center", gap: "30px", marginBottom: "50px" }}>
         <div style={{ textAlign: "center" }}>
            <div 
              onClick={() => fileInputRef.current.click()}
              style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "#e8eaf6", overflow: "hidden", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#d81b60", fontSize: "24px", fontWeight: "bold" }}>
               {user.avatar ? <img src={user.avatar} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="avatar"/> : formattedName.substring(0,2).toUpperCase()}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} style={{ display: "none" }} />
            <div style={{ color: "#4184f3", fontSize: "11px", marginTop: "10px", cursor: "pointer" }}>Change photo</div>
         </div>
         <div>
             <h1 style={{ fontSize: "1.8rem", fontWeight: "400", color: "#cecece", margin: 0 }}>
                {formattedName.charAt(0).toUpperCase() + formattedName.slice(1)}
             </h1>
             <div style={{ color: "#888", fontSize: "12px", marginTop: "5px" }}>Joined {joinDate}</div>
         </div>
      </div>

      {/* Grid Content - Split into Two Columns */}
      <div style={{ display: "flex", gap: "60px" }}>
         
         {/* Left Column (Account Info) */}
         <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px" }}>
               <h3 style={{ fontSize: "1.1rem", fontWeight: "400", color: "#cecece", margin: 0 }}>Account</h3>
               
               {/* Manage / Cancel Toggle Button */}
               <span 
                 onClick={() => {
                   setIsEditing(!isEditing);
                   setFormData({ name: user.name || "", phone: user.phone || "" }); // Reset form on cancel
                 }} 
                 style={{ fontSize: "12px", color: "#4184f3", cursor: "pointer" }}
               >
                  <i className="fa-solid fa-gear" style={{marginRight: "5px"}}></i> 
                  {isEditing ? "Cancel" : "Manage"}
               </span>
            </div>

            {/* If Editing, Show Inputs. Otherwise, Show InfoRows */}
            {isEditing ? (
                <div style={{ marginBottom: "30px", padding: "20px", backgroundColor: "#191919", borderRadius: "4px", border: "1px solid #2b2b2b" }}>
                    <div style={{ marginBottom: "15px" }}>
                        <label style={{ display: "block", fontSize: "11px", color: "#888", marginBottom: "5px", textTransform: "uppercase" }}>Full Name</label>
                        <input 
                            type="text" 
                            value={formData.name} 
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            style={{ width: "100%", padding: "10px", background: "#121212", color: "#cecece", border: "1px solid #2b2b2b", borderRadius: "3px", outline: "none", boxSizing: "border-box" }} 
                        />
                    </div>
                    <div style={{ marginBottom: "20px" }}>
                        <label style={{ display: "block", fontSize: "11px", color: "#888", marginBottom: "5px", textTransform: "uppercase" }}>Phone Number</label>
                        <input 
                            type="text" 
                            value={formData.phone} 
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            style={{ width: "100%", padding: "10px", background: "#121212", color: "#cecece", border: "1px solid #2b2b2b", borderRadius: "3px", outline: "none", boxSizing: "border-box" }} 
                        />
                    </div>
                    <button onClick={handleSaveProfile} style={{ background: "#4184f3", color: "white", padding: "10px 15px", border: "none", borderRadius: "3px", cursor: "pointer", fontSize: "13px", width: "100%", fontWeight: "500" }}>
                        Save Changes
                    </button>
                </div>
            ) : (
                <>
                    <InfoRow label="Name" value={user.name} />
                    <InfoRow label="Phone" value={user.phone || "Not Set"} />
                </>
            )}

            <InfoRow label="E-mail" value={user.email} />
          
            <button 
                onClick={handleLogout} 
                style={{ marginTop: "30px", backgroundColor: "transparent", color: "#df514d", border: "1px solid #df514d", padding: "10px 20px", borderRadius: "3px", cursor: "pointer", fontSize: "13px", width: "100%", fontWeight: "500", transition: "background 0.2s" }}
                onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(223, 81, 77, 0.1)"}
                onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
            >
                Logout
            </button>
         </div>

         {/* Right Column (Settings & Telegram) */}
         <div style={{ flex: 1 }}>
             <h3 style={{ fontSize: "1.1rem", fontWeight: "400", color: "#cecece", margin: "0 0 30px 0" }}>Integrations</h3>
             
             {/* The Telegram Component injected here! */}
             <TelegramSettings />
         </div>

      </div>
    </div>
  );
};

export default Account;