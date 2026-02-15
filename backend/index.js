import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import exchangeRateRoutes from "./routes/exchangeRateRoutes.js";
import aboutRouter from './routes/about.js';
import tradingviewPlan from './routes/tradingview.js';
import fxreplayPlan from './routes/fxreplay.js';
import canvaRouter from './routes/canva.js';
import netflixRouter from './routes/netflix.js';
import zoomRouter from './routes/zoom.js';
import scribdRouter from './routes/scribd.js';
import capcutRouter from './routes/capcut.js';
import propFirmRouter from './routes/propFirm.js';
import { errorHandler, notFound } from "./middleware/errorHandler.js";


dotenv.config();

const app = express();

// Define Allowed Origins
const allowedOrigins = [
  process.env.FRONTEND_USER_URL,
  process.env.ADMIN_BACKEND_URL,
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://localhost:5000",
]
  .filter(Boolean)
  .map((origin) => origin.replace(/\/$/, ""));

console.log("🔍 Allowed Origins:", allowedOrigins);

// Log incoming requests
app.use((req, res, next) => {
  console.log(`🔍 Incoming Request: ${req.method} ${req.url} | Origin: ${req.headers.origin}`);
  next();
});

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-api-key"],
    exposedHeaders: ["Set-Cookie"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());
app.use(morgan("combined"));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Database Connected Successfully"))
  .catch((err) => {
    console.error("❌ Database Connection Error:", err.message);
    process.exit(1);
  });

// API Routes
app.use("/api/admin", authRoutes);
app.use("/api/exchange-rate", exchangeRateRoutes);
app.use('/api/about', aboutRouter);
app.use('/api/tradingview', tradingviewPlan);
app.use('/api/fxreplay', fxreplayPlan);
app.use('/api/canva', canvaRouter);
app.use('/api/netflix', netflixRouter);
app.use('/api/zoom', zoomRouter);
app.use('/api/scribd', scribdRouter);
app.use('/api/capcut', capcutRouter);
app.use('/api/prop-firm', propFirmRouter);

app.get("/", (req, res) => {
  res.json({ message: "Vercel Deployment is working!" });
});

app.use(notFound);

// ✅ ADD DETAILED ERROR LOGGING HERE
app.use((err, req, res, next) => {
  console.error("❌ ERROR CAUGHT:");
  console.error("Message:", err.message);
  console.error("Stack:", err.stack);
  next(err);
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

export default app;