const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
require('dotenv').config(); // Load environment variables from .env file

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// POST /api/payments/create-intent
// Creates a PaymentIntent and returns the clientSecret to the frontend
router.post("/create-intent", async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({
        message: "Stripe is not configured. Add STRIPE_SECRET_KEY to your .env file."
      });
    }


    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert dollars to cents
      currency: "usd",
      automatic_payment_methods: { enabled: true }
    });

    return res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Stripe error:", error.message);
    return res.status(500).json({ message: error.message || "Payment initialization failed" });
  }
});

module.exports = router;
