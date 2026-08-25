const express = require("express");
const { createOrder, getOrders } = require("../controllers/orderController");
const authenticate = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticate, getOrders);
router.post("/", authenticate, createOrder);

module.exports = router;
