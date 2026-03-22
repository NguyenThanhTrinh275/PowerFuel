/** @format */

import { useEffect, useMemo, useState } from "react";
import {
	TrendingUp,
	TrendingDown,
	DollarSign,
	ShoppingCart,
	Users,
	Package,
	ArrowUpRight,
	MoreVertical,
} from "lucide-react";
import orderService from "../../services/orderService";
import productService from "../../services/productService";
import "./Dashboard.css";

const Dashboard = () => {
	const [statsPayload, setStatsPayload] = useState(null);
	const [recentOrders, setRecentOrders] = useState([]);
	const [topProducts, setTopProducts] = useState([]);
	const [error, setError] = useState("");

	const formatPrice = (value) => {
		return new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
		}).format(value || 0);
	};

	useEffect(() => {
		const fetchDashboard = async () => {
			try {
				setError("");
				const [statsResponse, ordersResponse, bestSellerResponse] =
					await Promise.all([
						orderService.getOrderStats(),
						orderService.getOrders({ page: 1, limit: 5 }),
						productService.getBestSellerProducts(),
					]);

				setStatsPayload(statsResponse?.data || {});
				setRecentOrders(ordersResponse?.data || []);
				setTopProducts((bestSellerResponse?.data || []).slice(0, 5));
			} catch (err) {
				setError(
					err?.response?.data?.message ||
						"Không thể tải dashboard, vui lòng kiểm tra quyền admin",
				);
			}
		};

		fetchDashboard();
	}, []);

	const stats = useMemo(
		() => [
			{
				title: "Tổng doanh thu",
				value: formatPrice(statsPayload?.totalRevenue),
				change: "+0%",
				trend: "up",
				icon: DollarSign,
				color: "#10b981",
			},
			{
				title: "Tổng đơn hàng",
				value: `${statsPayload?.totalOrders || 0}`,
				change: "+0%",
				trend: "up",
				icon: ShoppingCart,
				color: "#3b82f6",
			},
			{
				title: "Đơn chờ xử lý",
				value: `${statsPayload?.pendingOrders || 0}`,
				change: "+0%",
				trend: "up",
				icon: Users,
				color: "#8b5cf6",
			},
			{
				title: "Đơn đã giao",
				value: `${statsPayload?.deliveredOrders || 0}`,
				change: "-0%",
				trend: "down",
				icon: Package,
				color: "#f59e0b",
			},
		],
		[statsPayload],
	);

	const getStatusClass = (status) => {
		const classes = {
			delivered: "status-completed",
			processing: "status-processing",
			pending: "status-pending",
			shipping: "status-shipping",
			confirmed: "status-processing",
			cancelled: "status-pending",
		};
		return classes[status] || "";
	};

	const getStatusText = (status) => {
		const texts = {
			delivered: "Hoàn thành",
			processing: "Đang xử lý",
			pending: "Chờ xác nhận",
			shipping: "Đang giao",
			confirmed: "Đã xác nhận",
			cancelled: "Đã hủy",
		};
		return texts[status] || status;
	};

	return (
		<div className="dashboard">
			{error && <p>{error}</p>}
			<div className="dashboard-header">
				<div>
					<h1>Dashboard</h1>
					<p>
						Chào mừng trở lại! Đây là tổng quan về cửa hàng của bạn.
					</p>
				</div>
				<button className="export-btn">
					Xuất báo cáo
					<ArrowUpRight size={18} />
				</button>
			</div>

			{/* Stats Grid */}
			<div className="stats-grid">
				{stats.map((stat, index) => (
					<div key={index} className="stat-card">
						<div
							className="stat-icon"
							style={{
								background: `${stat.color}20`,
								color: stat.color,
							}}
						>
							<stat.icon size={24} />
						</div>
						<div className="stat-content">
							<span className="stat-title">{stat.title}</span>
							<span className="stat-value">{stat.value}</span>
							<span className={`stat-change ${stat.trend}`}>
								{stat.trend === "up" ? (
									<TrendingUp size={16} />
								) : (
									<TrendingDown size={16} />
								)}
								{stat.change} so với tháng trước
							</span>
						</div>
					</div>
				))}
			</div>

			{/* Charts Row */}
			<div className="charts-row">
				{/* Recent Orders */}
				<div className="card orders-card">
					<div className="card-header">
						<h2>Đơn hàng gần đây</h2>
						<button className="more-btn">
							<MoreVertical size={20} />
						</button>
					</div>
					<div className="orders-table">
						<table>
							<thead>
								<tr>
									<th>Mã đơn</th>
									<th>Khách hàng</th>
									<th>Sản phẩm</th>
									<th>Số tiền</th>
									<th>Trạng thái</th>
								</tr>
							</thead>
							<tbody>
								{recentOrders.map((order) => (
									<tr key={order._id}>
										<td className="order-id">
											{order.orderNumber}
										</td>
										<td>
											{order?.user?.name || "Khách hàng"}
										</td>
										<td>
											{order?.orderItems?.[0]?.name ||
												"-"}
										</td>
										<td className="order-amount">
											{formatPrice(order.totalPrice)}
										</td>
										<td>
											<span
												className={`order-status ${getStatusClass(
													order.orderStatus,
												)}`}
											>
												{getStatusText(
													order.orderStatus,
												)}
											</span>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>

				{/* Top Products */}
				<div className="card top-products-card">
					<div className="card-header">
						<h2>Sản phẩm bán chạy</h2>
						<button className="more-btn">
							<MoreVertical size={20} />
						</button>
					</div>
					<div className="top-products-list">
						{topProducts.map((product, index) => (
							<div
								key={product.id || index}
								className="product-item"
							>
								<div className="product-rank">#{index + 1}</div>
								<img
									src={product.image}
									alt={product.name}
									className="product-thumb"
								/>
								<div className="product-details">
									<span className="product-name">
										{product.name}
									</span>
									<span className="product-stats">
										Đã bán: {product.sold}
									</span>
								</div>
								<div className="product-revenue">
									{formatPrice(product.price * product.sold)}
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
