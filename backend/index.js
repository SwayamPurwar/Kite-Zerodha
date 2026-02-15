const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./src/config/db");
const http = require("http");
const { Server } = require("socket.io");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const nodemailer = require("nodemailer");
const dns = require("dns"); // [NEW] Import DNS

// [CRITICAL FIX] Force Node.js to use IPv4 globally
// This prevents the ENETUNREACH IPv6 error completely
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

dotenv.config();

// Ensure critical variables exist
if (!process.env.JWT_SECRET || !process.env.MONGO_URL) {
  console.error("FATAL ERROR: JWT_SECRET or MONGO_URL is not defined.");
  process.exit(1); 
}

connectDB();

const app = express();
const PORT = process.env.PORT || 3002;

// Trust Proxy (Required for Render)
app.set('trust proxy', 1);

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: "Too many requests from this IP",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/auth", limiter);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
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

// Root Route
app.get("/", (req, res) => {
    res.send("<h1>Kite Zerodha Backend is Running!</h1>");
});

// [DEBUG ROUTE] Test Email Functionality
app.get("/test-email", async (req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      family: 4 // Double safety
    });

    await transporter.sendMail({
      from: `"Kite Debug" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Sends to yourself
      subject: "Test Email from Kite",
      text: "If you see this, your email configuration is finally correct!"
    });

    res.json({ message: "✅ Email Sent Successfully! Check your Inbox/Spam." });
  } catch (error) {
    res.status(500).json({ 
        message: "Email Failed", 
        error: error.message, 
        stack: error.stack 
    });
  }
});

// Routes
app.use("/", require("./src/routes/holdingsRoute")); 
app.use("/", require("./src/routes/ordersRoute"));
app.use("/auth", require("./src/routes/authRoute")); 
app.use("/market", require("./src/routes/marketRoute")); 
app.use("/user", require("./src/routes/userRoute")); 
app.use("/payment", require("./src/routes/paymentRoute"));

require("./src/controllers/marketController").startMarketEngine(io);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
});

server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});