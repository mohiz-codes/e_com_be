const Order = require("../models/Order");
const ProductDetails = require("../models/ProductDetails");

async function createOrder(req, res) {
  try {
    const { items, shipping } = req.body;
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
    const order = await Order.create({
      user: req.user ? req.user.id : undefined,
      items: orderItems,
      shipping,
      total
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
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: "Failed to load orders" });
  }
}

module.exports = { createOrder, getOrders };
