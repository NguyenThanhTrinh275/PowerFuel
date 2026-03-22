/** @format */

import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
	Filter,
	ChevronDown,
	SlidersHorizontal,
	X,
	Loader,
} from "lucide-react";
import ProductCard from "../../components/product/ProductCard";
import { useProducts } from "../../hooks/useProducts";
import "./Products.css";

// Default categories (fallback nếu API chưa có)
const defaultCategories = [
	{ id: "all", name: "Tất cả" },
	{ id: "whey", name: "Whey Protein" },
	{ id: "mass", name: "Mass Gainer" },
	{ id: "bcaa", name: "BCAA & Amino" },
	{ id: "creatine", name: "Creatine" },
	{ id: "pre-workout", name: "Pre-Workout" },
	{ id: "vitamin", name: "Vitamin" },
];

const Products = () => {
	const [searchParams] = useSearchParams();
	const categoryParam = searchParams.get("category") || "all";

	const [selectedCategory, setSelectedCategory] = useState(categoryParam);
	const [selectedBrands, setSelectedBrands] = useState([]);
	const [priceRange, setPriceRange] = useState([0, 3000000]);
	const [sortBy, setSortBy] = useState("popular");
	const [showFilters, setShowFilters] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);

	// Sử dụng custom hook để fetch data
	const {
		products,
		categories: apiCategories,
		brands: apiBrands,
		loading,
		error,
		pagination,
		fetchProducts,
	} = useProducts();

	// Sử dụng categories từ API hoặc fallback
	const categories =
		apiCategories.length > 0
			? [{ id: "all", name: "Tất cả" }, ...apiCategories]
			: defaultCategories;

	// Sử dụng brands từ API
	const brands =
		apiBrands.length > 0
			? apiBrands.map((b) => (typeof b === "string" ? b : b.name))
			: [];

	// Fetch products khi filters thay đổi
	useEffect(() => {
		const filters = {
			page: currentPage,
			limit: 12,
			sortBy,
		};

		if (selectedCategory !== "all") {
			filters.category = selectedCategory;
		}

		if (selectedBrands.length > 0) {
			filters.brand = selectedBrands;
		}

		if (priceRange[0] > 0) {
			filters.minPrice = priceRange[0];
		}

		if (priceRange[1] < 3000000) {
			filters.maxPrice = priceRange[1];
		}

		const search = searchParams.get("search");
		if (search) {
			filters.search = search;
		}

		fetchProducts(filters);
	}, [
		selectedCategory,
		selectedBrands,
		priceRange,
		sortBy,
		currentPage,
		searchParams,
		fetchProducts,
	]);

	// Dữ liệu đã được filter/sort chính ở server; giữ fallback nhẹ ở client.
	const filteredProducts = useMemo(() => {
		return products.filter((product) => {
			if (product.price < priceRange[0] || product.price > priceRange[1])
				return false;
			return true;
		});
	}, [products, priceRange]);

	// Sort products
	const sortedProducts = useMemo(() => filteredProducts, [filteredProducts]);

	const handleBrandToggle = (brand) => {
		setSelectedBrands((prev) =>
			prev.includes(brand)
				? prev.filter((b) => b !== brand)
				: [...prev, brand],
		);
		setCurrentPage(1);
	};

	const handleCategoryChange = (categoryId) => {
		setSelectedCategory(categoryId);
		setCurrentPage(1);
	};

	const handleClearFilters = () => {
		setSelectedCategory("all");
		setSelectedBrands([]);
		setPriceRange([0, 3000000]);
		setCurrentPage(1);
	};

	const formatPrice = (value) => {
		return new Intl.NumberFormat("vi-VN").format(value) + "đ";
	};

	// Tính toán pagination
	const totalPages =
		pagination.totalPages || Math.ceil(sortedProducts.length / 12);

	return (
		<div className="products-page">
			{/* Page Header */}
			<div className="page-header">
				<div className="page-header-content">
					<h1>Sản phẩm</h1>
					<div className="breadcrumb">
						<Link to="/">Trang chủ</Link>
						<span>/</span>
						<span>Sản phẩm</span>
					</div>
				</div>
			</div>

			<div className="products-container">
				{/* Filters Sidebar */}
				<aside
					className={`filters-sidebar ${showFilters ? "active" : ""}`}
				>
					<div className="filters-header">
						<h3>
							<SlidersHorizontal size={20} /> Bộ lọc
						</h3>
						<button
							className="close-filters"
							onClick={() => setShowFilters(false)}
						>
							<X size={24} />
						</button>
					</div>

					{/* Categories */}
					<div className="filter-section">
						<h4>Danh mục</h4>
						<div className="filter-options">
							{categories.map((cat) => (
								<button
									key={cat.id}
									className={`filter-option ${
										selectedCategory === cat.id
											? "active"
											: ""
									}`}
									onClick={() => handleCategoryChange(cat.id)}
								>
									{cat.name}
								</button>
							))}
						</div>
					</div>

					{/* Brands */}
					{brands.length > 0 && (
						<div className="filter-section">
							<h4>Thương hiệu</h4>
							<div className="filter-checkboxes">
								{brands.map((brand) => (
									<label
										key={brand}
										className="filter-checkbox"
									>
										<input
											type="checkbox"
											checked={selectedBrands.includes(
												brand,
											)}
											onChange={() =>
												handleBrandToggle(brand)
											}
										/>
										<span>{brand}</span>
									</label>
								))}
							</div>
						</div>
					)}

					{/* Price Range */}
					<div className="filter-section">
						<h4>Khoảng giá</h4>
						<div className="price-range">
							<input
								type="range"
								min="0"
								max="3000000"
								step="100000"
								value={priceRange[1]}
								onChange={(e) =>
									setPriceRange([
										priceRange[0],
										parseInt(e.target.value),
									])
								}
							/>
							<div className="price-labels">
								<span>{formatPrice(priceRange[0])}</span>
								<span>{formatPrice(priceRange[1])}</span>
							</div>
						</div>
					</div>

					<button
						className="clear-filters"
						onClick={handleClearFilters}
					>
						Xóa bộ lọc
					</button>
				</aside>

				{/* Products Grid */}
				<main className="products-main">
					{/* Toolbar */}
					<div className="products-toolbar">
						<button
							className="filter-toggle"
							onClick={() => setShowFilters(true)}
						>
							<Filter size={20} />
							Bộ lọc
						</button>

						<div className="products-count">
							Hiển thị <strong>{sortedProducts.length}</strong>{" "}
							sản phẩm
						</div>

						<div className="toolbar-right">
							<div className="sort-dropdown">
								<select
									value={sortBy}
									onChange={(e) => setSortBy(e.target.value)}
								>
									<option value="popular">
										Phổ biến nhất
									</option>
									<option value="newest">Mới nhất</option>
									<option value="price-low">
										Giá thấp đến cao
									</option>
									<option value="price-high">
										Giá cao đến thấp
									</option>
									<option value="rating">Đánh giá cao</option>
								</select>
								<ChevronDown size={18} />
							</div>
						</div>
					</div>

					{/* Loading State */}
					{loading && (
						<div className="loading-state">
							<Loader className="spinner" size={40} />
							<p>Đang tải sản phẩm...</p>
						</div>
					)}

					{/* Error State */}
					{error && !loading && (
						<div className="error-state">
							<p>Có lỗi xảy ra: {error}</p>
							<button onClick={() => fetchProducts()}>
								Thử lại
							</button>
						</div>
					)}

					{/* Products */}
					{!loading && !error && (
						<>
							<div className="products-grid">
								{sortedProducts.map((product) => (
									<ProductCard
										key={product.id || product._id}
										product={product}
									/>
								))}
							</div>

							{sortedProducts.length === 0 && (
								<div className="no-products">
									<p>Không tìm thấy sản phẩm phù hợp</p>
									<button onClick={handleClearFilters}>
										Xóa bộ lọc
									</button>
								</div>
							)}

							{/* Pagination */}
							{sortedProducts.length > 0 && totalPages > 1 && (
								<div className="pagination">
									{currentPage > 1 && (
										<button
											className="page-btn"
											onClick={() =>
												setCurrentPage(currentPage - 1)
											}
										>
											← Trước
										</button>
									)}

									{[...Array(Math.min(totalPages, 5))].map(
										(_, i) => {
											const pageNum = i + 1;
											return (
												<button
													key={pageNum}
													className={`page-btn ${
														currentPage === pageNum
															? "active"
															: ""
													}`}
													onClick={() =>
														setCurrentPage(pageNum)
													}
												>
													{pageNum}
												</button>
											);
										},
									)}

									{totalPages > 5 && <span>...</span>}

									{totalPages > 5 && (
										<button
											className={`page-btn ${
												currentPage === totalPages
													? "active"
													: ""
											}`}
											onClick={() =>
												setCurrentPage(totalPages)
											}
										>
											{totalPages}
										</button>
									)}

									{currentPage < totalPages && (
										<button
											className="page-btn next"
											onClick={() =>
												setCurrentPage(currentPage + 1)
											}
										>
											Tiếp →
										</button>
									)}
								</div>
							)}
						</>
					)}
				</main>
			</div>
		</div>
	);
};

export default Products;
