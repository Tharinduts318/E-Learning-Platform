import express from "express";
import { createPaymentIntent, verifyPayment, getPaymentStatus } from "../controllers/payment.js";
import { isAuth } from "../middlewares/isAuth.js";

const router = express.Router();

// Payment routes

export default router;
