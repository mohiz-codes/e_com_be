const Review = require("../models/reviews.model");
const ProductDetails = require("../models/ProductDetails");

async function getReviews(req, res) {
  try {
    const reviews = await Review.find()
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    return res.json(reviews);
  } catch (error) {
    return res.status(500).json({ message: "Failed to load reviews" });
  }
}

async function getProductReviews(req, res) {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .lean();

    return res.json(reviews);
  } catch (error) {
    return res.status(400).json({ message: "Failed to load reviews" });
  }
}

async function createReview(req, res) {
  try {
    const reviewData = {
      ...req.body,
      user: req.user?.id
    };
    const review = await Review.create(reviewData);
    await ProductDetails.findByIdAndUpdate(req.body.product, {
      $addToSet: { reviews: review._id }
    });

    return res.status(201).json(review);
  } catch (error) {
    return res.status(400).json({ message: "Failed to create review", error: error.message });
  }
}

module.exports = { getReviews, getProductReviews, createReview };