/** @format */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Vui lòng nhập tên"],
			trim: true,
			maxlength: [50, "Tên không được quá 50 ký tự"],
		},
		email: {
			type: String,
			required: [true, "Vui lòng nhập email"],
			unique: true,
			lowercase: true,
			match: [
				/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
				"Email không hợp lệ",
			],
		},
		password: {
			type: String,
			required: [true, "Vui lòng nhập mật khẩu"],
			minlength: [6, "Mật khẩu phải có ít nhất 6 ký tự"],
			select: false,
		},
		phone: {
			type: String,
			maxlength: [15, "Số điện thoại không hợp lệ"],
		},
		address: {
			street: String,
			city: String,
			district: String,
			ward: String,
		},
		role: {
			type: String,
			enum: ["user", "admin"],
			default: "user",
		},
		avatar: {
			type: String,
			default: "default-avatar.png",
		},
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{
		timestamps: true,
	},
);

// Hash password before saving
userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) {
		next();
	}
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function () {
	return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRE,
	});
};

// Match password
userSchema.methods.matchPassword = async function (enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
