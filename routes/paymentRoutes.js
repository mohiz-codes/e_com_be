const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const ProductDetails = require("../models/ProductDetails");
const { authenticate } = require("../middleware/auth");
require('dotenv').config(); // Load environment variables from .env file

// POST /api/payments/create-intent
// Creates a PaymentIntent and returns the clientSecret to the frontend
router.post("/create-intent", authenticate, async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || !items.length) {
      return res.status(400).json({ message: "Cart items are required" });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({
        message: "Stripe is not configured. Add STRIPE_SECRET_KEY to your .env file."
      });
    }

    const products = await ProductDetails.find({ _id: { $in: items.map((item) => item._id) } }).lean();
    const productMap = new Map(products.map((product) => [String(product._id), product]));
    const subtotal = items.reduce((sum, item) => {
      const product = productMap.get(String(item._id));
      if (!product || !Number.isInteger(item.quantity) || item.quantity < 1) throw new Error("Invalid cart item");
      return sum + (product.discountedPrice ?? product.originalPrice) * item.quantity;
    }, 0);
    const amount = subtotal + 15;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert dollars to cents
      currency: "usd",
      automatic_payment_methods: { enabled: true }
    });

    return res.json({ clientSecret: paymentIntent.client_secret, amount });
  } catch (error) {
    console.error("Stripe error:", error.message);
    return res.status(500).json({ message: error.message || "Payment initialization failed" });
  }
});

module.exports = router;
