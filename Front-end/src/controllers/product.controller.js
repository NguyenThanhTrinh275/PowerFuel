/** @format */

const Product = require("../models/Product.model");

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
	try {
		const page = parseInt(req.query.page, 10) || 1;
		const limit = parseInt(req.query.limit, 10) || 12;
		const startIndex = (page - 1) * limit;

		// Build query
		let query = { isActive: true };

		// Filter by category
		if (req.query.category) {
			query.category = req.query.category;
		}

		// Filter by brand
		if (req.query.brand) {
			query.brand = { $regex: req.query.brand, $options: "i" };
		}

		// Filter by price range
		if (req.query.minPrice || req.query.maxPrice) {
			query.price = {};
			if (req.query.minPrice)
				query.price.$gte = parseInt(req.query.minPrice);
			if (req.query.maxPrice)
				query.price.$lte = parseInt(req.query.maxPrice);
		}

		// Search
		if (req.query.search) {
			query.$text = { $search: req.query.search };
		}

		// Sort
		let sortBy = "-createdAt";
		if (req.query.sort) {
			switch (req.query.sort) {
				case "price_asc":
					sortBy = "price";
					break;
				case "price_desc":
					sortBy = "-price";
					break;
				case "name_asc":
					sortBy = "name";
					break;
				case "name_desc":
					sortBy = "-name";
					break;
				case "rating":
					sortBy = "-ratings.average";
					break;
				case "sold":
					sortBy = "-sold";
					break;
				default:
					sortBy = "-createdAt";
			}
		}

		const total = await Product.countDocuments(query);
		const products = await Product.find(query)
			.populate("category", "name slug")
			.skip(startIndex)
			.limit(limit)
			.sort(sortBy);

		res.status(200).json({
			success: true,
			count: products.length,
			total,
			totalPages: Math.ceil(total / limit),
			currentPage: page,
			data: products,
		});
	} catch (error) {
		next(error);
	}
};

// @desc    Get all products (Admin)
// @route   GET /api/products/admin
// @access  Private/Admin
exports.getAllProducts = async (req, res, next) => {
	try {
		const page = parseInt(req.query.page, 10) || 1;
		const limit = parseInt(req.query.limit, 10) || 20;
		const startIndex = (page - 1) * limit;

		const total = await Product.countDocuments();
		const products = await Product.find()
			.populate("category", "name slug")
			.skip(startIndex)
			.limit(limit)
			.sort("-createdAt");

		res.status(200).json({
			success: true,
			count: products.length,
			total,
			totalPages: Math.ceil(total / limit),
			currentPage: page,
			data: products,
		});
	} catch (error) {
		next(error);
	}
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res, next) => {
	try {
		const product = await Product.findById(req.params.id)
			.populate("category", "name slug")
			.populate("reviews.user", "name avatar");

		if (!product) {
			return res.status(404).json({
				success: false,
				message: "Không tìm thấy sản phẩm",
			});
		}

		res.status(200).json({
			success: true,
			data: product,
		});
	} catch (error) {
		next(error);
	}
};

// @desc    Get product by slug
// @route   GET /api/products/slug/:slug
// @access  Public
exports.getProductBySlug = async (req, res, next) => {
	try {
		const product = await Product.findOne({
			slug: req.params.slug,
			isActive: true,
		})
			.populate("category", "name slug")
			.populate("reviews.user", "name avatar");

		if (!product) {
			return res.status(404).json({
				success: false,
				message: "Không tìm thấy sản phẩm",
			});
		}

		res.status(200).json({
			success: true,
			data: product,
		});
	} catch (error) {
		next(error);
	}
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
exports.getFeaturedProducts = async (req, res, next) => {
	try {
		const limit = parseInt(req.query.limit, 10) || 8;

		const products = await Product.find({
			isFeatured: true,
			isActive: true,
		})
			.populate("category", "name slug")
			.limit(limit)
			.sort("-createdAt");

		res.status(200).json({
			success: true,
			count: products.length,
			data: products,
		});
	} catch (error) {
		next(error);
	}
};

// @desc    Get best selling products
// @route   GET /api/products/bestsellers
// @access  Public
exports.getBestSellers = async (req, res, next) => {
	try {
		const limit = parseInt(req.query.limit, 10) || 8;

		const products = await Product.find({ isActive: true })
			.populate("category", "name slug")
			.limit(limit)
			.sort("-sold");

		res.status(200).json({
			success: true,
			count: products.length,
			data: products,
		});
	} catch (error) {
		next(error);
	}
};

// @desc    Get related products
// @route   GET /api/products/:id/related
// @access  Public
exports.getRelatedProducts = async (req, res, next) => {
	try {
		const product = await Product.findById(req.params.id);
		const limit = parseInt(req.query.limit, 10) || 4;

		if (!product) {
			return res.status(404).json({
				success: false,
				message: "Không tìm thấy sản phẩm",
			});
		}

		const relatedProducts = await Product.find({
			_id: { $ne: product._id },
			category: product.category,
			isActive: true,
		})
			.populate("category", "name slug")
			.limit(limit);

		res.status(200).json({
			success: true,
			count: relatedProducts.length,
			data: relatedProducts,
		});
	} catch (error) {
		next(error);
	}
};

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res, next) => {
	try {
		const product = await Product.create(req.body);

		res.status(201).json({
			success: true,
			data: product,
		});
	} catch (error) {
		next(error);
	}
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res, next) => {
	try {
		let product = await Product.findById(req.params.id);

		if (!product) {
			return res.status(404).json({
				success: false,
				message: "Không tìm thấy sản phẩm",
			});
		}

		product = await Product.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});

		res.status(200).json({
			success: true,
			data: product,
		});
	} catch (error) {
		next(error);
	}
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res, next) => {
	try {
		const product = await Product.findById(req.params.id);

		if (!product) {
			return res.status(404).json({
				success: false,
				message: "Không tìm thấy sản phẩm",
			});
		}

		await product.deleteOne();

		res.status(200).json({
			success: true,
			message: "Đã xóa sản phẩm",
		});
	} catch (error) {
		next(error);
	}
};

// @desc    Add product review
// @route   POST /api/products/:id/reviews
// @access  Private
exports.addProductReview = async (req, res, next) => {
	try {
		const { rating, comment } = req.body;

		const product = await Product.findById(req.params.id);

		if (!product) {
			return res.status(404).json({
				success: false,
				message: "Không tìm thấy sản phẩm",
			});
		}

		// Check if user already reviewed
		const alreadyReviewed = product.reviews.find(
			(review) => review.user.toString() === req.user._id.toString(),
		);

		if (alreadyReviewed) {
			return res.status(400).json({
				success: false,
				message: "Bạn đã đánh giá sản phẩm này rồi",
			});
		}

		const review = {
			user: req.user._id,
			rating: Number(rating),
			comment,
		};

		product.reviews.push(review);
		product.ratings.count = product.reviews.length;
		product.ratings.average =
			product.reviews.reduce((acc, item) => item.rating + acc, 0) /
			product.reviews.length;

		await product.save();

		res.status(201).json({
			success: true,
			message: "Đã thêm đánh giá",
			data: product,
		});
	} catch (error) {
		next(error);
	}
};
