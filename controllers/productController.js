const Product = require("../models/Product");

async function getProducts(req, res) {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to load products" });
  }
}

async function createProduct(req, res) {
  try {
    const product = await Product.create({
      ...req.body,
      originalPrice: Number(req.body.originalPrice),
      discountedPrice: req.body.discountedPrice ? Number(req.body.discountedPrice) : null,
      discount: req.body.discount ? Number(req.body.discount) : null,
      rating: req.body.rating ? Number(req.body.rating) : 0,
      image: req.file ? `/uploads/products/${req.file.filename}` : req.body.image
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: "Failed to create product", error: error.message });
  }
}

module.exports = { getProducts, createProduct };
