/** @format */

const mongoose = require("mongoose");
const slugify = require("slugify");

const categorySchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Vui lòng nhập tên danh mục"],
			unique: true,
			trim: true,
			maxlength: [50, "Tên danh mục không được quá 50 ký tự"],
		},
		slug: String,
		description: {
			type: String,
			maxlength: [500, "Mô tả không được quá 500 ký tự"],
		},
		image: {
			type: String,
			default: "default-category.png",
		},
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	},
);

// Create slug from name
categorySchema.pre("save", function (next) {
	this.slug = slugify(this.name, { lower: true, locale: "vi" });
	next();
});

// Reverse populate with products
categorySchema.virtual("products", {
	ref: "Product",
	localField: "_id",
	foreignField: "category",
	justOne: false,
});

module.exports = mongoose.model("Category", categorySchema);
