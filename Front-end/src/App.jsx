/** @format */

import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Layouts
import AdminLayout from "./layouts/AdminLayout";

// Common Components
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import ChatButton from "./components/common/ChatButton";

// Pages - Customer
import Home from "./pages/Home/Home";
import Products from "./pages/Products/Products";
import Cart from "./pages/Cart/Cart";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";

// Pages - Admin
import Dashboard from "./pages/Admin/Dashboard";
import AdminProducts from "./pages/Admin/AdminProducts";
import authService from "./services/authService";
import cartService from "./services/cartService";

import "./App.css";

// Customer Layout wrapper
const CustomerLayout = ({
	children,
	cartItemCount,
	isLoggedIn,
	userRole,
	onLogout,
}) => {
	return (
		<>
			<Header
				cartItemCount={cartItemCount}
				isLoggedIn={isLoggedIn}
				userRole={userRole}
				onLogout={onLogout}
			/>
			<main>{children}</main>
			<Footer />
		</>
	);
};

function App() {
	const [isLoggedIn, setIsLoggedIn] = useState(authService.isAuthenticated());
	const [user, setUser] = useState(authService.getStoredUser());
	const [cartItemCount, setCartItemCount] = useState(0);

	useEffect(() => {
		const syncAuthState = async () => {
			const authenticated = authService.isAuthenticated();
			setIsLoggedIn(authenticated);
			setUser(authService.getStoredUser());

			if (!authenticated) {
				setCartItemCount(0);
				return;
			}

			try {
				const cartResponse = await cartService.getCart();
				setCartItemCount(cartResponse.data?.totalItems || 0);
			} catch {
				setCartItemCount(0);
			}
		};

		syncAuthState();
		window.addEventListener("auth-changed", syncAuthState);
		window.addEventListener("storage", syncAuthState);

		return () => {
			window.removeEventListener("auth-changed", syncAuthState);
			window.removeEventListener("storage", syncAuthState);
		};
	}, []);

	const handleLogout = () => {
		authService.logout();
	};

	return (
		<Router>
			<Routes>
				{/* Customer Routes */}
				<Route
					path="/"
					element={
						<CustomerLayout
							cartItemCount={cartItemCount}
							isLoggedIn={isLoggedIn}
							userRole={user?.role}
							onLogout={handleLogout}
						>
							<Home />
						</CustomerLayout>
					}
				/>
				<Route
					path="/products"
					element={
						<CustomerLayout
							cartItemCount={cartItemCount}
							isLoggedIn={isLoggedIn}
							userRole={user?.role}
							onLogout={handleLogout}
						>
							<Products />
						</CustomerLayout>
					}
				/>
				<Route
					path="/cart"
					element={
						<CustomerLayout
							cartItemCount={cartItemCount}
							isLoggedIn={isLoggedIn}
							userRole={user?.role}
							onLogout={handleLogout}
						>
							<Cart />
						</CustomerLayout>
					}
				/>
				<Route path="/login" element={<Login />} />
				<Route path="/register" element={<Register />} />

				{/* Admin Routes */}
				<Route path="/admin" element={<AdminLayout />}>
					<Route index element={<Dashboard />} />
					<Route path="products" element={<AdminProducts />} />
					{/* Thêm các route admin khác ở đây */}
				</Route>
			</Routes>

			{/* Chat Button - Hiển thị trên tất cả các trang */}
			<ChatButton />
		</Router>
	);
}

export default App;
