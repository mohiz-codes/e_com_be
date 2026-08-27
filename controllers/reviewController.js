const Review = require("../models/reviews.model");
const ProductDetails = require("../models/ProductDetails");
const Order = require("../models/Order");
const User = require("../models/user.model");

async function canUserReview(userId, productId) {
  const hasPurchased = await Order.exists({
    user: userId,
    status: "delivered",
    "items.product": productId
  });
  const hasReviewed = await Review.exists({ user: userId, product: productId });
  return Boolean(hasPurchased) && !hasReviewed;
}

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
    if (!req.body.product || !(await canUserReview(req.user.id, req.body.product))) {
      return res.status(403).json({ message: "Only customers who purchased this product can leave one review" });
    }
    const user = await User.findById(req.user.id).lean();
    if (!user) return res.status(404).json({ message: "User not found" });
    const reviewData = {
      product: req.body.product,
      rating: req.body.rating,
      feedback: req.body.feedback,
      name: user.name,
      user: req.user.id
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

async function getReviewEligibility(req, res) {
  try {
    const canReview = await canUserReview(req.user.id, req.params.productId);
    return res.json({ canReview });
  } catch (error) {
    return res.status(400).json({ message: "Unable to check review eligibility" });
  }
}

module.exports = { getReviews, getProductReviews, createReview, getReviewEligibility };
