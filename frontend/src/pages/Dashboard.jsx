import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../context/UserContext"; 

const Dashboard = () => {
  const { user } = useContext(UserContext);
  const formattedName = user.name ? user.name : (user.email ? user.email.split('@')[0] : "User");

  return (
    <div style={{ padding: "40px", maxWidth: "1000px", margin: "0 auto" }}>
      <h2 style={{ color: "#e0e0e0", fontWeight: "400", fontSize: "1.5rem", marginBottom: "40px" }}>
        Hi, {formattedName.charAt(0).toUpperCase() + formattedName.slice(1)}
      </h2>

      {/* Margins Section */}
      <div style={{ display: "flex", gap: "60px", marginBottom: "60px" }}>
        {/* Equity */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
             <i className="fa-solid fa-chart-pie" style={{ color: "#888" }}></i>
             <h3 style={{ fontSize: "1rem", color: "#cecece", fontWeight: "400" }}>Equity</h3>
          </div>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <h1 style={{ fontSize: "2.5rem", fontWeight: "400", color: "#cecece", margin: 0 }}>
                {Number(user.walletBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h1>
              <p className="text-muted" style={{ marginTop: "5px" }}>Margin available</p>
            </div>
            <div style={{ textAlign: "right", color: "#888", fontSize: "13px", lineHeight: "1.8" }}>
              <p>Margins used <span style={{ color: "#cecece", marginLeft: "15px" }}>0.00</span></p>
              <p>Opening balance <span style={{ color: "#cecece", marginLeft: "15px" }}>{Number(user.walletBalance).toLocaleString('en-IN')}</span></p>
              <Link to="/funds" style={{ color: "#4184f3", display: "block", marginTop: "10px" }}><i className="fa-solid fa-circle-info"></i> View statement</Link>
            </div>
          </div>
        </div>

        {/* Commodity */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
             <i className="fa-solid fa-droplet" style={{ color: "#888" }}></i>
             <h3 style={{ fontSize: "1rem", color: "#cecece", fontWeight: "400" }}>Commodity</h3>
          </div>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <h1 style={{ fontSize: "2.5rem", fontWeight: "400", color: "#cecece", margin: 0 }}>0.00</h1>
              <p className="text-muted" style={{ marginTop: "5px" }}>Margin available</p>
            </div>
            <div style={{ textAlign: "right", color: "#888", fontSize: "13px", lineHeight: "1.8" }}>
              <p>Margins used <span style={{ color: "#cecece", marginLeft: "15px" }}>0.00</span></p>
              <p>Opening balance <span style={{ color: "#cecece", marginLeft: "15px" }}>0.00</span></p>
              <Link to="/funds" style={{ color: "#4184f3", display: "block", marginTop: "10px" }}><i className="fa-solid fa-circle-info"></i> View statement</Link>
            </div>
          </div>
        </div>
      </div>

      <hr style={{ border: "none", borderBottom: "1px solid #2b2b2b", marginBottom: "40px" }} />

      {/* Holdings Preview Section */}
      <div>
         <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "30px" }}>
             <i className="fa-solid fa-briefcase" style={{ color: "#888" }}></i>
             <h3 style={{ fontSize: "1rem", color: "#cecece", fontWeight: "400" }}>Holdings <span style={{color: "#888"}}>(0)</span></h3>
          </div>

          <div style={{ display: "flex", gap: "60px", marginBottom: "30px" }}>
            <div style={{ flex: 1 }}>
              <p style={{ color: "#4caf50", fontSize: "1.8rem", marginBottom: "5px" }}>0.00 <span style={{fontSize:"14px"}}>0.00%</span></p>
              <p className="text-muted">P&L</p>
            </div>
            <div style={{ flex: 1, textAlign: "right", color: "#888", fontSize: "13px", lineHeight: "1.8" }}>
              <p>Current value <span style={{ color: "#cecece", marginLeft: "15px" }}>0.00</span></p>
              <p>Investment <span style={{ color: "#cecece", marginLeft: "15px" }}>0.00</span></p>
            </div>
          </div>

          {/* Blue Progress Bar */}
          <div style={{ height: "40px", backgroundColor: "#3a61e8", display: "flex", width: "100%", marginBottom: "10px" }}>
             <div style={{ width: "60%", backgroundColor: "#5b7df0", height: "100%" }}></div>
          </div>
          
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#888" }}>
             <span>0.00</span>
             <div style={{ display: "flex", gap: "15px" }}>
                <span><span style={{color:"#4184f3"}}>●</span> Current value</span>
                <span>○ Investment value</span>
                <span>○ P&L</span>
             </div>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;