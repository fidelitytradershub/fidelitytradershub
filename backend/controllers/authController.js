import Admin from "../models/Admin.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { emailTemplates } from "../utils/emailTemplates.js";

dotenv.config();

const sendError = (res, message, statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "14d" });
};

export const registerAdmin = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
      return sendError(res, "All fields (name, username, email, password) are required", 400);
    }

    if (password.length < 8) {
      return sendError(res, "Password must be at least 8 characters", 400);
    }

    const normalizedEmail = email.toLowerCase().trim();

    const adminCount = await Admin.countDocuments();
    if (adminCount >= 4) {
      return sendError(res, "Admin limit reached. Only 4 admins allowed.", 403);
    }

    const adminExists = await Admin.findOne({ email: normalizedEmail });
    if (adminExists) {
      return sendError(res, "Admin with this email already exists", 400);
    }

    // ✅ Hash password BEFORE creating admin
    const bcrypt = await import("bcryptjs");
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const admin = await Admin.create({
      name,
      username,
      email: normalizedEmail,
      password: hashedPassword, // ✅ Use hashed password
      isVerified: false,
    });

    // Send verification email
    try {
      const verificationToken = jwt.sign(
        { id: admin._id },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );
      const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

      const mailOptions = await emailTemplates.verificationEmail(
        admin.username,
        verificationLink
      );
      mailOptions.to = admin.email;
      const info = await mailOptions.transporter.sendMail(mailOptions);

      console.log("Verification email sent →", admin.email, info.response);

      return res.status(201).json({
        success: true,
        message: "Verification email sent. Please check your inbox.",
        adminId: admin._id,
      });
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);

      return res.status(201).json({
        success: true,
        message: "Admin registered, but verification email failed to send. Contact support.",
        adminId: admin._id,
        warning: "Email delivery failed",
      });
    }
  } catch (error) {
    console.error("Registration error:", error);
    return sendError(res, error.message || "Registration failed", 500);
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) {
      return sendError(res, "Verification token is required", 400);
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return sendError(res, "Invalid or expired verification token", 400);
    }

    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return sendError(res, "Admin not found for this token", 404);
    }

    if (admin.isVerified) {
      return sendError(res, "Email already verified", 400);
    }

    admin.isVerified = true;
    await admin.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Email verification error:", error);
    return sendError(res, error.message || "Verification failed", 500);
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, "Email and password are required", 400);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const admin = await Admin.findOne({ email: normalizedEmail });

    if (!admin) {
      return sendError(res, "Invalid email or password", 401);
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return sendError(res, "Invalid email or password", 401);
    }

    if (!admin.isVerified) {
      return sendError(res, "Please verify your email before logging in", 403);
    }

    const token = generateToken(admin._id);

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "lax",
      maxAge: 14 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      _id: admin._id,
      username: admin.username,
      email: admin.email,
      token,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    return sendError(res, error.message || "Login failed", 500);
  }
};

export const logoutAdmin = async (req, res) => {
  try {
    res.cookie("jwt", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "lax",
      expires: new Date(0),
    });

    res.status(200).json({ success: true, message: "Admin logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return sendError(res, error.message || "Logout failed", 500);
  }
};

export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return sendError(res, "Email is required", 400);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const admin = await Admin.findOne({ email: normalizedEmail });

    if (!admin) {
      return sendError(res, "Admin not found", 404);
    }

    const resetToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    admin.resetToken = resetToken;
    admin.resetTokenExpiration = Date.now() + 3600000;
    await admin.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const mailOptions = await emailTemplates.passwordResetEmail(resetLink);
    mailOptions.to = admin.email;

    try {
      const info = await mailOptions.transporter.sendMail(mailOptions);
      console.log("Password reset email sent to:", admin.email, "Response:", info.response);
      return res.status(200).json({ success: true, message: "Password reset email sent successfully" });
    } catch (error) {
      console.error("Failed to send password reset email:", error);
      return res.status(200).json({
        success: true,
        message: "Reset token generated, but email failed to send. Contact support.",
      });
    }
  } catch (error) {
    console.error("Password reset request error:", error);
    return sendError(res, error.message || "Password reset request failed", 500);
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return sendError(res, "Token and new password are required", 400);
    }

    if (newPassword.length < 8) {
      return sendError(res, "New password must be at least 8 characters", 400);
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return sendError(res, "Invalid or expired reset token", 400);
    }

    const admin = await Admin.findById(decoded.id);
    if (
      !admin ||
      admin.resetToken !== token ||
      admin.resetTokenExpiration < Date.now()
    ) {
      return sendError(res, "Invalid or expired reset token", 400);
    }

    // ✅ Hash password before saving
    const bcrypt = await import("bcryptjs");
    const salt = bcrypt.genSaltSync(10);
    admin.password = bcrypt.hashSync(newPassword, salt);
    admin.resetToken = undefined;
    admin.resetTokenExpiration = undefined;
    
    // Save without triggering pre-save hook
    await admin.save();

    res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error("Password reset error:", error);
    return sendError(res, error.message || "Password reset failed", 500);
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return sendError(res, "Current and new passwords are required", 400);
    }

    if (newPassword.length < 8) {
      return sendError(res, "New password must be at least 8 characters", 400);
    }

    const admin = await Admin.findById(req.admin._id);
    if (!admin) {
      return sendError(res, "Admin not found", 404);
    }

    const isMatch = await admin.matchPassword(currentPassword);
    if (!isMatch) {
      return sendError(res, "Current password is incorrect", 400);
    }

    // ✅ Hash password before saving
    const bcrypt = await import("bcryptjs");
    const salt = bcrypt.genSaltSync(10);
    admin.password = bcrypt.hashSync(newPassword, salt);
    await admin.save();

    const newToken = generateToken(admin._id);

    res.cookie("jwt", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "lax",
      maxAge: 14 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
      token: newToken,
    });
  } catch (error) {
    console.error("Change password error:", error);
    return sendError(res, error.message || "Change password failed", 500);
  }
};

export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select("-password -resetToken -resetTokenExpiration");

    if (!admin) {
      return sendError(res, "Admin not found", 404);
    }

    res.status(200).json({
      success: true,
      admin: {
        _id: admin._id,
        name: admin.name,
        username: admin.username,
        email: admin.email,
        isVerified: admin.isVerified,
        createdAt: admin.createdAt,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return sendError(res, error.message || "Failed to get profile", 500);
  }
};