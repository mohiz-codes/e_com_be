//schema for reviews
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ProductDetails",
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  name: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    required: true
  },
  feedback: {
    type: String,
    required: true
  },
  postedOn: {
    type: Date,
    default: Date.now
  }

},
 {
    timestamps: true
 }
);

module.exports = mongoose.model("Review", reviewSchema);