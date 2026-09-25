import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { memoryStore } from "../utils/memoryStore.js";
import mongoose from "mongoose";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "super_secret_jwt_key_btech_analytics_2024_secure!"
      );

      // Check if MongoDB is connected
      if (mongoose.connection.readyState === 1) {
        req.user = await User.findById(decoded.id).select("-password");
      } else {
        // Resilient in-memory fallback
        req.user = memoryStore.findUserById(decoded.id);
      }

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User account associated with this token not found.",
        });
      }

      next();
    } catch (error) {
      console.error("JWT Verification error:", error.message);
      return res.status(401).json({
        success: false,
        message: "Not authorized, token is invalid or expired.",
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no bearer token provided.",
    });
  }
};
