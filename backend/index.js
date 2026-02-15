// Kite-Zerodha/backend/index.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./src/config/db");
const http = require("http");
const { Server } = require("socket.io");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

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

// ============================================================
// [DEBUG ROUTE] Test Email Functionality via Brevo HTTP API
// ============================================================
app.get("/test-email", async (req, res) => {
  try {
    if (!process.env.BREVO_API_KEY) {
      return res.status(400).json({ message: "BREVO_API_KEY is missing in your environment variables!" });
    }

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { email: process.env.EMAIL_USER, name: 'Kite Zerodha Debug' }, // Must be your verified Gmail in Brevo
        to: [{ email: process.env.EMAIL_USER }], // Sends to yourself for testing
        subject: "Test Email from Kite (via Brevo API)",
        htmlContent: "<p><strong>Success!</strong> If you see this, the Brevo API is working perfectly and bypassing Render's firewall. You can now send OTPs to anyone!</p>"
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(400).json({ message: "Brevo API rejected the email", error: data });
    }

    res.json({ message: "✅ Email Sent Successfully! Check your Inbox/Spam.", brevoResponse: data });
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