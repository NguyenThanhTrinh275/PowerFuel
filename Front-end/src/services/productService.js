/** @format */

import api, { API_ORIGIN } from "./api";

const toImageUrl = (image) => {
	if (!image) return "";
	if (image.startsWith("http://") || image.startsWith("https://")) {
		return image;
	}
	if (image.startsWith("/uploads/")) {
		return `${API_ORIGIN}${image}`;
	}
	return `${API_ORIGIN}/uploads/${image}`;
};

const normalizeProduct = (product) => {
	if (!product) return product;

	const ratingValue = Number(
		product?.ratings?.average ?? product.rating ?? 0,
	);
	const rating = Math.max(0, Math.min(5, Math.round(ratingValue)));

	return {
		...product,
		id: product._id || product.id,
		image: product.image || toImageUrl(product.mainImage),
		originalPrice: product.originalPrice || null,
		rating,
		reviewCount: product?.ratings?.count ?? product.reviewCount ?? 0,
		category: product?.category?._id || product.category,
		categoryName: product?.category?.name || "",
	};
};

const normalizeProductListResponse = (payload) => {
	const data = Array.isArray(payload?.data)
		? payload.data.map(normalizeProduct)
		: [];

	return {
		...payload,
		data,
		pagination: {
			page: payload?.currentPage || 1,
			limit: payload?.limit || data.length,
			total: payload?.total || data.length,
			totalPages: payload?.totalPages || 1,
		},
	};
};

const mapSortToApi = (sortBy) => {
	switch (sortBy) {
		case "price-low":
			return "price_asc";
		case "price-high":
			return "price_desc";
		case "newest":
			return "newest";
		case "rating":
			return "rating";
		case "popular":
		default:
			return "sold";
	}
};

const productService = {
	// Lấy tất cả sản phẩm với filters
	getProducts: async (params = {}) => {
		const query = { ...params };

		if (query.sortBy) {
			query.sort = mapSortToApi(query.sortBy);
			delete query.sortBy;
		}

		if (Array.isArray(query.brand)) {
			query.brand = query.brand.join(",");
		}

		const response = await api.get("/products", { params: query });
		return normalizeProductListResponse(response.data);
	},

	// Lấy sản phẩm theo ID
	getProductById: async (id) => {
		const response = await api.get(`/products/${id}`);
		return {
			...response.data,
			data: normalizeProduct(response.data?.data),
		};
	},

	// Lấy danh mục
	getCategories: async () => {
		const response = await api.get("/categories");
		const categories = Array.isArray(response.data?.data)
			? response.data.data.map((category) => ({
					...category,
					id: category._id,
				}))
			: [];

		return {
			...response.data,
			data: categories,
		};
	},

	// Lấy thương hiệu
	getBrands: async () => {
		const response = await api.get("/products/brands");
		return response.data;
	},

	// Tìm kiếm sản phẩm
	searchProducts: async (query) => {
		return productService.getProducts({ search: query });
	},

	// Lấy sản phẩm theo danh mục
	getProductsByCategory: async (categoryId, params = {}) => {
		return productService.getProducts({ ...params, category: categoryId });
	},

	// Lấy sản phẩm nổi bật
	getFeaturedProducts: async () => {
		const response = await api.get("/products/featured");
		return {
			...response.data,
			data: Array.isArray(response.data?.data)
				? response.data.data.map(normalizeProduct)
				: [],
		};
	},

	// Lấy sản phẩm bán chạy
	getBestSellerProducts: async () => {
		const response = await api.get("/products/bestsellers");
		return {
			...response.data,
			data: Array.isArray(response.data?.data)
				? response.data.data.map(normalizeProduct)
				: [],
		};
	},

	getAdminProducts: async (params = {}) => {
		const response = await api.get("/products/admin/all", { params });
		return normalizeProductListResponse(response.data);
	},

	createProduct: async (payload) => {
		const response = await api.post("/products", payload);
		return response.data;
	},

	updateProduct: async (id, payload) => {
		const response = await api.put(`/products/${id}`, payload);
		return response.data;
	},

	deleteProduct: async (id) => {
		const response = await api.delete(`/products/${id}`);
		return response.data;
	},
};

export default productService;
