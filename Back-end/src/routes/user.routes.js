/** @format */

const express = require("express");
const router = express.Router();
const {
	getUsers,
	getUser,
	createUser,
	updateUser,
	deleteUser,
	toggleUserStatus,
} = require("../controllers/user.controller");
const { protect, authorize } = require("../middlewares/auth.middleware");

// All routes require admin
router.use(protect);
router.use(authorize("admin"));

router.route("/").get(getUsers).post(createUser);

router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);

router.put("/:id/toggle-status", toggleUserStatus);

module.exports = router;
