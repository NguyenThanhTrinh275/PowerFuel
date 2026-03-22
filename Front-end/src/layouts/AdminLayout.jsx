/** @format */

import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
	LayoutDashboard,
	Package,
	ShoppingCart,
	Users,
	BarChart3,
	Settings,
	LogOut,
	Menu,
	X,
	Dumbbell,
	Bell,
	Search,
} from "lucide-react";
import authService from "../services/authService";
import "./AdminLayout.css";

const menuItems = [
	{ path: "/admin", icon: LayoutDashboard, label: "Dashboard", exact: true },
	{ path: "/admin/products", icon: Package, label: "Sản phẩm" },
	{ path: "/admin/orders", icon: ShoppingCart, label: "Đơn hàng" },
	{ path: "/admin/customers", icon: Users, label: "Khách hàng" },
	{ path: "/admin/analytics", icon: BarChart3, label: "Thống kê" },
	{ path: "/admin/settings", icon: Settings, label: "Cài đặt" },
];

const AdminLayout = () => {
	const [sidebarOpen, setSidebarOpen] = useState(true);
	const location = useLocation();

	const isActive = (item) => {
		if (item.exact) {
			return location.pathname === item.path;
		}
		return location.pathname.startsWith(item.path);
	};

	return (
		<div
			className={`admin-layout ${sidebarOpen ? "" : "sidebar-collapsed"}`}
		>
			{/* Sidebar */}
			<aside className="admin-sidebar">
				<div className="sidebar-header">
					<Link to="/admin" className="admin-logo">
						<Dumbbell className="logo-icon" />
						{sidebarOpen && <span>PowerFuel</span>}
					</Link>
					<button
						className="sidebar-toggle"
						onClick={() => setSidebarOpen(!sidebarOpen)}
					>
						{sidebarOpen ? <X size={20} /> : <Menu size={20} />}
					</button>
				</div>

				<nav className="sidebar-nav">
					{menuItems.map((item) => (
						<Link
							key={item.path}
							to={item.path}
							className={`nav-item ${
								isActive(item) ? "active" : ""
							}`}
						>
							<item.icon size={22} />
							{sidebarOpen && <span>{item.label}</span>}
						</Link>
					))}
				</nav>

				<div className="sidebar-footer">
					<Link
						to="/"
						className="nav-item logout"
						onClick={() => authService.logout()}
					>
						<LogOut size={22} />
						{sidebarOpen && <span>Đăng xuất</span>}
					</Link>
				</div>
			</aside>

			{/* Main Content */}
			<div className="admin-main">
				{/* Top Header */}
				<header className="admin-header">
					<div className="header-search">
						<Search size={20} />
						<input type="text" placeholder="Tìm kiếm..." />
					</div>

					<div className="header-actions">
						<button className="notification-btn">
							<Bell size={22} />
							<span className="notification-badge">3</span>
						</button>
						<div className="admin-user">
							<img
								src="https://ui-avatars.com/api/?name=Admin&background=f39c12&color=fff"
								alt="Admin"
							/>
							<div className="user-info">
								<span className="user-name">Admin</span>
								<span className="user-role">Quản trị viên</span>
							</div>
						</div>
					</div>
				</header>

				{/* Content */}
				<main className="admin-content">
					<Outlet />
				</main>
			</div>
		</div>
	);
};

export default AdminLayout;
