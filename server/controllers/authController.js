import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { memoryStore } from "../utils/memoryStore.js";
import mongoose from "mongoose";

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || "super_secret_jwt_key_btech_analytics_2024_secure!",
    {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide your name, email, and password.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected) {
      const userExists = await User.findOne({ email: email.toLowerCase() });
      if (userExists) {
        return res.status(400).json({
          success: false,
          message: "An account with this email already exists.",
        });
      }

      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
      });

      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        token: generateToken(user._id),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } else {
      // Memory Store Fallback
      const existing = memoryStore.findUserByEmail(email);
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "An account with this email already exists.",
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = memoryStore.saveUser({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
      });

      return res.status(201).json({
        success: true,
        message: "User registered successfully (Demo Mode)",
        token: generateToken(user._id),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both email and password.",
      });
    }

    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected) {
      const user = await User.findOne({ email: email.toLowerCase() });

      if (user && (await user.matchPassword(password))) {
        return res.json({
          success: true,
          message: "Logged in successfully",
          token: generateToken(user._id),
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        });
      }
    } else {
      const user = memoryStore.findUserByEmail(email);
      if (user && (await bcrypt.compare(password, user.password))) {
        return res.json({
          success: true,
          message: "Logged in successfully",
          token: generateToken(user._id),
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        });
      }
    }

    return res.status(401).json({
      success: false,
      message: "Invalid email or password credentials.",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};
