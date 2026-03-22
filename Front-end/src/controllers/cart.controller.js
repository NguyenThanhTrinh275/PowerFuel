/** @format */

const Cart = require("../models/Cart.model");
const Product = require("../models/Product.model");

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res, next) => {
	try {
		let cart = await Cart.findOne({ user: req.user._id }).populate(
			"items.product",
			"name slug mainImage price discount stock",
		);

		if (!cart) {
			cart = await Cart.create({ user: req.user._id, items: [] });
		}

		res.status(200).json({
			success: true,
			data: cart,
		});
	} catch (error) {
		next(error);
	}
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
exports.addToCart = async (req, res, next) => {
	try {
		const { productId, quantity, flavor } = req.body;

		// Get product
		const product = await Product.findById(productId);

		if (!product) {
			return res.status(404).json({
				success: false,
				message: "Không tìm thấy sản phẩm",
			});
		}

		if (!product.isActive) {
			return res.status(400).json({
				success: false,
				message: "Sản phẩm không còn bán",
			});
		}

		if (product.stock < quantity) {
			return res.status(400).json({
				success: false,
				message: "Sản phẩm không đủ số lượng trong kho",
			});
		}

		// Calculate price
		const price =
			product.discount > 0
				? Math.round(product.price * (1 - product.discount / 100))
				: product.price;

		// Find or create cart
		let cart = await Cart.findOne({ user: req.user._id });

		if (!cart) {
			cart = new Cart({ user: req.user._id, items: [] });
		}

		// Check if item already exists
		const existingItemIndex = cart.items.findIndex(
			(item) =>
				item.product.toString() === productId && item.flavor === flavor,
		);

		if (existingItemIndex > -1) {
			// Update quantity
			const newQuantity =
				cart.items[existingItemIndex].quantity + quantity;

			if (newQuantity > product.stock) {
				return res.status(400).json({
					success: false,
					message: "Số lượng vượt quá tồn kho",
				});
			}

			cart.items[existingItemIndex].quantity = newQuantity;
			cart.items[existingItemIndex].price = price;
		} else {
			// Add new item
			cart.items.push({
				product: productId,
				quantity,
				flavor,
				price,
			});
		}

		await cart.save();

		// Populate and return
		cart = await Cart.findById(cart._id).populate(
			"items.product",
			"name slug mainImage price discount stock",
		);

		res.status(200).json({
			success: true,
			data: cart,
		});
	} catch (error) {
		next(error);
	}
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
exports.updateCartItem = async (req, res, next) => {
	try {
		const { quantity } = req.body;

		let cart = await Cart.findOne({ user: req.user._id });

		if (!cart) {
			return res.status(404).json({
				success: false,
				message: "Giỏ hàng trống",
			});
		}

		const itemIndex = cart.items.findIndex(
			(item) => item._id.toString() === req.params.itemId,
		);

		if (itemIndex === -1) {
			return res.status(404).json({
				success: false,
				message: "Không tìm thấy sản phẩm trong giỏ hàng",
			});
		}

		// Check stock
		const product = await Product.findById(cart.items[itemIndex].product);

		if (!product) {
			// Remove item if product no longer exists
			cart.items.splice(itemIndex, 1);
			await cart.save();
			return res.status(400).json({
				success: false,
				message: "Sản phẩm không còn tồn tại",
			});
		}

		if (quantity > product.stock) {
			return res.status(400).json({
				success: false,
				message: "Số lượng vượt quá tồn kho",
			});
		}

		if (quantity <= 0) {
			// Remove item
			cart.items.splice(itemIndex, 1);
		} else {
			cart.items[itemIndex].quantity = quantity;
		}

		await cart.save();

		cart = await Cart.findById(cart._id).populate(
			"items.product",
			"name slug mainImage price discount stock",
		);

		res.status(200).json({
			success: true,
			data: cart,
		});
	} catch (error) {
		next(error);
	}
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
exports.removeFromCart = async (req, res, next) => {
	try {
		let cart = await Cart.findOne({ user: req.user._id });

		if (!cart) {
			return res.status(404).json({
				success: false,
				message: "Giỏ hàng trống",
			});
		}

		const itemIndex = cart.items.findIndex(
			(item) => item._id.toString() === req.params.itemId,
		);

		if (itemIndex === -1) {
			return res.status(404).json({
				success: false,
				message: "Không tìm thấy sản phẩm trong giỏ hàng",
			});
		}

		cart.items.splice(itemIndex, 1);
		await cart.save();

		cart = await Cart.findById(cart._id).populate(
			"items.product",
			"name slug mainImage price discount stock",
		);

		res.status(200).json({
			success: true,
			data: cart,
		});
	} catch (error) {
		next(error);
	}
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = async (req, res, next) => {
	try {
		let cart = await Cart.findOne({ user: req.user._id });

		if (cart) {
			cart.items = [];
			await cart.save();
		}

		res.status(200).json({
			success: true,
			message: "Đã xóa giỏ hàng",
			data: cart,
		});
	} catch (error) {
		next(error);
	}
};
