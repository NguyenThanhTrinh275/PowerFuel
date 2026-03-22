/** @format */

import { useState, useEffect, useCallback } from "react";
import productService from "../services/productService";

export const useProducts = (initialFilters = {}) => {
	const [products, setProducts] = useState([]);
	const [categories, setCategories] = useState([]);
	const [brands, setBrands] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [pagination, setPagination] = useState({
		page: 1,
		limit: 12,
		total: 0,
		totalPages: 0,
	});

	const fetchProducts = useCallback(async (filters = {}) => {
		try {
			setLoading(true);
			setError(null);
			const response = await productService.getProducts(filters);

			setProducts(response.data || []);
			if (response.pagination) {
				setPagination(response.pagination);
			}
		} catch (err) {
			setError(err.message || "Có lỗi xảy ra khi tải sản phẩm");
			console.error("Error fetching products:", err);
		} finally {
			setLoading(false);
		}
	}, []);

	const fetchCategories = useCallback(async () => {
		try {
			const response = await productService.getCategories();
			setCategories(response.data || response);
		} catch (err) {
			console.error("Error fetching categories:", err);
		}
	}, []);

	const fetchBrands = useCallback(async () => {
		try {
			const response = await productService.getBrands();
			setBrands(response.data || response);
		} catch (err) {
			console.error("Error fetching brands:", err);
		}
	}, []);

	useEffect(() => {
		fetchProducts(initialFilters);
		fetchCategories();
		fetchBrands();
		// initialFilters should be stable from caller side.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fetchProducts, fetchCategories, fetchBrands]);

	return {
		products,
		categories,
		brands,
		loading,
		error,
		pagination,
		fetchProducts,
		refetch: () => fetchProducts(initialFilters),
	};
};

export const useProduct = (id) => {
	const [product, setProduct] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchProduct = async () => {
			if (!id) return;

			try {
				setLoading(true);
				const response = await productService.getProductById(id);
				setProduct(response.data || response);
			} catch (err) {
				setError(err.message || "Có lỗi xảy ra");
				console.error("Error fetching product:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchProduct();
	}, [id]);

	return { product, loading, error };
};

export default useProducts;
