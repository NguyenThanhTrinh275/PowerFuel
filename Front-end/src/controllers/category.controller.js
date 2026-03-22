/** @format */

const Category = require("../models/Category.model");

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
	try {
		const categories = await Category.find({ isActive: true }).sort("name");

		res.status(200).json({
			success: true,
			count: categories.length,
			data: categories,
		});
	} catch (error) {
		next(error);
	}
};

// @desc    Get all categories (Admin - including inactive)
// @route   GET /api/categories/admin
// @access  Private/Admin
exports.getAllCategories = async (req, res, next) => {
	try {
		const categories = await Category.find().sort("-createdAt");

		res.status(200).json({
			success: true,
			count: categories.length,
			data: categories,
		});
	} catch (error) {
		next(error);
	}
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
exports.getCategory = async (req, res, next) => {
	try {
		const category = await Category.findById(req.params.id).populate(
			"products",
		);

		if (!category) {
			return res.status(404).json({
				success: false,
				message: "Không tìm thấy danh mục",
			});
		}

		res.status(200).json({
			success: true,
			data: category,
		});
	} catch (error) {
		next(error);
	}
};

// @desc    Get category by slug
// @route   GET /api/categories/slug/:slug
// @access  Public
exports.getCategoryBySlug = async (req, res, next) => {
	try {
		const category = await Category.findOne({
			slug: req.params.slug,
			isActive: true,
		});

		if (!category) {
			return res.status(404).json({
				success: false,
				message: "Không tìm thấy danh mục",
			});
		}

		res.status(200).json({
			success: true,
			data: category,
		});
	} catch (error) {
		next(error);
	}
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
exports.createCategory = async (req, res, next) => {
	try {
		const category = await Category.create(req.body);

		res.status(201).json({
			success: true,
			data: category,
		});
	} catch (error) {
		next(error);
	}
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res, next) => {
	try {
		let category = await Category.findById(req.params.id);

		if (!category) {
			return res.status(404).json({
				success: false,
				message: "Không tìm thấy danh mục",
			});
		}

		category = await Category.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});

		res.status(200).json({
			success: true,
			data: category,
		});
	} catch (error) {
		next(error);
	}
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res, next) => {
	try {
		const category = await Category.findById(req.params.id);

		if (!category) {
			return res.status(404).json({
				success: false,
				message: "Không tìm thấy danh mục",
			});
		}

		await category.deleteOne();

		res.status(200).json({
			success: true,
			message: "Đã xóa danh mục",
		});
	} catch (error) {
		next(error);
	}
};
