import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export const isAuth = async (req, res, next) => {
  try {    let token = req.headers.token || req.headers.authorization;

    if (!token) {
      return res.status(403).json({
        message: "Please Login",
      });
    }

    // Remove Bearer if present
    if (token.startsWith('Bearer ')) {
      token = token.slice(7);
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decodedData._id);

    next();
  } catch (error) {
    res.status(500).json({
      message: "Login First",
    });
  }
};

export const isAdmin = (req, res, next) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({
        message: "You are not admin",
      });

    next();
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
