import express from "express";
import {
  setExchangeRate,
  getExchangeRate,
} from "../controllers/exchangeRateController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Update exchange rate (Super admin only)
router.post(
  "/set",
  protect,
  setExchangeRate
);

// Get exchange rate (Public for user backend)
router.get("/get", getExchangeRate);

export default router;
