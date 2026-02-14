const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./src/config/db");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined.");
  process.exit(1); 
}

connectDB();

const app = express();
const PORT = process.env.PORT || 3002;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://swayamzerodha.vercel.app"],
    methods: ["GET", "POST"]
  }
});

app.use(cors({
  origin: ["http://localhost:5173", "https://swayamzerodha.vercel.app"],
  credentials: true
}));

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// --- Import Routes ---
const holdingsRoute = require("./src/routes/holdingsRoute");
const ordersRoute = require("./src/routes/ordersRoute");
const authRoute = require("./src/routes/authRoute");
const marketRoute = require("./src/routes/marketRoute");
const userRoute = require("./src/routes/userRoute"); 
const paymentRoute = require("./src/routes/paymentRoute"); // ✅ Import Payment Route

// --- Use Routes ---
app.use("/", holdingsRoute); 
app.use("/", ordersRoute);
app.use("/auth", authRoute); 
app.use("/market", marketRoute); 
app.use("/user", userRoute); 
app.use("/payment", paymentRoute); // ✅ Register Payment Route

require("./src/controllers/marketController").startMarketEngine(io);

app.get("/", (req, res) => {
  res.send("Kite Trading Backend is Live!");
});

server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});