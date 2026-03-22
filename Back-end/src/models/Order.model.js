/** @format */

const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
	product: {
		type: mongoose.Schema.ObjectId,
		ref: "Product",
		required: true,
	},
	name: String,
	image: String,
	price: Number,
	quantity: {
		type: Number,
		required: true,
		min: [1, "Số lượng phải ít nhất là 1"],
	},
	flavor: String,
});

const orderSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.ObjectId,
			ref: "User",
			required: true,
		},
		orderItems: [orderItemSchema],
		shippingAddress: {
			name: {
				type: String,
				required: true,
			},
			phone: {
				type: String,
				required: true,
			},
			street: {
				type: String,
				required: true,
			},
			ward: String,
			district: {
				type: String,
				required: true,
			},
			city: {
				type: String,
				required: true,
			},
		},
		paymentMethod: {
			type: String,
			enum: ["cod", "banking", "momo", "zalopay", "vnpay"],
			default: "cod",
		},
		paymentStatus: {
			type: String,
			enum: ["pending", "paid", "failed", "refunded"],
			default: "pending",
		},
		itemsPrice: {
			type: Number,
			required: true,
			default: 0,
		},
		shippingPrice: {
			type: Number,
			required: true,
			default: 0,
		},
		discountPrice: {
			type: Number,
			default: 0,
		},
		totalPrice: {
			type: Number,
			required: true,
			default: 0,
		},
		orderStatus: {
			type: String,
			enum: [
				"pending",
				"confirmed",
				"processing",
				"shipping",
				"delivered",
				"cancelled",
			],
			default: "pending",
		},
		note: String,
		couponCode: String,
		paidAt: Date,
		deliveredAt: Date,
		cancelledAt: Date,
		cancelReason: String,
	},
	{
		timestamps: true,
	},
);

// Generate order number
orderSchema.pre("save", async function (next) {
	if (this.isNew) {
		const count = await mongoose.model("Order").countDocuments();
		this.orderNumber = `ORD${Date.now()}${count + 1}`;
	}
	next();
});

orderSchema.add({
	orderNumber: {
		type: String,
		unique: true,
	},
});

module.exports = mongoose.model("Order", orderSchema);
