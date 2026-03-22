/** @format */

const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
	product: {
		type: mongoose.Schema.ObjectId,
		ref: "Product",
		required: true,
	},
	quantity: {
		type: Number,
		required: true,
		min: [1, "Số lượng phải ít nhất là 1"],
		default: 1,
	},
	flavor: String,
	price: Number,
});

const cartSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.ObjectId,
			ref: "User",
			required: true,
			unique: true,
		},
		items: [cartItemSchema],
		totalItems: {
			type: Number,
			default: 0,
		},
		totalPrice: {
			type: Number,
			default: 0,
		},
	},
	{
		timestamps: true,
	},
);

// Calculate totals before saving
cartSchema.pre("save", function (next) {
	this.totalItems = this.items.reduce((acc, item) => acc + item.quantity, 0);
	this.totalPrice = this.items.reduce(
		(acc, item) => acc + item.price * item.quantity,
		0,
	);
	next();
});

module.exports = mongoose.model("Cart", cartSchema);
