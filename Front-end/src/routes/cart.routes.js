/** @format */

const express = require("express");
const router = express.Router();
const {
	getCart,
	addToCart,
	updateCartItem,
	removeFromCart,
	clearCart,
} = require("../controllers/cart.controller");
const { protect } = require("../middlewares/auth.middleware");

// All routes require authentication
router.use(protect);

router.route("/").get(getCart).post(addToCart).delete(clearCart);

router.route("/:itemId").put(updateCartItem).delete(removeFromCart);

module.exports = router;
