// Kite-Zerodha/backend/index.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./src/config/db");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

// Ensure critical variables exist
if (!process.env.JWT_SECRET || !process.env.MONGO_URL) {
  console.error("FATAL ERROR: JWT_SECRET or MONGO_URL is not defined.");
  process.exit(1); 
}

connectDB();

const app = express();
const PORT = process.env.PORT || 3002;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    // Replace with your actual frontend URL
    origin: ["http://localhost:5173", "https://swayamzerodha.vercel.app", "https://kite-zerodha-seven.vercel.app"],
    methods: ["GET", "POST"]
  }
});

app.use(cors({
  origin: ["http://localhost:5173", "https://swayamzerodha.vercel.app", "https://kite-zerodha-seven.vercel.app"],
  credentials: true
}));

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// Routes
app.use("/", require("./src/routes/holdingsRoute")); 
app.use("/", require("./src/routes/ordersRoute"));
app.use("/auth", require("./src/routes/authRoute")); 
app.use("/market", require("./src/routes/marketRoute")); 
app.use("/user", require("./src/routes/userRoute")); 
app.use("/payment", require("./src/routes/paymentRoute"));

require("./src/controllers/marketController").startMarketEngine(io);

server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});