/** @format */

import api from "./api";

const orderService = {
	getMyOrders: async (params = {}) => {
		const response = await api.get("/orders/myorders", { params });
		return response.data;
	},

	getOrders: async (params = {}) => {
		const response = await api.get("/orders", { params });
		return response.data;
	},

	getOrderById: async (id) => {
		const response = await api.get(`/orders/${id}`);
		return response.data;
	},

	createOrder: async (payload) => {
		const response = await api.post("/orders", payload);
		return response.data;
	},

	cancelOrder: async (id, cancelReason) => {
		const response = await api.put(`/orders/${id}/cancel`, {
			cancelReason,
		});
		return response.data;
	},

	getOrderStats: async () => {
		const response = await api.get("/orders/admin/stats");
		return response.data;
	},

	updateOrderStatus: async (id, orderStatus, cancelReason = "") => {
		const response = await api.put(`/orders/${id}/status`, {
			orderStatus,
			cancelReason,
		});
		return response.data;
	},

	updatePaymentStatus: async (id, paymentStatus) => {
		const response = await api.put(`/orders/${id}/pay`, { paymentStatus });
		return response.data;
	},
};

export default orderService;
