/** @format */

const mongoose = require("mongoose");
const slugify = require("slugify");

const productSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Vui lòng nhập tên sản phẩm"],
			trim: true,
			maxlength: [200, "Tên sản phẩm không được quá 200 ký tự"],
		},
		slug: String,
		description: {
			type: String,
			required: [true, "Vui lòng nhập mô tả sản phẩm"],
		},
		shortDescription: {
			type: String,
			maxlength: [500, "Mô tả ngắn không được quá 500 ký tự"],
		},
		price: {
			type: Number,
			required: [true, "Vui lòng nhập giá sản phẩm"],
			min: [0, "Giá không được âm"],
		},
		originalPrice: {
			type: Number,
			min: [0, "Giá gốc không được âm"],
		},
		discount: {
			type: Number,
			min: [0, "Giảm giá không được âm"],
			max: [100, "Giảm giá không được quá 100%"],
			default: 0,
		},
		category: {
			type: mongoose.Schema.ObjectId,
			ref: "Category",
			required: [true, "Vui lòng chọn danh mục"],
		},
		brand: {
			type: String,
			required: [true, "Vui lòng nhập thương hiệu"],
		},
		images: [
			{
				type: String,
			},
		],
		mainImage: {
			type: String,
			default: "default-product.png",
		},
		stock: {
			type: Number,
			required: [true, "Vui lòng nhập số lượng tồn kho"],
			min: [0, "Số lượng không được âm"],
			default: 0,
		},
		sold: {
			type: Number,
			default: 0,
		},
		weight: {
			type: String, // e.g., "2.27kg", "5lbs"
		},
		flavor: [
			{
				type: String, // e.g., "Chocolate", "Vanilla", "Strawberry"
			},
		],
		servings: {
			type: Number, // Số lần dùng
		},
		nutritionFacts: {
			calories: Number,
			protein: Number,
			carbs: Number,
			fat: Number,
			sugar: Number,
			fiber: Number,
		},
		ingredients: {
			type: String,
		},
		howToUse: {
			type: String,
		},
		ratings: {
			average: {
				type: Number,
				min: [0, "Rating không được âm"],
				max: [5, "Rating không được quá 5"],
				default: 0,
			},
			count: {
				type: Number,
				default: 0,
			},
		},
		reviews: [
			{
				user: {
					type: mongoose.Schema.ObjectId,
					ref: "User",
					required: true,
				},
				rating: {
					type: Number,
					required: true,
					min: 1,
					max: 5,
				},
				comment: {
					type: String,
					required: true,
				},
				createdAt: {
					type: Date,
					default: Date.now,
				},
			},
		],
		isFeatured: {
			type: Boolean,
			default: false,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		tags: [
			{
				type: String,
			},
		],
	},
	{
		timestamps: true,
	},
);

// Create slug from name
productSchema.pre("save", function (next) {
	this.slug = slugify(this.name, { lower: true, locale: "vi" });
	next();
});

// Calculate discount price
productSchema.virtual("discountedPrice").get(function () {
	if (this.discount > 0) {
		return Math.round(this.price * (1 - this.discount / 100));
	}
	return this.price;
});

// Index for search
productSchema.index({
	name: "text",
	description: "text",
	brand: "text",
	tags: "text",
});

module.exports = mongoose.model("Product", productSchema);
