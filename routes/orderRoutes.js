const express = require("express");
const { createOrder, getOrders, getAdminOrders, updateOrderStatus, refundOrder, getSalesSummary } = require("../controllers/orderController");
const { authenticate, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/admin", authenticate, requireAdmin, getAdminOrders);
router.get("/admin/summary", authenticate, requireAdmin, getSalesSummary);
router.patch("/:id/status", authenticate, requireAdmin, updateOrderStatus);
router.post("/:id/refund", authenticate, requireAdmin, refundOrder);
router.get("/", authenticate, getOrders);
router.post("/", authenticate, createOrder);

module.exports = router;
