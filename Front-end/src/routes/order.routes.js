/** @format */

const express = require("express");
const router = express.Router();
const {
	getOrders,
	getMyOrders,
	getOrder,
	createOrder,
	updateOrderStatus,
	updatePaymentStatus,
	cancelOrder,
	getOrderStats,
} = require("../controllers/order.controller");
const { protect, authorize } = require("../middlewares/auth.middleware");

// All routes require authentication
router.use(protect);

// User routes
router.get("/myorders", getMyOrders);
router.post("/", createOrder);
router.get("/:id", getOrder);
router.put("/:id/cancel", cancelOrder);

// Admin routes
router.get("/", authorize("admin"), getOrders);
router.get("/admin/stats", authorize("admin"), getOrderStats);
router.put("/:id/status", authorize("admin"), updateOrderStatus);
router.put("/:id/pay", authorize("admin"), updatePaymentStatus);

module.exports = router;
