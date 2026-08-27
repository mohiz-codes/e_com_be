const Order = require("../models/Order");
const ProductDetails = require("../models/ProductDetails");
const Stripe = require("stripe");
const Review = require("../models/reviews.model");

async function createOrder(req, res) {
  try {
    const { items, shipping, paymentIntentId } = req.body;
    if (!Array.isArray(items) || !items.length) {
      return res.status(400).json({ message: "Order must contain items" });
    }

    const products = await ProductDetails.find({
      _id: { $in: items.map((item) => item.product) }
    }).lean();
    const productMap = new Map(products.map((product) => [String(product._id), product]));
    const orderItems = items.map((item) => {
      const product = productMap.get(String(item.product));
      if (!product || !Number.isInteger(item.quantity) || item.quantity < 1) {
        throw new Error("Invalid order item");
      }

      return {
        product: product._id,
        title: product.title,
        image: product.image?.[0],
        price: product.discountedPrice ?? product.originalPrice,
        quantity: item.quantity,
        size: item.size,
        color: item.color
      };
    });
    const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 15);
    if (!paymentIntentId || !process.env.STRIPE_SECRET_KEY) {
      return res.status(400).json({ message: "A completed payment is required" });
    }
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== "succeeded" || paymentIntent.amount_received !== Math.round(total * 100)) {
      return res.status(400).json({ message: "Payment could not be verified" });
    }
    const order = await Order.create({
      user: req.user ? req.user.id : undefined,
      items: orderItems,
      shipping,
      total,
      paymentIntentId: paymentIntentId || ""
    });
    return res.status(201).json(order);
  } catch (error) {
    return res.status(400).json({ message: "Failed to create order", error: error.message });
  }
}

async function getOrders(req, res) {
  try {
    const filter = req.user?.id ? { user: req.user.id } : {};
    const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();
    const reviewedProductIds = new Set((await Review.find({ user: req.user.id }).distinct("product")).map(String));
    const ordersWithReviewEligibility = orders.map((order) => ({
      ...order,
      items: order.items.map((item) => ({
        ...item,
        canReview: order.status === "delivered" && !reviewedProductIds.has(String(item.product))
      }))
    }));
    return res.json(ordersWithReviewEligibility);
  } catch (error) {
    return res.status(500).json({ message: "Failed to load orders" });
  }
}

async function getAdminOrders(req, res) {
  try {
    const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 }).lean();
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: "Failed to load orders" });
  }
}

async function updateOrderStatus(req, res) {
  const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
  if (!statuses.includes(req.body.status)) return res.status(400).json({ message: "Invalid order status" });
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true }).lean();
    return order ? res.json(order) : res.status(404).json({ message: "Order not found" });
  } catch (error) {
    return res.status(400).json({ message: "Invalid order ID" });
  }
}

async function refundOrder(req, res) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.paymentStatus === "refunded") return res.status(409).json({ message: "Order has already been refunded" });
    if (!order.paymentIntentId || !process.env.STRIPE_SECRET_KEY) {
      return res.status(400).json({ message: "This order has no refundable Stripe payment" });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const refund = await stripe.refunds.create({ payment_intent: order.paymentIntentId });
    order.status = "refunded";
    order.paymentStatus = "refunded";
    order.refund = { id: refund.id, reason: req.body.reason || "requested_by_customer", refundedAt: new Date() };
    await order.save();
    return res.json(order);
  } catch (error) {
    return res.status(400).json({ message: error.message || "Unable to refund order" });
  }
}

async function getSalesSummary(req, res) {
  try {
    const [summary] = await Order.aggregate([
      { $match: { status: { $nin: ["cancelled", "refunded"] } } },
      { $group: { _id: null, sales: { $sum: "$total" }, orders: { $sum: 1 } } }
    ]);
    const refundedOrders = await Order.countDocuments({ status: "refunded" });
    return res.json({ sales: summary?.sales || 0, orders: summary?.orders || 0, refundedOrders });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load sales summary" });
  }
}

module.exports = { createOrder, getOrders, getAdminOrders, updateOrderStatus, refundOrder, getSalesSummary };
