/** @format */

const User = require("../models/User.model");

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
	try {
		const { name, email, password, phone } = req.body;

		// Check if user exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({
				success: false,
				message: "Email đã được sử dụng",
			});
		}

		// Create user
		const user = await User.create({
			name,
			email,
			password,
			phone,
		});

		sendTokenResponse(user, 201, res);
	} catch (error) {
		next(error);
	}
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
	try {
		const { email, password } = req.body;

		// Validate email & password
		if (!email || !password) {
			return res.status(400).json({
				success: false,
				message: "Vui lòng nhập email và mật khẩu",
			});
		}

		// Check for user
		const user = await User.findOne({ email }).select("+password");

		if (!user) {
			return res.status(401).json({
				success: false,
				message: "Email hoặc mật khẩu không đúng",
			});
		}

		// Check if password matches
		const isMatch = await user.matchPassword(password);

		if (!isMatch) {
			return res.status(401).json({
				success: false,
				message: "Email hoặc mật khẩu không đúng",
			});
		}

		// Check if user is active
		if (!user.isActive) {
			return res.status(401).json({
				success: false,
				message: "Tài khoản đã bị khóa",
			});
		}

		sendTokenResponse(user, 200, res);
	} catch (error) {
		next(error);
	}
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
	try {
		const user = await User.findById(req.user.id);

		res.status(200).json({
			success: true,
			data: user,
		});
	} catch (error) {
		next(error);
	}
};

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res, next) => {
	try {
		const fieldsToUpdate = {
			name: req.body.name,
			phone: req.body.phone,
			address: req.body.address,
		};

		// Remove undefined fields
		Object.keys(fieldsToUpdate).forEach(
			(key) =>
				fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key],
		);

		const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
			new: true,
			runValidators: true,
		});

		res.status(200).json({
			success: true,
			data: user,
		});
	} catch (error) {
		next(error);
	}
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res, next) => {
	try {
		const user = await User.findById(req.user.id).select("+password");

		// Check current password
		if (!(await user.matchPassword(req.body.currentPassword))) {
			return res.status(401).json({
				success: false,
				message: "Mật khẩu hiện tại không đúng",
			});
		}

		user.password = req.body.newPassword;
		await user.save();

		sendTokenResponse(user, 200, res);
	} catch (error) {
		next(error);
	}
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
	const token = user.getSignedJwtToken();

	res.status(statusCode).json({
		success: true,
		token,
		data: {
			id: user._id,
			name: user.name,
			email: user.email,
			role: user.role,
			phone: user.phone,
			address: user.address,
			avatar: user.avatar,
		},
	});
};
