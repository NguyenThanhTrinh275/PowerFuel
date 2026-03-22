/** @format */

import { useEffect, useMemo, useState } from "react";
import {
	Plus,
	Search,
	Edit,
	Trash2,
	Eye,
	Filter,
	Download,
} from "lucide-react";
import productService from "../../services/productService";
import "./AdminProducts.css";

const AdminProducts = () => {
	const [products, setProducts] = useState([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedProducts, setSelectedProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	const fetchProducts = async () => {
		try {
			setLoading(true);
			setError("");
			const response = await productService.getAdminProducts({
				page: 1,
				limit: 200,
			});
			setProducts(response.data || []);
		} catch (err) {
			setError(
				err?.response?.data?.message ||
					"Không thể tải danh sách sản phẩm admin",
			);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchProducts();
	}, []);

	const visibleProducts = useMemo(() => {
		if (!searchQuery.trim()) {
			return products;
		}

		const key = searchQuery.trim().toLowerCase();
		return products.filter(
			(product) =>
				product.name.toLowerCase().includes(key) ||
				(product.sku || "").toLowerCase().includes(key) ||
				(product.categoryName || "").toLowerCase().includes(key),
		);
	}, [products, searchQuery]);

	const formatPrice = (value) => {
		return new Intl.NumberFormat("vi-VN").format(value) + "đ";
	};

	const getStatusClass = (status) => {
		const classes = {
			active: "status-active",
			outofstock: "status-outofstock",
			lowstock: "status-lowstock",
			draft: "status-draft",
		};
		return classes[status] || "";
	};

	const getStatusText = (status) => {
		const texts = {
			active: "Đang bán",
			outofstock: "Hết hàng",
			lowstock: "Sắp hết",
			draft: "Nháp",
		};
		return texts[status] || status;
	};

	const handleSelectAll = (e) => {
		if (e.target.checked) {
			setSelectedProducts(visibleProducts.map((p) => p.id));
		} else {
			setSelectedProducts([]);
		}
	};

	const handleSelectProduct = (id) => {
		setSelectedProducts((prev) =>
			prev.includes(id)
				? prev.filter((pId) => pId !== id)
				: [...prev, id],
		);
	};

	const handleDelete = async (id) => {
		if (!window.confirm("Bạn chắc chắn muốn xóa sản phẩm này?")) {
			return;
		}

		try {
			await productService.deleteProduct(id);
			setProducts((prev) => prev.filter((product) => product.id !== id));
			setSelectedProducts((prev) =>
				prev.filter((productId) => productId !== id),
			);
		} catch (err) {
			setError(err?.response?.data?.message || "Xóa sản phẩm thất bại");
		}
	};

	return (
		<div className="admin-products">
			<div className="page-header">
				<div>
					<h1>Quản lý sản phẩm</h1>
					<p>Quản lý tất cả sản phẩm trong cửa hàng</p>
				</div>
				<button className="add-product-btn">
					<Plus size={20} />
					Thêm sản phẩm
				</button>
			</div>

			{/* Toolbar */}
			<div className="products-toolbar">
				<div className="toolbar-left">
					<div className="search-box">
						<Search size={20} />
						<input
							type="text"
							placeholder="Tìm kiếm sản phẩm..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>
					<button className="filter-btn">
						<Filter size={18} />
						Bộ lọc
					</button>
				</div>
				<div className="toolbar-right">
					<button className="export-btn">
						<Download size={18} />
						Xuất Excel
					</button>
				</div>
			</div>

			{/* Products Table */}
			<div className="products-table-container">
				{loading && <p>Đang tải dữ liệu...</p>}
				{error && <p>{error}</p>}
				<table className="products-table">
					<thead>
						<tr>
							<th>
								<input
									type="checkbox"
									onChange={handleSelectAll}
									checked={
										selectedProducts.length ===
											visibleProducts.length &&
										visibleProducts.length > 0
									}
								/>
							</th>
							<th>Sản phẩm</th>
							<th>SKU</th>
							<th>Danh mục</th>
							<th>Giá</th>
							<th>Tồn kho</th>
							<th>Trạng thái</th>
							<th>Thao tác</th>
						</tr>
					</thead>
					<tbody>
						{visibleProducts.map((product) => (
							<tr key={product.id}>
								<td>
									<input
										type="checkbox"
										checked={selectedProducts.includes(
											product.id,
										)}
										onChange={() =>
											handleSelectProduct(product.id)
										}
									/>
								</td>
								<td>
									<div className="product-cell">
										<img
											src={product.image}
											alt={product.name}
										/>
										<span className="product-name">
											{product.name}
										</span>
									</div>
								</td>
								<td className="sku-cell">
									{product.sku || "-"}
								</td>
								<td>{product.categoryName || "-"}</td>
								<td className="price-cell">
									{formatPrice(product.price)}
								</td>
								<td className="stock-cell">{product.stock}</td>
								<td>
									<span
										className={`product-status ${getStatusClass(
											product.status,
										)}`}
									>
										{getStatusText(product.status)}
									</span>
								</td>
								<td>
									<div className="action-buttons">
										<button
											className="action-btn view"
											title="Xem"
										>
											<Eye size={18} />
										</button>
										<button
											className="action-btn edit"
											title="Sửa"
										>
											<Edit size={18} />
										</button>
										<button
											className="action-btn delete"
											title="Xóa"
											onClick={() =>
												handleDelete(product.id)
											}
										>
											<Trash2 size={18} />
										</button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Pagination */}
			<div className="table-footer">
				<div className="table-info">
					Hiển thị 1-{visibleProducts.length} của{" "}
					{visibleProducts.length} sản phẩm
				</div>
				<div className="table-pagination">
					<button className="page-btn" disabled>
						Trước
					</button>
					<button className="page-btn active">1</button>
					<button className="page-btn">2</button>
					<button className="page-btn">3</button>
					<button className="page-btn">Sau</button>
				</div>
			</div>
		</div>
	);
};

export default AdminProducts;
