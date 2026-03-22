/** @format */

const express = require("express");
const router = express.Router();
const {
	getCategories,
	getAllCategories,
	getCategory,
	getCategoryBySlug,
	createCategory,
	updateCategory,
	deleteCategory,
} = require("../controllers/category.controller");
const { protect, authorize } = require("../middlewares/auth.middleware");

// Public routes
router.get("/", getCategories);
router.get("/slug/:slug", getCategoryBySlug);
router.get("/:id", getCategory);

// Admin routes
router.get("/admin/all", protect, authorize("admin"), getAllCategories);
router.post("/", protect, authorize("admin"), createCategory);
router.put("/:id", protect, authorize("admin"), updateCategory);
router.delete("/:id", protect, authorize("admin"), deleteCategory);

module.exports = router;
