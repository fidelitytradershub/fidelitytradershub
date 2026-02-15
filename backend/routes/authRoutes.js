import express from "express";
import {
  registerAdmin,
  loginAdmin,
  logoutAdmin,
  verifyEmail,
  resetPassword,
  changePassword,
  requestPasswordReset,
  getAdminProfile,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin Authentication Routes
router.post("/register", registerAdmin); // Admin Signup
router.post("/login", loginAdmin); // Admin Login
router.post("/logout", logoutAdmin); // Admin Logout
router.get("/verify/:token", verifyEmail); // Email Verification

// Password Management
router.post("/reset-password/:token", resetPassword); // Reset Password
router.put("/change-password", protect, changePassword); // Change Password when logged in

// Route for requesting password reset (sends the email with the token)
router.post("/reset-password-request", requestPasswordReset);
router.get("/me", protect, getAdminProfile); // New route to fetch logged-in admin

export default router;