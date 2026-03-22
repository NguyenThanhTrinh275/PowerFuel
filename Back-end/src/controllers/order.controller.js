/** @format */

const Order = require("../models/Order.model");
const Product = require("../models/Product.model");
const Cart = require("../models/Cart.model");

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
exports.getOrders = async (req, res, next) => {
	try {
		const page = parseInt(req.query.page, 10) || 1;
		const limit = parseInt(req.query.limit, 10) || 20;
		const startIndex = (page - 1) * limit;

		let query = {};

		// Filter by status
		if (req.query.status) {
			query.orderStatus = req.query.status;
		}

		// Filter by payment status
		if (req.query.paymentStatus) {
			query.paymentStatus = req.query.paymentStatus;
		}

		const total = await Order.countDocuments(query);
		const orders = await Order.find(query)
			.populate("user", "name email phone")
			.skip(startIndex)
			.limit(limit)
			.sort("-createdAt");

		res.status(200).json({
			success: true,
			count: orders.length,
			total,
			totalPages: Math.ceil(total / limit),
			currentPage: page,
			data: orders,
		});
	} catch (error) {
		next(error);
	}
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = async (req, res, next) => {
	try {
		const page = parseInt(req.query.page, 10) || 1;
		const limit = parseInt(req.query.limit, 10) || 10;
		const startIndex = (page - 1) * limit;

		const query = { user: req.user._id };

		const total = await Order.countDocuments(query);
		const orders = await Order.find(query)
			.skip(startIndex)
			.limit(limit)
			.sort("-createdAt");

		res.status(200).json({
			success: true,
			count: orders.length,
			total,
			totalPages: Math.ceil(total / limit),
			currentPage: page,
			data: orders,
		});
	} catch (error) {
		next(error);
	}
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res, next) => {
	try {
		const order = await Order.findById(req.params.id)
			.populate("user", "name email phone")
			.populate("orderItems.product", "name slug mainImage");

		if (!order) {
			return res.status(404).json({
				success: false,
				message: "Không tìm thấy đơn hàng",
			});
		}

		// Make sure user is order owner or admin
		if (
			order.user._id.toString() !== req.user._id.toString() &&
			req.user.role !== "admin"
		) {
			return res.status(403).json({
				success: false,
				message: "Bạn không có quyền xem đơn hàng này",
			});
		}

		res.status(200).json({
			success: true,
			data: order,
		});
	} catch (error) {
		next(error);
	}
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
	try {
		const {
			orderItems,
			shippingAddress,
			paymentMethod,
			itemsPrice,
			shippingPrice,
			discountPrice,
			totalPrice,
			note,
			couponCode,
		} = req.body;

		if (!orderItems || orderItems.length === 0) {
			return res.status(400).json({
				success: false,
				message: "Không có sản phẩm trong đơn hàng",
			});
		}

		// Verify stock and get product details
		const orderItemsWithDetails = [];
		for (const item of orderItems) {
			const product = await Product.findById(item.product);

			if (!product) {
				return res.status(404).json({
					success: false,
					message: `Không tìm thấy sản phẩm`,
				});
			}

			if (product.stock < item.quantity) {
				return res.status(400).json({
					success: false,
					message: `Sản phẩm ${product.name} không đủ số lượng trong kho`,
				});
			}

			orderItemsWithDetails.push({
				product: product._id,
				name: product.name,
				image: product.mainImage,
				price:
					product.discount > 0
						? Math.round(
								product.price * (1 - product.discount / 100),
							)
						: product.price,
				quantity: item.quantity,
				flavor: item.flavor,
			});

			// Update stock
			product.stock -= item.quantity;
			product.sold += item.quantity;
			await product.save();
		}

		const order = await Order.create({
			user: req.user._id,
			orderItems: orderItemsWithDetails,
			shippingAddress,
			paymentMethod,
			itemsPrice,
			shippingPrice,
			discountPrice: discountPrice || 0,
			totalPrice,
			note,
			couponCode,
		});

		// Clear user's cart
		await Cart.findOneAndDelete({ user: req.user._id });

		res.status(201).json({
			success: true,
			data: order,
		});
	} catch (error) {
		next(error);
	}
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res, next) => {
	try {
		const order = await Order.findById(req.params.id);

		if (!order) {
			return res.status(404).json({
				success: false,
				message: "Không tìm thấy đơn hàng",
			});
		}

		const { orderStatus } = req.body;

		// Validate status transition
		const validTransitions = {
			pending: ["confirmed", "cancelled"],
			confirmed: ["processing", "cancelled"],
			processing: ["shipping", "cancelled"],
			shipping: ["delivered"],
			delivered: [],
			cancelled: [],
		};

		if (!validTransitions[order.orderStatus].includes(orderStatus)) {
			return res.status(400).json({
				success: false,
				message: "Không thể chuyển sang trạng thái này",
			});
		}

		order.orderStatus = orderStatus;

		if (orderStatus === "delivered") {
			order.deliveredAt = Date.now();
			order.paymentStatus = "paid";
			order.paidAt = Date.now();
		}

		if (orderStatus === "cancelled") {
			order.cancelledAt = Date.now();
			order.cancelReason = req.body.cancelReason || "";

			// Restore stock
			for (const item of order.orderItems) {
				const product = await Product.findById(item.product);
				if (product) {
					product.stock += item.quantity;
					product.sold -= item.quantity;
					await product.save();
				}
			}
		}

		await order.save();

		res.status(200).json({
			success: true,
			data: order,
		});
	} catch (error) {
		next(error);
	}
};

// @desc    Update payment status
// @route   PUT /api/orders/:id/pay
// @access  Private/Admin
exports.updatePaymentStatus = async (req, res, next) => {
	try {
		const order = await Order.findById(req.params.id);

		if (!order) {
			return res.status(404).json({
				success: false,
				message: "Không tìm thấy đơn hàng",
			});
		}

		order.paymentStatus = req.body.paymentStatus;
		if (req.body.paymentStatus === "paid") {
			order.paidAt = Date.now();
		}

		await order.save();

		res.status(200).json({
			success: true,
			data: order,
		});
	} catch (error) {
		next(error);
	}
};

// @desc    Cancel order (User)
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res, next) => {
	try {
		const order = await Order.findById(req.params.id);

		if (!order) {
			return res.status(404).json({
				success: false,
				message: "Không tìm thấy đơn hàng",
			});
		}

		// Check ownership
		if (order.user.toString() !== req.user._id.toString()) {
			return res.status(403).json({
				success: false,
				message: "Bạn không có quyền hủy đơn hàng này",
			});
		}

		// Only can cancel pending or confirmed orders
		if (!["pending", "confirmed"].includes(order.orderStatus)) {
			return res.status(400).json({
				success: false,
				message: "Không thể hủy đơn hàng ở trạng thái này",
			});
		}

		order.orderStatus = "cancelled";
		order.cancelledAt = Date.now();
		order.cancelReason = req.body.cancelReason || "Khách hàng yêu cầu hủy";

		// Restore stock
		for (const item of order.orderItems) {
			const product = await Product.findById(item.product);
			if (product) {
				product.stock += item.quantity;
				product.sold -= item.quantity;
				await product.save();
			}
		}

		await order.save();

		res.status(200).json({
			success: true,
			message: "Đã hủy đơn hàng",
			data: order,
		});
	} catch (error) {
		next(error);
	}
};

// @desc    Get order statistics (Admin)
// @route   GET /api/orders/stats
// @access  Private/Admin
exports.getOrderStats = async (req, res, next) => {
	try {
		const totalOrders = await Order.countDocuments();
		const pendingOrders = await Order.countDocuments({
			orderStatus: "pending",
		});
		const deliveredOrders = await Order.countDocuments({
			orderStatus: "delivered",
		});
		const cancelledOrders = await Order.countDocuments({
			orderStatus: "cancelled",
		});

		const revenue = await Order.aggregate([
			{ $match: { orderStatus: "delivered" } },
			{ $group: { _id: null, total: { $sum: "$totalPrice" } } },
		]);

		res.status(200).json({
			success: true,
			data: {
				totalOrders,
				pendingOrders,
				deliveredOrders,
				cancelledOrders,
				totalRevenue: revenue[0]?.total || 0,
			},
		});
	} catch (error) {
		next(error);
	}
};
