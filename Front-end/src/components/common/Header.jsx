/** @format */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Search, Menu, X, Dumbbell } from "lucide-react";
import "./Header.css";

const Header = ({
	cartItemCount = 0,
	isLoggedIn = false,
	userRole = "customer",
	onLogout,
}) => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const navigate = useNavigate();

	const handleSearch = (e) => {
		e.preventDefault();
		if (searchQuery.trim()) {
			navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
		}
	};

	return (
		<header className="header">
			<div className="header-container">
				{/* Logo */}
				<Link to="/" className="logo">
					<Dumbbell className="logo-icon" />
					<span className="logo-text">PowerFuel</span>
				</Link>

				{/* Search Bar */}
				<form className="search-bar" onSubmit={handleSearch}>
					<input
						type="text"
						placeholder="Tìm kiếm Whey, Mass, BCAA..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
					<button type="submit">
						<Search size={20} />
					</button>
				</form>

				{/* Navigation */}
				<nav className={`nav-menu ${isMenuOpen ? "active" : ""}`}>
					<Link
						to="/"
						className="nav-link"
						onClick={() => setIsMenuOpen(false)}
					>
						Trang chủ
					</Link>
					<Link
						to="/products"
						className="nav-link"
						onClick={() => setIsMenuOpen(false)}
					>
						Sản phẩm
					</Link>
					<Link
						to="/products?category=whey"
						className="nav-link"
						onClick={() => setIsMenuOpen(false)}
					>
						Whey Protein
					</Link>
					<Link
						to="/products?category=mass"
						className="nav-link"
						onClick={() => setIsMenuOpen(false)}
					>
						Mass Gainer
					</Link>
					<Link
						to="/about"
						className="nav-link"
						onClick={() => setIsMenuOpen(false)}
					>
						Về chúng tôi
					</Link>
				</nav>

				{/* Actions */}
				<div className="header-actions">
					<Link to="/cart" className="cart-btn">
						<ShoppingCart size={24} />
						{cartItemCount > 0 && (
							<span className="cart-badge">{cartItemCount}</span>
						)}
					</Link>

					{isLoggedIn ? (
						<div className="user-menu">
							<Link
								to={
									userRole === "admin" ? "/admin" : "/account"
								}
								className="user-btn"
							>
								<User size={24} />
							</Link>
							<button className="login-btn" onClick={onLogout}>
								Đăng xuất
							</button>
						</div>
					) : (
						<Link to="/login" className="login-btn">
							Đăng nhập
						</Link>
					)}

					<button
						className="menu-toggle"
						onClick={() => setIsMenuOpen(!isMenuOpen)}
					>
						{isMenuOpen ? <X size={24} /> : <Menu size={24} />}
					</button>
				</div>
			</div>
		</header>
	);
};

export default Header;
