# Kite - Zerodha Clone

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101" alt="Socket.io" />
  <img src="https://img.shields.io/badge/Razorpay-02042B?style=for-the-badge&logo=razorpay" alt="Razorpay" />
  <img src="https://img.shields.io/badge/Material--UI-0081CB?style=for-the-badge&logo=mui&logoColor=white" alt="Material-UI" />
  <img src="https://img.shields.io/badge/License-ISC-yellow.svg?style=for-the-badge" alt="License ISC" />
</p>

<p align="center">
  <strong>A full-stack trading application inspired by Zerodha's Kite platform.</strong><br/>
  Track real-time market data, manage your portfolio, place mock orders,<br/>
  and analyze interactive candlestick charts seamlessly.
</p>

<p align="center">
  <a href="https://swayampurwar.vercel.app/work/kite-casestudy.html">
    <img src="https://img.shields.io/badge/Live_Case_Study-Visit_Site-blue?style=for-the-button&logo=vercel" alt="Live Demo" />
  </a>
  <a href="https://github.com/swayampurwar/kite-zerodha">
    <img src="https://img.shields.io/badge/GitHub-Source_Code-black?style=for-the-button&logo=github" alt="GitHub" />
  </a>
</p>

---

## ✨ Features

| Feature | Description |
|---|---|
| 📈 Real-Time Market Data | Live stock prices streamed via WebSockets (`socket.io`) & Yahoo Finance API |
| 🕯️ Interactive Charts | Advanced candlestick and line charts using `lightweight-charts` & `Chart.js` |
| 🛒 Order Management | Buy/Sell action windows to place simulated market and limit orders |
| 💼 Portfolio & Holdings | Track your investments, current positions, and P&L in real-time |
| 💳 Seamless Payments | Add funds to your trading wallet via Razorpay integration |
| 📱 Mobile Verification | OTP-based authentication using Twilio |
| 🔐 Secure Authentication | JWT-based auth and Bcrypt password hashing |
| 🎨 Modern UI/UX | Responsive, sleek interface built with Material-UI (MUI) and CSS |

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Frontend Framework** | React 19 (Vite) |
| **Backend Framework** | Node.js & Express.js 5 |
| **Database** | MongoDB (Mongoose) |
| **Real-time Engine** | Socket.io |
| **Market Data API** | `yahoo-finance2` |
| **Payment Gateway** | Razorpay |
| **SMS Services** | Twilio |
| **Charting** | Lightweight Charts & React Chart.js 2 |
| **Styling** | Material-UI (MUI), Emotion, Vanilla CSS |
| **Validation** | Zod |

## 📁 Project Structure

```text
kite-zerodha/
├── backend/
│   ├── src/
│   │   ├── config/              # Database & environment configurations
│   │   ├── controllers/         # Logic for auth, market, orders, payments
│   │   ├── middleware/          # JWT auth protection
│   │   ├── models/              # Mongoose schemas (User, Orders, Holdings)
│   │   └── routes/              # Express API endpoints
│   ├── dummyData.js             # Script to seed initial DB data
│   └── index.js                 # Backend server entry point
├── frontend/
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── components/          # Reusable UI (TopBar, Charts, Action Windows)
│   │   ├── context/             # React Context for global state (UserContext)
│   │   ├── hooks/               # Custom hooks (e.g., useMarketData)
│   │   ├── pages/               # Main views (Dashboard, Holdings, Funds, Login)
│   │   └── services/            # Axios API calling layer
│   └── vite.config.js           # Vite bundler configuration
