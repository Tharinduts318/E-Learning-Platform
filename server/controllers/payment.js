import TryCatch from "../middlewares/TryCatch.js";
import { Courses } from "../models/Courses.js";
import { User } from "../models/User.js";
import { Payment } from "../models/Payment.js";
import { Progress } from "../models/Progress.js";
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16'
});

export const createPaymentIntent = TryCatch(async (req, res) => {
    if (!req.user || !req.user._id) {
        return res.status(401).json({ message: "Authentication required" });
    }
    
    const user = await User.findById(req.user._id);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const course = await Courses.findById(req.params.id);
    if (!course) {
        return res.status(404).json({ message: "Course not found" });
    }

    if (!course.price || course.price <= 0) {
        return res.status(400).json({ message: "Invalid course price" });
    }

    if (user.subscription && user.subscription.includes(course._id)) {
        return res.status(400).json({
            message: "You already have this course",
        });
    }

    try {
        const amount = Math.round(Number(course.price) * 100);
        
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'usd',
            metadata: {
                userId: user._id.toString(),
                courseId: course._id.toString(),
                courseName: course.title
            }
        });

        res.status(200).json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            course
        });
    } catch (error) {
        console.error('Payment Intent Creation Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create payment intent',
            error: error.message
        });
    }
});

export const verifyPayment = TryCatch(async (req, res) => {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
        return res.status(400).json({
            success: false,
            message: "Payment verification failed - missing payment intent ID"
        });
    }

    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        
        if (paymentIntent.status !== 'succeeded') {
            return res.status(400).json({
                success: false,
                message: "Payment has not been completed"
            });
        }

        const payment = await Payment.create({
            stripe_payment_intent_id: paymentIntentId,
            amount: paymentIntent.amount / 100,
            status: paymentIntent.status
        });

        const courseId = paymentIntent.metadata.courseId;
        const userId = paymentIntent.metadata.userId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const course = await Courses.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        // Check if user already has the course
        if (user.subscription && user.subscription.includes(courseId)) {
            return res.status(400).json({
                success: false,
                message: "You already have this course"
            });
        }

        // Add course to user's subscription
        user.subscription.push(courseId);
        await user.save();

        // Create progress tracking for the course
        await Progress.create({
            course: courseId,
            completedLectures: [],
            user: userId,
        });

        res.status(200).json({
            success: true,
            message: "Payment Verified and Course Purchased Successfully"
        });
    } catch (error) {
        console.error('Payment Verification Error:', error);
        res.status(500).json({
            success: false,
            message: 'Payment verification failed',
            error: error.message
        });
    }
});

// Get payment status
export const getPaymentStatus = TryCatch(async (req, res) => {
    const { paymentIntentId } = req.params;
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    res.status(200).json({
        success: true,
        status: paymentIntent.status
    });
});
