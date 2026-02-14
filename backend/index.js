const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./src/config/db");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined in the environment.");
  process.exit(1); 
}

connectDB();

const app = express();
const PORT = process.env.PORT || 3002;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
  "http://localhost:5173",
  "http://localhost:5174", // Add this
  "http://localhost:3000", // Add this
  "http://127.0.0.1:5173", // Add this (IP based access)
  "https://swayamzerodha.vercel.app"
],
    methods: ["GET", "POST"]
  }
});

app.use(cors({
  origin: ["http://localhost:5173", "https://swayamzerodha.vercel.app"]
}));

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

const holdingsRoute = require("./src/routes/holdingsRoute");
const ordersRoute = require("./src/routes/ordersRoute");
const authRoute = require("./src/routes/authRoute");
const marketRoute = require("./src/routes/marketRoute");
const userRoute = require("./src/routes/userRoute"); 

app.use("/", holdingsRoute); 
app.use("/", ordersRoute);
app.use("/auth", authRoute); 
app.use("/market", marketRoute); 
app.use("/user", userRoute); 

require("./src/controllers/marketController").startMarketEngine(io);

app.get("/", (req, res) => {
  res.send("Kite Trading Backend is Live and Running!");
});

server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});