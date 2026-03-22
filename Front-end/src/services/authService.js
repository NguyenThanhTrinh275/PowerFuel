/** @format */

import api from "./api";

const TOKEN_KEY = "token";
const USER_KEY = "user";

const notifyAuthChanged = () => {
	window.dispatchEvent(new Event("auth-changed"));
};

const persistAuth = ({ token, data }) => {
	if (token) {
		localStorage.setItem(TOKEN_KEY, token);
	}
	if (data) {
		localStorage.setItem(USER_KEY, JSON.stringify(data));
	}
	notifyAuthChanged();
};

const authService = {
	login: async (payload) => {
		const response = await api.post("/auth/login", payload);
		persistAuth(response.data);
		return response.data;
	},

	register: async (payload) => {
		const response = await api.post("/auth/register", payload);
		persistAuth(response.data);
		return response.data;
	},

	getMe: async () => {
		const response = await api.get("/auth/me");
		if (response.data?.data) {
			localStorage.setItem(USER_KEY, JSON.stringify(response.data.data));
			notifyAuthChanged();
		}
		return response.data;
	},

	updateDetails: async (payload) => {
		const response = await api.put("/auth/updatedetails", payload);
		if (response.data?.data) {
			localStorage.setItem(USER_KEY, JSON.stringify(response.data.data));
			notifyAuthChanged();
		}
		return response.data;
	},

	updatePassword: async (payload) => {
		const response = await api.put("/auth/updatepassword", payload);
		if (response.data?.token) {
			localStorage.setItem(TOKEN_KEY, response.data.token);
			notifyAuthChanged();
		}
		return response.data;
	},

	logout: () => {
		localStorage.removeItem(TOKEN_KEY);
		localStorage.removeItem(USER_KEY);
		notifyAuthChanged();
	},

	getToken: () => localStorage.getItem(TOKEN_KEY),

	getStoredUser: () => {
		const raw = localStorage.getItem(USER_KEY);
		if (!raw) return null;
		try {
			return JSON.parse(raw);
		} catch {
			return null;
		}
	},

	isAuthenticated: () => Boolean(localStorage.getItem(TOKEN_KEY)),
};

export default authService;
