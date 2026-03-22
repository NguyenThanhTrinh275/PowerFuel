/** @format */

import api from "./api";

const mapCartItem = (item) => {
	const product = item?.product || {};

	return {
		...item,
		id: item?._id,
		productId: product?._id,
		name: product?.name || "Sản phẩm",
		image: product?.mainImage
			? product.mainImage.startsWith("http")
				? product.mainImage
				: `/uploads/${product.mainImage}`
			: "",
	};
};

const mapCart = (cart) => {
	if (!cart) {
		return {
			items: [],
			totalItems: 0,
			totalPrice: 0,
		};
	}

	return {
		...cart,
		items: Array.isArray(cart.items) ? cart.items.map(mapCartItem) : [],
		totalItems: cart.totalItems || 0,
		totalPrice: cart.totalPrice || 0,
	};
};

const cartService = {
	getCart: async () => {
		const response = await api.get("/cart");
		return {
			...response.data,
			data: mapCart(response.data?.data),
		};
	},

	addToCart: async (payload) => {
		const response = await api.post("/cart", payload);
		return {
			...response.data,
			data: mapCart(response.data?.data),
		};
	},

	updateCartItem: async (itemId, quantity) => {
		const response = await api.put(`/cart/${itemId}`, { quantity });
		return {
			...response.data,
			data: mapCart(response.data?.data),
		};
	},

	removeCartItem: async (itemId) => {
		const response = await api.delete(`/cart/${itemId}`);
		return {
			...response.data,
			data: mapCart(response.data?.data),
		};
	},

	clearCart: async () => {
		const response = await api.delete("/cart");
		return {
			...response.data,
			data: mapCart(response.data?.data),
		};
	},
};

export default cartService;
