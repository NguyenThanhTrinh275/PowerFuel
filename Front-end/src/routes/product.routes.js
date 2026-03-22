/** @format */

const express = require("express");
const router = express.Router();
const {
	getProducts,
	getAllProducts,
	getProduct,
	getProductBySlug,
	getFeaturedProducts,
	getBestSellers,
	getRelatedProducts,
	createProduct,
	updateProduct,
	deleteProduct,
	addProductReview,
} = require("../controllers/product.controller");
const { protect, authorize } = require("../middlewares/auth.middleware");

// Public routes
router.get("/", getProducts);
router.get("/featured", getFeaturedProducts);
router.get("/bestsellers", getBestSellers);
router.get("/slug/:slug", getProductBySlug);
router.get("/:id", getProduct);
router.get("/:id/related", getRelatedProducts);

// Protected routes
router.post("/:id/reviews", protect, addProductReview);

// Admin routes
router.get("/admin/all", protect, authorize("admin"), getAllProducts);
router.post("/", protect, authorize("admin"), createProduct);
router.put("/:id", protect, authorize("admin"), updateProduct);
router.delete("/:id", protect, authorize("admin"), deleteProduct);

module.exports = router;
