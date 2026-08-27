const express = require("express");
const { getReviews, getProductReviews, createReview, getReviewEligibility } = require("../controllers/reviewController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.get("/", getReviews);
router.get("/product/:productId", getProductReviews);
router.get("/eligibility/:productId", authenticate, getReviewEligibility);
router.post("/", authenticate, createReview);

module.exports = router;
