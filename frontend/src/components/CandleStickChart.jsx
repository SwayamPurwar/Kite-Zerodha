import React, { useEffect, useRef, useState } from "react";
import { createChart, ColorType } from "lightweight-charts";
import axios from "axios";
import { API_URL } from "../config";

const CandleStickChart = ({ uid, closeChart }) => {
  const topChartContainerRef = useRef();
  const bottomChartContainerRef = useRef();
  const [error, setError] = useState(null);

  useEffect(() => {
    let topChart;
    let bottomChart;
    
    // 1. Add a flag to track if the component is actually mounted
    let isMounted = true; 

    const fetchHistory = async () => {
      try {
        const res = await axios.get(`${API_URL}/market/history/${uid}`);
        
        // 2. If React unmounted this component while we were waiting for the API, stop here!
        if (!isMounted) return;

        if (!res.data || res.data.length === 0) {
          setError("No historical data available.");
          return;
        }

        const candleData = res.data
          .map((d) => ({
            time: d.time,
            open: d.open,
            high: d.high,
            low: d.low,
            close: d.close,
          }))
          .sort((a, b) => new Date(a.time) - new Date(b.time));

        const lineData = res.data
          .map((d) => ({
            time: d.time,
            value: d.close, 
          }))
          .sort((a, b) => new Date(a.time) - new Date(b.time));

        const commonOptions = {
          layout: {
            background: { type: ColorType.Solid, color: "#191919" },
            textColor: "#cecece",
          },
          grid: {
            vertLines: { color: "#2b2b2b" },
            horzLines: { color: "#2b2b2b" },
          },
          rightPriceScale: { borderColor: "#2b2b2b" },
          crosshair: {
            vertLine: { color: "#757575", labelBackgroundColor: "#191919" },
            horzLine: { color: "#757575", labelBackgroundColor: "#191919" },
          },
        };

        // 3. Force-clear the containers to destroy any ghost charts created by React Strict Mode
        if (topChartContainerRef.current) topChartContainerRef.current.innerHTML = "";
        if (bottomChartContainerRef.current) bottomChartContainerRef.current.innerHTML = "";

        topChart = createChart(topChartContainerRef.current, {
          ...commonOptions,
          width: topChartContainerRef.current.clientWidth,
          height: 300,
          timeScale: {
            borderColor: "#2b2b2b",
            visible: false, 
          },
        });

        const candlestickSeries = topChart.addCandlestickSeries({
          upColor: "#4caf50",
          downColor: "#df514d",
          borderVisible: false,
          wickUpColor: "#4caf50",
          wickDownColor: "#df514d",
        });
        candlestickSeries.setData(candleData);

        bottomChart = createChart(bottomChartContainerRef.current, {
          ...commonOptions,
          width: bottomChartContainerRef.current.clientWidth,
          height: 180,
          timeScale: {
            borderColor: "#2b2b2b",
            visible: true, 
          },
        });

        const lineSeries = bottomChart.addLineSeries({
          color: "#4184f3", 
          lineWidth: 2,
        });
        lineSeries.setData(lineData);

        topChart.timeScale().subscribeVisibleTimeRangeChange((range) => {
            if (range && bottomChart) bottomChart.timeScale().setVisibleRange(range);
        });
        bottomChart.timeScale().subscribeVisibleTimeRangeChange((range) => {
            if (range && topChart) topChart.timeScale().setVisibleRange(range);
        });

        topChart.timeScale().fitContent();
        bottomChart.timeScale().fitContent();

        const handleResize = () => {
          if (topChartContainerRef.current && bottomChartContainerRef.current && topChart && bottomChart) {
            topChart.applyOptions({ width: topChartContainerRef.current.clientWidth });
            bottomChart.applyOptions({ width: bottomChartContainerRef.current.clientWidth });
          }
        };
        window.addEventListener("resize", handleResize);

      } catch (err) {
        console.error("Chart Error:", err);
        if (isMounted) setError("Failed to load chart data");
      }
    };

    fetchHistory();

    return () => {
      // 4. Mark component as unmounted so pending API calls don't draw charts
      isMounted = false; 
      window.removeEventListener("resize", () => {});
      if (topChart) topChart.remove();
      if (bottomChart) bottomChart.remove();
    };
  }, [uid]);

  return (
    <div className="container" style={{ 
        position: "fixed", 
        top: "8%", 
        left: "50%", 
        transform: "translateX(-50%)", 
        width: "850px", 
        background: "#191919", 
        border: "1px solid #2b2b2b", 
        zIndex: 9999, 
        boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
        borderRadius: "4px" 
    }}>
      <div style={{ 
          padding: "15px 20px", 
          borderBottom: "1px solid #2b2b2b", 
          display: "flex", 
          justifyContent: "space-between",
          alignItems: "center"
      }}>
         <h3 style={{ color: "#cecece", margin: 0, fontWeight: "400", fontSize: "16px" }}>
            {uid} - Technical Chart
         </h3>
         <button onClick={closeChart} style={{ 
             border: "none", 
             background: "transparent", 
             fontSize: "20px", 
             cursor: "pointer",
             color: "#888" 
         }}>✖</button>
      </div>
      
      <div style={{ display: "flex", flexDirection: "column" }}>
          {error && (
            <div style={{ padding: "20px", color: "#df514d", textAlign: "center" }}>
                <p style={{ margin: 0 }}>{error}</p>
                <small style={{ color: "#666" }}>Ensure the backend correctly handles stock suffixes (.NS).</small>
            </div>
          )}
          
          <div ref={topChartContainerRef} style={{ width: "100%", height: "300px", position: "relative" }} />
          <div ref={bottomChartContainerRef} style={{ width: "100%", height: "180px", position: "relative", borderTop: "1px dashed #2b2b2b" }} />
      </div>

      <div style={{ padding: "10px 20px", fontSize: "11px", color: "#666", borderTop: "1px solid #2b2b2b" }}>
         Data source: Yahoo Finance API (Delayed)
      </div>
    </div>
  );
};

export default CandleStickChart;