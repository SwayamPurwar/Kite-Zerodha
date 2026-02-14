import React, { useState, useEffect } from "react";
import axios from "axios";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { API_URL } from "../config";
// Register Chart.js elements
ChartJS.register(ArcElement, Tooltip, Legend);

const Positions = () => {
  const [allHoldings, setAllHoldings] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Fetch user's holdings securely
    axios.get(`${API_URL}/allHoldings`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        setAllHoldings(res.data);
      })
      .catch((err) => {
        console.error("Error fetching holdings:", err);
      });
  }, []);

  // Map the fetched data to the Chart.js format
  const data = {
    labels: allHoldings.map((stock) => stock.name),
    datasets: [
      {
        label: " Investment Value (₹)",
        data: allHoldings.map((stock) => (stock.qty * stock.avg).toFixed(2)),
        backgroundColor: [
          "rgba(255, 99, 132, 0.7)",
          "rgba(54, 162, 235, 0.7)",
          "rgba(255, 206, 86, 0.7)",
          "rgba(75, 192, 192, 0.7)",
          "rgba(153, 102, 255, 0.7)",
          "rgba(255, 159, 64, 0.7)",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div style={{ padding: "20px" }}>
      <h3 style={{ fontSize: "1.2rem", fontWeight: "500", color: "#444", marginBottom: "20px" }}>
        Portfolio Distribution
      </h3>
      
      {allHoldings.length === 0 ? (
        <div style={{ textAlign: "center", color: "#888", marginTop: "50px" }}>
          <p>You have no open positions.</p>
        </div>
      ) : (
        <div style={{ width: "350px", height: "350px", margin: "0 auto" }}>
          <Doughnut data={data} />
        </div>
      )}
    </div>
  );
};

export default Positions;