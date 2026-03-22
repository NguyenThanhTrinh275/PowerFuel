/** @format */

const User = require("../models/User.model");

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
	try {
		const page = parseInt(req.query.page, 10) || 1;
		const limit = parseInt(req.query.limit, 10) || 10;
		const startIndex = (page - 1) * limit;

		const total = await User.countDocuments();
		const users = await User.find()
			.skip(startIndex)
			.limit(limit)
			.sort("-createdAt");

		res.status(200).json({
			success: true,
			count: users.length,
			total,
			totalPages: Math.ceil(total / limit),
			currentPage: page,
			data: users,
		});
	} catch (error) {
		next(error);
	}
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res, next) => {
	try {
		const user = await User.findById(req.params.id);

		if (!user) {
			return res.status(404).json({
				success: false,
				message: "Không tìm thấy người dùng",
			});
		}

		res.status(200).json({
			success: true,
			data: user,
		});
	} catch (error) {
		next(error);
	}
};

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res, next) => {
	try {
		const user = await User.create(req.body);

		res.status(201).json({
			success: true,
			data: user,
		});
	} catch (error) {
		next(error);
	}
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
	try {
		// Don't allow password update through this route
		if (req.body.password) {
			delete req.body.password;
		}

		const user = await User.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});

		if (!user) {
			return res.status(404).json({
				success: false,
				message: "Không tìm thấy người dùng",
			});
		}

		res.status(200).json({
			success: true,
			data: user,
		});
	} catch (error) {
		next(error);
	}
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
	try {
		const user = await User.findById(req.params.id);

		if (!user) {
			return res.status(404).json({
				success: false,
				message: "Không tìm thấy người dùng",
			});
		}

		await user.deleteOne();

		res.status(200).json({
			success: true,
			message: "Đã xóa người dùng",
		});
	} catch (error) {
		next(error);
	}
};

// @desc    Toggle user status (active/inactive)
// @route   PUT /api/users/:id/toggle-status
// @access  Private/Admin
exports.toggleUserStatus = async (req, res, next) => {
	try {
		const user = await User.findById(req.params.id);

		if (!user) {
			return res.status(404).json({
				success: false,
				message: "Không tìm thấy người dùng",
			});
		}

		user.isActive = !user.isActive;
		await user.save();

		res.status(200).json({
			success: true,
			data: user,
		});
	} catch (error) {
		next(error);
	}
};
