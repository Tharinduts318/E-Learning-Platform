import express from "express";
import { createPaymentIntent, confirmPayment, getPaymentStatus } from "../controllers/stripe.js";
import { isAuth } from "../middlewares/isAuth.js";

const router = express.Router();

// Create payment intent for a course
router.post("/create-payment-intent/:id", isAuth, createPaymentIntent);

// Confirm payment after successful payment
router.post("/confirm-payment", isAuth, confirmPayment);

// Get payment status
router.get("/payment-status/:paymentIntentId", isAuth, getPaymentStatus);

export default router; 