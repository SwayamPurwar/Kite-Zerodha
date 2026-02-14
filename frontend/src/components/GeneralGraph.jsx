import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import { API_URL } from "../config"; // IMPORT THE PRODUCTION URL
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler // This allows us to shade the area under the line!
} from "chart.js";
import "./BuyActionWindow.css";

// Register Chart.js elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const GeneralGraph = ({ uid, closeChart }) => {
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch the 100-day historical data from our backend
    axios.get(`${API_URL}/market/history/${uid}`)
      .then((res) => {
        const data = res.data;
        if (!data || data.length === 0) {
          setError("No historical data found.");
          setIsLoading(false);
          return;
        }

        // Extract dates and closing prices
        const labels = data.map(d => d.time);
        const prices = data.map(d => d.close);

        // Determine if the stock went up or down over 100 days
        const isUp = prices[prices.length - 1] >= prices[0];
        const lineColor = isUp ? "#4caf50" : "#df514d";
        const bgColor = isUp ? "rgba(76, 175, 80, 0.1)" : "rgba(223, 81, 77, 0.1)";

        setChartData({
          labels: labels,
          datasets: [
            {
              label: `${uid} Price`,
              data: prices,
              borderColor: lineColor,
              backgroundColor: bgColor,
              borderWidth: 2,
              pointRadius: 0, // Hides the dots for a clean line look
              pointHoverRadius: 5,
              fill: true,
              tension: 0.1, // Smooths the line slightly
            },
          ],
        });
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to fetch graph data from backend.");
        setIsLoading(false);
      });
  }, [uid]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { maxTicksLimit: 6 }, // Keep the X-axis clean
      },
      y: {
        grid: { color: "#f0f3fa" },
      },
    },
  };

  return (
    <div className="container" id="buy-window" style={{ width: "700px", left: "50%", transform: "translateX(-50%)" }} draggable="true">
      <div style={{ display: "flex", justifyContent: "space-between", padding: "15px 20px", backgroundColor: "#fbfbfb", borderBottom: "1px solid #eee" }}>
        <h3 style={{ margin: 0, color: "#444", fontSize: "16px" }}>{uid} - Analytics</h3>
        <button onClick={closeChart} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "#888" }}>✖</button>
      </div>
      
      <div style={{ padding: "20px", height: "400px", position: "relative" }}>
        {isLoading && (
          <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "white", zIndex: 10 }}>
            Loading chart data...
          </div>
        )}
        
        {error && (
          <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "white", zIndex: 10, color: "#df514d", fontWeight: "500" }}>
            {error}
          </div>
        )}
        
        {/* Render the Chart.js Line Chart */}
        {chartData && <Line data={chartData} options={chartOptions} />}
      </div>
    </div>
  );
};

export default GeneralGraph;