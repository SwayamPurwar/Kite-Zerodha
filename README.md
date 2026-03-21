# Kite - Zerodha Clone

<p align="center">
  <img src="https://img.shields.io/badge/React-19-black?style=for-the-badge&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=nodedotjs" alt="Node.js" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-green?style=for-the-badge&logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socketdotio" alt="Socket.io" />
  <img src="https://img.shields.io/badge/Razorpay-Payment-blue?style=for-the-badge&logo=razorpay" alt="Razorpay" />
  <img src="https://img.shields.io/badge/Material--UI-blue?style=for-the-badge&logo=mui" alt="MUI" />
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
| **Framework** | React 19 (Vite) |
| **Backend** | Node.js & Express.js 5.2 |
| **Database** | MongoDB (Mongoose 9.2) |
| **Real-time Engine** | Socket.io 4.8 |
| **Market Data API** | Yahoo Finance API (`yahoo-finance2`) |
| **Payment Gateway** | Razorpay |
| **SMS Services** | Twilio |
| **Charting** | Lightweight Charts 4.2 & Chart.js 4.5 |
| **Styling** | Material-UI (MUI) & Vanilla CSS |
| **Validation** | Zod 4.3 |

## 📁 Project Structure

```text
kite-zerodha/
├── backend/
│   ├── src/
│   │   ├── config/              # Database & environment configurations
│   │   ├── controllers/         # Logic for auth, market, orders, payments, holdings
│   │   ├── middleware/          # JWT auth protection
│   │   ├── models/              # Mongoose schemas (User, Orders, Holdings, Transactions)
│   │   └── routes/              # Express API endpoints
│   ├── dummyData.js             # Script to seed initial DB data
│   ├── clearDB.js               # Script to wipe DB data
│   └── index.js                 # Backend server entry point
├── frontend/
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── components/          # Reusable UI (TopBar, Charts, Action Windows)
│   │   ├── context/             # React Context for global state (UserContext)
│   │   ├── hooks/               # Custom hooks (e.g., useMarketData)
│   │   ├── pages/               # Main views (Dashboard, Holdings, Funds, Account, Login)
│   │   ├── services/            # Axios API calling layer
│   │   ├── config.js            # Frontend configuration
│   │   └── App.jsx              # Main App Component
│   └── vite.config.js           # Vite bundler configuration
```

## 🚀 Getting Started
Prerequisites

Node.js 18+ and npm

MongoDB URI (Local or Atlas)

API Keys for: Razorpay, Twilio, and Yahoo Finance (optional depending on rate limits)

Installation

Clone the repository:

Bash
git clone [https://github.com/swayampurwar/kite-zerodha.git](https://github.com/swayampurwar/kite-zerodha.git)
cd kite-zerodha
Setup the Backend:

Bash
cd backend
npm install
Create a .env file in the backend directory (see Environment Variables below).

Bash
# Optional: Seed the database with dummy data
node dummyData.js

# Start the backend server in development mode
npm run dev
Setup the Frontend:
Open a new terminal window:

Bash
cd frontend
npm install
Create a .env file in the frontend directory if needed for API URL routing.

Bash
# Start the Vite development server
npm run dev

## 🔑 Environment Variables
Backend (backend/.env)
| Variable | Description | Required |
|---|---|---|
| PORT | Backend server port (e.g., 3002) | ✅ |
| MONGO_URI | MongoDB connection string | ✅ |
| JWT_SECRET | Secret key for signing tokens | ✅ |
| RAZORPAY_KEY_ID | Razorpay Public Key | ✅ |
| RAZORPAY_KEY_SECRET | Razorpay Secret Key | ✅ |
| TWILIO_ACCOUNT_SID | Twilio Account SID | ✅ |
| TWILIO_AUTH_TOKEN | Twilio Auth Token | ✅ |
| TWILIO_PHONE_NUMBER | Twilio Phone Number | ✅ |

Frontend (frontend/.env)
| Variable | Description | Required |
|---|---|---|
| VITE_API_URL | Backend API Base URL | ✅ |

🔌 API Routes
Route	Method	Description
/api/auth/signup	POST	Register a new user account
/api/auth/login	POST	Authenticate user and return JWT
/api/market/ticker	GET	Fetch initial market data for watchlist
/api/holdings	GET	Retrieve user's current stock holdings
/api/orders/place	POST	Place a new buy/sell order
/api/orders	GET	Fetch order history
/api/payment/create-order	POST	Initialize Razorpay transaction
/api/payment/verify	POST	Verify signature and update wallet funds
🧠 How The Trading Engine Works
Market Data Streaming: The backend connects to financial APIs to poll real-time pricing via yahoo-finance2.

WebSocket Broadcasting: Changes in stock prices are emitted globally to connected frontend clients using socket.io.

Frontend Rendering: The useMarketData hook listens to these WebSocket events, updating the Watchlist and Candlestick Charts in real-time without refreshing the page.

Order Execution: When a user buys a stock via the BuyActionWindow, an API call is made. The backend verifies sufficient funds, deducts the total, updates the OrdersModel, and appends the asset to the HoldingsModel.

Fund Management: Users top up their mock wallet using the Razorpay gateway. Upon successful payment verification on the backend, the user's balance is updated in the database.

🤝 Contributing
We welcome contributions! To contribute:

Fork the repository.

Create a new branch: git checkout -b feature/your-feature-name.

Commit your changes: git commit -m 'Add some feature'.

Push to the branch: git push origin feature/your-feature-name.

Open a Pull Request.

👨‍💻 Author
Swayam Purwar

Live Case Study: Kite Case Study

GitHub: @swayampurwar

📄 License
This project is licensed under the ISC License - see the LICENSE file for details.

<p align="center">
Built with ❤️ by Swayam Purwar


<a href="https://swayampurwar.vercel.app/work/kite-casestudy.html">Read the Case Study</a>
</p>