import jwt from "jsonwebtoken";
// ❌ REMOVE: import asyncHandler from "express-async-handler";
import Admin from "../models/Admin.js";
import dotenv from "dotenv";

dotenv.config();

// ✅ Remove asyncHandler wrapper
export const protect = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({ success: false, message: "Not authorized, no token provided" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.admin = await Admin.findById(decoded.id).select("-password");
      if (!req.admin) {
        return res.status(401).json({ success: false, message: "Not authorized as an admin" });
      }
      if (!req.admin.isVerified) {
        return res.status(403).json({
          success: false,
          message: "Please verify your email before accessing this resource",
        });
      }
      console.log("✅ JWT validated for admin:", req.admin._id);
      next();
    } catch (error) {
      console.error("🔴 Token verification failed:", error.message);
      return res.status(401).json({ success: false, message: "Not authorized, token failed or expired" });
    }
  } catch (error) {
    console.error("🔴 Protect middleware error:", error);
    return res.status(500).json({ success: false, message: "Server error in authentication" });
  }
};