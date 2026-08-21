const express = require("express");
const multer = require("multer");
const path = require("path");
const { getProducts, createProduct } = require("../controllers/productController");

const router = express.Router();
const upload = multer({
	limits: { fileSize: 5 * 1024 * 1024 }
});

router.get("/", getProducts);
router.post("/", upload.single("image"), createProduct);

module.exports = router;
