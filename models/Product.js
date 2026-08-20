const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    image: { type: String, required: true },
    originalPrice: { type: Number, required: true },
    discountedPrice: { type: Number, default: null },
    discount: { type: Number, default: null },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    category: { type: String, default: "" },
    section: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
