import mongoose from "mongoose";

const schema = new mongoose.Schema({
  // Razorpay fields (for backward compatibility)
  razorpay_order_id: {
    type: String,
    required: false,
  },
  razorpay_payment_id: {
    type: String,
    required: false,
  },
  razorpay_signature: {
    type: String,
    required: false,
  },

  // Stripe fields
  stripe_payment_intent_id: {
    type: String,
    required: false,
  },
  amount: {
    type: Number,
    required: false,
  },
  currency: {
    type: String,
    required: false,
    default: 'usd',
  },
  status: {
    type: String,
    required: false,
    enum: ['pending', 'succeeded', 'failed', 'canceled'],
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Courses',
    required: false,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Payment = mongoose.model("Payment", schema);
