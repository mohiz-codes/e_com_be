const express = require("express");
const multer = require("multer");
const path = require("path");
const { getProducts, createProduct } = require("../controllers/productController");

const router = express.Router();
const upload = multer({
	storage: multer.diskStorage({
		destination: path.join(__dirname, "../uploads/products"),
		filename: (req, file, callback) => {
			const extension = path.extname(file.originalname).toLowerCase();
			callback(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`);
		}
	}),
	limits: { fileSize: 5 * 1024 * 1024 },
	fileFilter: (req, file, callback) => {
		if (file.mimetype.startsWith("image/")) {
			callback(null, true);
		} else {
			callback(new Error("Only image files are allowed"));
		}
	}
});

router.get("/", getProducts);
router.post("/", upload.single("image"), createProduct);

module.exports = router;
