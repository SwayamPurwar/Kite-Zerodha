import React, { useContext, useRef } from "react";
import { UserContext } from "../context/UserContext";
import { toast } from "react-toastify";
import axios from "axios";
import { API_URL } from "../config";

const Account = () => {
  const { user, setUser } = useContext(UserContext);
  const fileInputRef = useRef(null); 

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.put(`${API_URL}/user/avatar`, { avatar: reader.result }, { headers: { Authorization: `Bearer ${token}` } });
        setUser(res.data.user);
        localStorage.setItem("avatar", res.data.user.avatar);
        toast.success("Profile photo updated");
      } catch (err) {
        toast.error("Upload failed");
      }
    };
  };

  const InfoRow = ({ label, value, isBlue }) => (
     <div style={{ display: "flex", marginBottom: "25px", fontSize: "13px" }}>
        <div style={{ width: "40%", color: "#888" }}>{label}</div>
        <div style={{ width: "60%", color: isBlue ? "#4184f3" : "#cecece", fontWeight: isBlue ? "500" : "400" }}>{value}</div>
     </div>
  );

  const formattedName = user.name ? user.name : (user.email ? user.email.split('@')[0] : "User");

  return (
    <div style={{ padding: "40px", maxWidth: "900px", margin: "0 auto" }}>
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #2b2b2b", paddingBottom: "15px", marginBottom: "40px" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: "400", color: "#cecece", margin: 0 }}>Profile</h2>
        <div style={{ display: "flex", gap: "20px", fontSize: "12px", color: "#4184f3" }}>
           <span>Apps</span>
           <span>Password & Security</span>
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
         <h1 style={{ fontSize: "1.8rem", fontWeight: "400", color: "#cecece", margin: 0 }}>
            {formattedName.charAt(0).toUpperCase() + formattedName.slice(1)}
         </h1>
      </div>

      {/* Grid Content */}
      <div style={{ display: "flex", gap: "60px" }}>
         
         {/* Left Column */}
         <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px" }}>
               <h3 style={{ fontSize: "1.1rem", fontWeight: "400", color: "#888" }}>Account</h3>
               <span style={{ fontSize: "12px", color: "#4184f3" }}><i className="fa-solid fa-gear"></i> Manage</span>
            </div>

            <InfoRow label="Support code" value={<span><i className="fa-solid fa-eye"></i> View</span>} isBlue={true} />
            <InfoRow label="E-mail" value={user.email} />
            <InfoRow label="PAN" value="*086J" />
            <InfoRow label="Phone" value="*0688" />
            <InfoRow label="Demat (BO)" value="1208160146440501" isBlue={true} />
            <InfoRow label="Segments" value="MCX, NCO, NSE, CDS, BCD, BSE, MF, BFO, NFO" isBlue={true} />
            <InfoRow label="Demat authorisation" value="eDIS" isBlue={true} />

            <div style={{ marginTop: "50px" }}>
               <h3 style={{ fontSize: "1.1rem", fontWeight: "400", color: "#888", marginBottom: "30px" }}>Settings</h3>
               <InfoRow label="Chart" value="ChartIQ / TradingView" />
               <InfoRow label="Theme" value="Default / Dark" />
            </div>
         </div>

         {/* Right Column */}
         <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px" }}>
               <h3 style={{ fontSize: "1.1rem", fontWeight: "400", color: "#888" }}>Bank accounts</h3>
               <span style={{ fontSize: "12px", color: "#4184f3" }}><i className="fa-solid fa-gear"></i> Manage</span>
            </div>
            
            <div style={{ marginBottom: "15px", fontSize: "13px", color: "#cecece" }}>*5669 <span style={{color: "#888", fontSize: "11px", marginLeft: "10px"}}>HDFC BANK LTD</span></div>
            <div style={{ marginBottom: "15px", fontSize: "13px", color: "#cecece" }}>*6503 <span style={{color: "#888", fontSize: "11px", marginLeft: "10px"}}>STATE BANK OF INDIA</span></div>
            <div style={{ marginBottom: "15px", fontSize: "13px", color: "#cecece" }}>*7207 <span style={{color: "#888", fontSize: "11px", marginLeft: "10px"}}>AXIS BANK</span></div>

            <div style={{ marginTop: "70px" }}>
               <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px" }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: "400", color: "#888" }}>Sessions</h3>
                  <span style={{ fontSize: "12px", color: "#4184f3" }}>Clear all</span>
               </div>
               <ul style={{ paddingLeft: "20px", color: "#cecece", fontSize: "13px", lineHeight: "2" }}>
                  <li>Kite widget</li>
                  <li>Kite Web</li>
               </ul>
               
               <button onClick={() => window.location.href = '/login'} style={{ marginTop: "30px", backgroundColor: "transparent", color: "#df514d", border: "1px solid #df514d", padding: "8px 20px", borderRadius: "3px", cursor: "pointer", fontSize: "12px", width: "100%" }}>
                  Logout
               </button>
            </div>
         </div>

      </div>
    </div>
  );
};

export default Account;