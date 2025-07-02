import Stripe from 'stripe';
import TryCatch from "../middlewares/TryCatch.js";
import { Courses } from "../models/Courses.js";
import { User } from "../models/User.js";
import { Payment } from "../models/Payment.js";
import { Progress } from "../models/Progress.js";

// Check if Stripe is properly configured
const isStripeConfigured = process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_your_stripe_secret_key_here';

if (!isStripeConfigured) {
  console.warn('⚠️  Stripe is not properly configured. Using test mode.');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_your_stripe_secret_key_here', {
  apiVersion: '2023-10-16'
});

export const createPaymentIntent = TryCatch(async (req, res) => {
    console.log('Stripe createPaymentIntent called with params:', req.params);
    console.log('User from request:', req.user);
    
    if (!req.user || !req.user._id) {
        console.log('No user found in request');
        return res.status(401).json({ 
            success: false,
            message: "Authentication required" 
        });
    }
    
    const user = await User.findById(req.user._id);
    if (!user) {
        console.log('User not found in database:', req.user._id);
        return res.status(404).json({ 
            success: false,
            message: "User not found" 
        });
    }

    console.log('Course ID from params:', req.params.id);
    const course = await Courses.findById(req.params.id);
    if (!course) {
        console.log('Course not found in database:', req.params.id);
        return res.status(404).json({ 
            success: false,
            message: "Course not found" 
        });
    }

    console.log('Course found:', course.title, 'Price:', course.price);

    if (!course.price || course.price <= 0) {
        console.log('Invalid course price:', course.price);
        return res.status(400).json({ 
            success: false,
            message: "Invalid course price" 
        });
    }

    if (user.subscription && user.subscription.includes(course._id)) {
        console.log('User already has this course');
        return res.status(400).json({
            success: false,
            message: "You already have this course",
        });
    }

    try {
        // Convert price to cents (Stripe expects amounts in smallest currency unit)
        const amount = Math.round(Number(course.price) * 100);
        console.log('Creating payment intent for amount:', amount);
        
        let paymentIntent;
        
        if (!isStripeConfigured) {
          // Test mode - create mock payment intent
          console.log('Using test mode - creating mock payment intent');
          paymentIntent = {
            id: 'pi_test_' + Date.now(),
            client_secret: 'pi_test_secret_' + Date.now(),
            status: 'requires_payment_method'
          };
        } else {
          // Real Stripe payment intent
          paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'usd',
            metadata: {
              userId: user._id.toString(),
              courseId: course._id.toString(),
              courseName: course.title
            },
            description: `Payment for course: ${course.title}`,
          });
        }

        console.log('Payment intent created successfully:', paymentIntent.id);

        res.status(200).json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            course: {
                id: course._id,
                title: course.title,
                price: course.price,
                image: course.image,
                description: course.description
            }
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

export const confirmPayment = TryCatch(async (req, res) => {
    const { paymentIntentId, courseId } = req.body;

    if (!paymentIntentId || !courseId) {
        return res.status(400).json({
            success: false,
            message: "Payment intent ID and course ID are required"
        });
    }

    try {
        let paymentIntent;
        
        if (!isStripeConfigured || paymentIntentId.startsWith('pi_test_')) {
            // Test mode - mock payment intent
            console.log('Using test mode - confirming mock payment');
            paymentIntent = {
                id: paymentIntentId,
                status: 'succeeded',
                amount: 5000, // $50.00 in cents
                metadata: {
                    userId: req.user._id.toString(),
                    courseId: courseId
                }
            };
        } else {
            // Retrieve the payment intent to verify it was successful
            paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        }
        
        if (paymentIntent.status !== 'succeeded') {
            return res.status(400).json({
                success: false,
                message: "Payment was not successful"
            });
        }

        // Verify the payment intent belongs to the correct user and course
        if (paymentIntent.metadata.userId !== req.user._id.toString() ||
            paymentIntent.metadata.courseId !== courseId) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment intent"
            });
        }

        // Check if payment already exists
        const existingPayment = await Payment.findOne({
            stripe_payment_intent_id: paymentIntentId
        });

        if (existingPayment) {
            return res.status(400).json({
                success: false,
                message: "Payment already processed"
            });
        }

        // Create payment record
        await Payment.create({
            stripe_payment_intent_id: paymentIntentId,
            amount: paymentIntent.amount / 100, // Convert back from cents
            currency: 'usd',
            status: paymentIntent.status,
            courseId: courseId,
            userId: req.user._id
        });

        // Add course to user's subscription
        const user = await User.findById(req.user._id);
        if (!user.subscription.includes(courseId)) {
            user.subscription.push(courseId);
            await user.save();
        }

        // Create progress record
        await Progress.create({
            course: courseId,
            completedLectures: [],
            user: req.user._id,
        });

        res.status(200).json({
            success: true,
            message: "Payment confirmed and course purchased successfully",
            paymentIntentId: paymentIntentId
        });
    } catch (error) {
        console.error('Payment Confirmation Error:', error);
        res.status(500).json({
            success: false,
            message: 'Payment confirmation failed',
            error: error.message
        });
    }
});

export const getPaymentStatus = TryCatch(async (req, res) => {
    const { paymentIntentId } = req.params;

    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        
        res.status(200).json({
            success: true,
            status: paymentIntent.status,
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency
        });
    } catch (error) {
        console.error('Payment Status Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get payment status',
            error: error.message
        });
    }
}); 