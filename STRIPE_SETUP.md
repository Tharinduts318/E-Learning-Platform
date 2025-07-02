# Stripe Payment Integration Setup

This project now includes Stripe payment integration alongside the existing Razorpay integration. Here's how to set it up:

## Prerequisites

1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe Dashboard

## Environment Variables

Add the following environment variables to your `server/.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

## Frontend Configuration

Update the Stripe publishable key in `frontend/src/pages/stripe-payment/StripePayment.jsx`:

```javascript
// Replace this line with your actual publishable key
const stripePromise = loadStripe('pk_test_your_stripe_publishable_key');
```

## Features

### New Stripe Payment Interface
- Beautiful, tall payment form with gradient design
- Secure card input using Stripe Elements
- Course summary and order details
- Real-time payment processing
- Responsive design for all devices

### Payment Flow
1. User clicks "Buy Now" on course description page
2. Redirects to Stripe payment page
3. User enters card details
4. Payment is processed securely through Stripe
5. Course is added to user's subscription
6. User is redirected to success page

### Security Features
- Payment intent creation on backend
- Payment verification before course access
- Encrypted card data handling
- Secure payment confirmation

## Testing

Use Stripe's test card numbers for testing:
- Success: 4242 4242 4242 4242
- Decline: 4000 0000 0000 0002
- Expiry: Any future date
- CVC: Any 3 digits

## API Endpoints

### New Stripe Endpoints
- `POST /api/stripe/create-payment-intent/:id` - Create payment intent
- `POST /api/stripe/confirm-payment` - Confirm payment
- `GET /api/stripe/payment-status/:paymentIntentId` - Get payment status

## Dependencies

### Server
- `stripe` - Stripe Node.js SDK

### Frontend
- `@stripe/stripe-js` - Stripe JavaScript SDK

## Installation

The dependencies have been added to the project. Run:

```bash
# Server dependencies
cd server && npm install

# Frontend dependencies
cd frontend && npm install
```

## Usage

1. Set up your Stripe keys in the environment variables
2. Start the server and frontend
3. Navigate to a course description page
4. Click "Buy Now" to test the Stripe payment flow

The payment interface is designed to be tall and beautiful, providing a professional checkout experience for your e-learning platform. 