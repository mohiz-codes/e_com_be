const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const { v2: cloudinary } = require("cloudinary");
const ProductDetails = require("./models/ProductDetails");

 dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const products = [
  ["T-SHIRT WITH TAPE DETAILS", "s1.png", 120, null, null, "new-arrivals", ["Small", "Medium", "Large", "X-Large"], ["Black", "White"]],
  ["Skinny Fit Jeans", "s2.png", 260, 208, 20, "new-arrivals", ["30", "32", "34", "36"], ["Blue", "Black"]],
  ["SLEEVE STRIPED T-SHIRT", "s3.png", 130, null, null, "new-arrivals", ["Small", "Medium", "Large", "X-Large"], ["White", "Navy"]],
  ["VERTICAL STRIPED SHIRT", "s4.png", 232, 186, 20, "top-selling", ["Small", "Medium", "Large", "X-Large"], ["Green", "White"]],
  ["Gradient Graphic T-shirt", "s5.png", 145, null, null, "top-selling", ["Small", "Medium", "Large", "X-Large"], ["Black", "Red"]],
  ["Polo with Tipping Details", "s6.png", 180, 144, 20, "top-selling", ["Small", "Medium", "Large", "X-Large"], ["White", "Blue"]],
  ["Black Striped T-shirt", "s7.png", 180, null, null, "top-selling", ["Small", "Medium", "Large", "X-Large"], ["Black", "Gray"]],
  ["Polo with Contrast Trims", "s8.png", 242, null, null, "top-selling", ["Small", "Medium", "Large", "X-Large"], ["White", "Green"]]
];

function uploadImage(filePath) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "e-commerce/products" },
      (error, result) => error ? reject(error) : resolve(result.secure_url)
    );
    stream.end(fs.readFileSync(filePath));
  });
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  for (const [title, file, originalPrice, discountedPrice, discount, section, availableSizes, availableColors] of products) {
    const image = await uploadImage(path.join(__dirname, "../e_com/public/products", file));
    await ProductDetails.findOneAndUpdate(
      { title },
      { title, image: [image], originalPrice, discountedPrice, discount, section, availableSizes, availableColors },
      { upsert: true, new: true, runValidators: true }
    );
  }
  await ProductDetails.updateMany(
    { $or: [{ availableSizes: { $size: 0 } }, { availableColors: { $size: 0 } }] },
    { $set: { availableSizes: ["Small", "Medium", "Large", "X-Large"], availableColors: ["Black", "White"] } }
  );
  console.log("Products seeded");
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect();
  process.exit(1);
});
