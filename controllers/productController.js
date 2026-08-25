const ProductDetails = require("../models/ProductDetails");
const cloudinary = require("../config/cloudinary");

function uploadImage(buffer) {
  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      { folder: "e-commerce/products" },
      (error, result) => (error ? reject(error) : resolve(result.secure_url))
    );

    upload.end(buffer);
  });
}

async function getProducts(req, res) {
  try {
    const { search, category, section, clothingType, dressStyle, color, size, sale, minPrice, maxPrice, sort = "newest", page = 1, limit = 20 } = req.query;
    const query = {};
    const price = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }
    if (category) query.category = { $regex: category, $options: "i" };
    if (section) query.section = { $regex: section, $options: "i" };
    if (clothingType) query.clothingType = { $regex: clothingType, $options: "i" };
    if (dressStyle) query.dressStyle = { $regex: dressStyle, $options: "i" };
    if (color) query.availableColors = { $regex: color, $options: "i" };
    if (size) query.availableSizes = { $regex: size, $options: "i" };
    if (sale === "true") query.discountedPrice = { $ne: null };
    if (minPrice) price.$gte = Number(minPrice);
    if (maxPrice) price.$lte = Number(maxPrice);
    if (Object.keys(price).length) query.originalPrice = price;

    const sortBy = {
      newest: { createdAt: -1 },
      priceAsc: { originalPrice: 1 },
      priceDesc: { originalPrice: -1 },
      rating: { rating: -1 }
    }[sort] || { createdAt: -1 };
    const pageNumber = Math.max(Number(page), 1);
    const pageSize = Math.min(Math.max(Number(limit), 1), 100);
    const [products, total] = await Promise.all([
      ProductDetails.find(query)
        .sort(sortBy)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      ProductDetails.countDocuments(query)
    ]);

    return res.json({ products, total, page: pageNumber, pages: Math.ceil(total / pageSize) });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load products" });
  }
}

async function getProduct(req, res) {
  try {
    const product = await ProductDetails.findById(req.params.id).lean();

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json(product);
  } catch (error) {
    return res.status(400).json({ message: "Invalid product ID" });
  }
}

async function getRecommendations(req, res) {
  try {
    const product = await ProductDetails.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ message: "Product not found" });

    const recommendations = await ProductDetails.find({
      _id: { $ne: product._id },
      $or: [{ category: product.category }, { section: product.section }]
    })
      .limit(4)
      .lean();

    return res.json(recommendations);
  } catch (error) {
    return res.status(400).json({ message: "Failed to load recommendations" });
  }
}


async function createProduct(req, res) {
  try {
    const product = await ProductDetails.create({
      ...req.body,
      image: req.file ? await uploadImage(req.file.buffer) : req.body.image
    });

    return res.status(201).json(product);
  } catch (error) {
    return res.status(400).json({ message: "Failed to create product", error: error.message });
  }
}
//update product
async function updateProduct(req, res) {
  try {
    const updates = {
      ...req.body,
      ...(req.file && { image: await uploadImage(req.file.buffer) })
    };
    const product = await ProductDetails.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json(product);
  } catch (error) {
    return res.status(400).json({ message: "Failed to update product", error: error.message });
  }
}

async function deleteProduct(req, res) {
  try {
    const product = await ProductDetails.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json({ message: "Product deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete product" });
  }
}

module.exports = { getProducts, getProduct, getRecommendations, createProduct, updateProduct, deleteProduct };
