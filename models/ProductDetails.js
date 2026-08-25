const mongoose = require("mongoose");

const productDetailsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    image: {
      type: [String],
      required: true,
    },

    originalPrice: {
      type: Number,
      required: true,
    },
    discountedPrice: {
      type: Number,
      default: null,
    },
    discount: {
      type: Number,
      default: null,
    },

    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 5,
    },
    //casual , formnal 
    category: {
      type: String,
      default: "",
    },
    //men women
    section: {
      type: String,
      default: "",
    },
    clothingType: {
      type: String,
      default: "",
    },
    dressStyle: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },

    availableSizes: {
      type: [String],
      default: [],
    },

    availableColors: {
      type: [String],
      default: [],
    },

    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "ProductDetails",
  productDetailsSchema
);