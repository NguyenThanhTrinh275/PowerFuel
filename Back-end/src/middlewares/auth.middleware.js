/** @format */

const jwt = require("jsonwebtoken");
const User = require("../models/User.model");

// Protect routes
exports.protect = async (req, res, next) => {
	let token;

	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer")
	) {
		token = req.headers.authorization.split(" ")[1];
	}

	if (!token) {
		return res.status(401).json({
			success: false,
			message: "Vui lòng đăng nhập để truy cập",
		});
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.user = await User.findById(decoded.id);

		if (!req.user) {
			return res.status(401).json({
				success: false,
				message: "Người dùng không tồn tại",
			});
		}

		if (!req.user.isActive) {
			return res.status(401).json({
				success: false,
				message: "Tài khoản đã bị khóa",
			});
		}

		next();
	} catch (error) {
		return res.status(401).json({
			success: false,
			message: "Token không hợp lệ",
		});
	}
};

// Grant access to specific roles
exports.authorize = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			return res.status(403).json({
				success: false,
				message: "Bạn không có quyền thực hiện hành động này",
			});
		}
		next();
	};
};
