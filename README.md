# Kite-Zerodha Clone — Full-Stack Trading Platform

<p align="center">
  <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-purple?style=for-the-badge&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Node.js-green?style=for-the-badge&logo=node.js" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-black?style=for-the-badge&logo=express" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-darkgreen?style=for-the-badge&logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io" alt="Socket.io" />
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge" alt="License MIT" />
</p>

<p align="center">
  <strong>A comprehensive, real-time trading platform inspired by Zerodha's Kite.</strong><br/>
  Track markets, execute mock trades, manage your portfolio,<br/>
  and analyze real-time candlestick charts.
</p>

<p align="center">
  <a href="https://github.com/jatin12-alt/Kite-Zerodha">
    <img src="https://img.shields.io/badge/GitHub-Source_Code-black?style=for-the-button&logo=github" alt="GitHub" />
  </a>
</p>

---

## ✨ Features

| Feature | Description |
|---|---|
| 📈 Real-Time Market Data | Live stock prices streaming via WebSockets and Yahoo Finance API |
| 🕯️ Interactive Charting | Advanced candlestick charts powered by Lightweight Charts and Chart.js |
| 💼 Portfolio Management | Track holdings, active positions, and order history in real-time |
| 💳 Integrated Payments | Fund management and wallet top-ups powered by Razorpay |
| 📱 Instant Notifications | Important account and trade alerts via Twilio (SMS) and Nodemailer |
| 🔐 Secure Authentication | Robust user authentication using JWT, bcrypt, and helmet for security |
| 🛡️ Input Validation | Strict schema validation across all endpoints using Zod |
| 🎨 Modern UI | Responsive, high-performance interface built with Material UI (MUI) |

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Frontend Framework** | React 19 + Vite |
| **Backend Framework** | Node.js + Express.js 5 |
| **Database** | MongoDB (Mongoose) |
| **Real-Time Engine** | Socket.io |
| **Market Data** | yahoo-finance2 |
| **Charting** | Lightweight Charts / React-Chartjs-2 |
| **Styling** | Material UI / Custom CSS |
| **Payments** | Razorpay |
| **Communications** | Twilio / Nodemailer |

## 📁 Project Structure

```text
kite-zerodha/
├── backend/
│   ├── src/
│   │   ├── config/          # Database and server configurations
│   │   ├── controllers/     # Route logic (auth, holdings, market, orders, payment)
│   │   ├── middleware/      # JWT verification and rate limiting
│   │   ├── models/          # Mongoose schemas (User, Holdings, Orders, Transactions)
│   │   └── routes/          # Express API route definitions
│   ├── index.js             # Express application entry point
│   ├── dummyData.js         # Database seeding scripts
│   └── package.json         # Backend dependencies
├── frontend/
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # Reusable UI (CandleStickChart, TopBar, WatchList)
│   │   ├── context/         # React Context for global state (UserContext)
│   │   ├── hooks/           # Custom React hooks (useMarketData)
│   │   ├── pages/           # Main views (Dashboard, Holdings, Orders, Funds)
│   │   ├── services/        # API integration (Axios client)
│   │   ├── App.jsx          # Root component layout
│   │   └── main.jsx         # React DOM rendering
│   ├── vite.config.js       # Vite build configuration
│   └── package.json         # Frontend dependencies
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB instance (Local or Atlas)

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/SwayamPurwar/Kite-Zerodha.git](https://github.com/SwayamPurwar/Kite-Zerodha.git)
cd Kite-Zerodha


2. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```
3. **Install Frontend Dependencies:**
```bash
cd ../frontend
npm install
```
4. **Setup Environment Variables:**
Create .env files in both the backend and frontend directories based on the tables below
 
5. **Run the Development Servers:** 

### Terminal 1 (Backend):

```bash
cd backend
npm run dev
```

### Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

## 🔑 Environment Variables

### Backend (backend/.env)

| Variable | Description | Required |
|---|---|---|

| PORT | API Port (e.g., 3000) | ✅ |
| MONGO_URI | MongoDB connection string | ✅ |
| JWT_SECRET | Secret key for signing tokens | ✅ |
| RAZORPAY_KEY_ID | Razorpay public key | ✅ |
| RAZORPAY_KEY_SECRET | Razorpay secret key | ✅ |
| EMAIL_USER | SMTP email address | Optional |
| EMAIL_PASS |SMTP email password | Optional |

### Frontend (frontend/.env)

| Variable | Description |Required |
| VITE_API_URL | Backend API Base URL | ✅ |
| VITE_WS_URL | WebSocket Server URL | ✅ |


## 🔌 Core API Routes

| Route | Method | Description |
|---|---|---|
| /api/auth/signup | POST | Register a new user |
| /api/auth/login | POST | Authenticate and receive JWT |
| /api/market/quotes | GET | Fetch real-time market data |
| /api/orders/place | POST | Place a buy/sell market order |
| /api/holdings | GET | Retrieve user portfolio holdings |
| /api/payment/create | POST | Initialize Razorpay transaction |


## 🤝 Contributing

We welcome contributions! To contribute:

1. **Fork** the repository.
2. **Create** a new branch: `git checkout -b feature/your-feature-name`.
3. **Commit** your changes: `git commit -m 'Add some feature'`.
4. **Push** to the branch: `git push origin feature/your-feature-name`.
5. **Open** a Pull Request.

Please ensure your code follows the existing style and includes proper TypeScript types.

## 👨‍💻 Author

**Swayam Purwar**
- **LinkedIn**: [Swayam Purwar](https://www.linkedin.com/in/SwayamPurwar)
- **GitHub**: [@SwayamPurwar](https://github.com/SwayamPurwar/)
- **Email**: [swayampurwar111104@gmail.com](mailto:swayampurwar111104@gmail.com)

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ by Swayam Purwar
  <br/>
  <a href="https://swayamzerodha.vercel.app/">swayamzerodha.vercel.app</a>
</p>