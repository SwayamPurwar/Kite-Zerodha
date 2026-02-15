// Kite-Zerodha/backend/index.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./src/config/db");
const http = require("http");
const { Server } = require("socket.io");
const helmet = require("helmet"); // [NEW] Security Headers
const rateLimit = require("express-rate-limit"); // [NEW] Rate Limiting

dotenv.config();

// Ensure critical variables exist
if (!process.env.JWT_SECRET || !process.env.MONGO_URL) {
  console.error("FATAL ERROR: JWT_SECRET or MONGO_URL is not defined.");
  process.exit(1); 
}

connectDB();

const app = express();
const PORT = process.env.PORT || 3002;

// [NEW] 1. Security Headers
app.use(helmet());

// [NEW] 2. Rate Limiting (Prevent Brute Force)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/auth", limiter); // Apply stricter limits to auth routes

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    // Replace with your actual frontend URL
    origin: ["http://localhost:5173", "https://swayamzerodha.vercel.app", "https://kite-zerodha-seven.vercel.app"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors({
  origin: ["http://localhost:5173", "https://swayamzerodha.vercel.app", "https://kite-zerodha-seven.vercel.app"],
  credentials: true
}));

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// [NEW] 3. Root Route to fix "Cannot GET /"
app.get("/", (req, res) => {
    res.send("<h1>Kite Zerodha Backend is Running!</h1>");
});

// Routes
app.use("/", require("./src/routes/holdingsRoute")); 
app.use("/", require("./src/routes/ordersRoute"));
app.use("/auth", require("./src/routes/authRoute")); 
app.use("/market", require("./src/routes/marketRoute")); 
app.use("/user", require("./src/routes/userRoute")); 
app.use("/payment", require("./src/routes/paymentRoute"));

require("./src/controllers/marketController").startMarketEngine(io);

// [NEW] 4. Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
});

server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});