const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();
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
  origin: ["http://localhost:5173", "https://swayamzerodha.vercel.app"]
}));

// INCREASED LIMIT TO 50MB FOR LARGE HIGH-RES AVATARS
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// Import Routes
const holdingsRoute = require("./routes/holdingsRoute");
const ordersRoute = require("./routes/ordersRoute");
const authRoute = require("./routes/authRoute");
const marketRoute = require("./routes/marketRoute");
const userRoute = require("./routes/userRoute"); 

app.use("/", holdingsRoute); 
app.use("/", ordersRoute);
app.use("/auth", authRoute); 
app.use("/market", marketRoute); 
app.use("/user", userRoute); 

// Start the live market engine
require("./controllers/marketController").startMarketEngine(io);

app.get("/", (req, res) => {
  res.send("Kite Trading Backend is Live and Running!");
});
server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});