import React from "react";

const Logo = ({ style }) => {
  // Hardcoded for dark background visibility
  const mainTextColor = "#ffffff"; 
  const secondaryTextColor = "#cbd5e1"; // Light silver

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", userSelect: "none", ...style }}>
      
      {/* Premium 'S' / Growth Icon - Optimized for Dark Mode */}
      <svg 
        width="34" 
        height="34" 
        viewBox="0 0 32 32" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Vibrant Gold Gradient */}
          <linearGradient id="goldGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f59e0b" /> {/* Bright Amber */}
            <stop offset="100%" stopColor="#fde047" /> {/* Luminous Yellow */}
          </linearGradient>
          {/* Bright Cyan/Ice Blue Gradient */}
          <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0ea5e9" /> {/* Sky Blue */}
            <stop offset="100%" stopColor="#2dd4bf" /> {/* Bright Teal/Cyan */}
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Top Right Arrow (Now Bright Cyan/Teal) */}
        <path 
          d="M16 6 L26 6 L26 16 L20 10 L12 18 L6 12 L16 6Z" 
          fill="url(#cyanGrad)" 
          filter="url(#glow)"
        />
        {/* Bottom Left Arrow (Now Luminous Gold) */}
        <path 
          d="M16 26 L6 26 L6 16 L12 22 L20 14 L26 20 L16 26Z" 
          fill="url(#goldGrad)" 
          filter="url(#glow)"
        />
      </svg>
      
      {/* High-End Typography */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <span style={{ 
          fontSize: "1.35rem", 
          fontWeight: "800", 
          letterSpacing: "0.5px", 
          color: mainTextColor,
          fontFamily: "'Inter', 'Helvetica Neue', Helvetica, sans-serif",
          lineHeight: "1.1"
        }}>
          Swayam
        </span>
        <span style={{ 
          fontSize: "0.65rem", 
          fontWeight: "600", 
          letterSpacing: "3px", 
          color: secondaryTextColor,
          textTransform: "uppercase",
          marginTop: "2px"
        }}>
          Capital
        </span>
      </div>
      
    </div>
  );
};

export default Logo;