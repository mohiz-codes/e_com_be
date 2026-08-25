const express = require("express");
const multer = require("multer");
const authenticate = require("../middleware/auth");
const { getProducts, getProduct, getRecommendations, createProduct, updateProduct, deleteProduct } = require("../controllers/productController");

const router = express.Router();
const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } });

router.get("/", getProducts);
router.get("/:id/recommendations", getRecommendations);
router.get("/:id", getProduct);
router.post("/", authenticate, upload.single("image"), createProduct);
router.put("/:id", authenticate, upload.single("image"), updateProduct);
router.delete("/:id", authenticate, deleteProduct);

module.exports = router;
