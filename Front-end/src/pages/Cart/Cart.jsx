/** @format */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Tag } from "lucide-react";
import { API_ORIGIN } from "../../services/api";
import authService from "../../services/authService";
import cartService from "../../services/cartService";
import "./Cart.css";

const Cart = () => {
	const [cartItems, setCartItems] = useState([]);
	const [couponCode, setCouponCode] = useState("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	const syncCartState = (cart) => {
		setCartItems(Array.isArray(cart?.items) ? cart.items : []);
	};

	const fetchCart = async () => {
		if (!authService.isAuthenticated()) {
			setCartItems([]);
			setLoading(false);
			return;
		}

		try {
			setLoading(true);
			setError("");
			const response = await cartService.getCart();
			syncCartState(response.data);
		} catch (err) {
			setError(err?.response?.data?.message || "Không thể tải giỏ hàng");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchCart();
	}, []);

	const updateQuantity = async (id, delta) => {
		const targetItem = cartItems.find((item) => item.id === id);
		if (!targetItem) return;

		const nextQuantity = Math.max(1, targetItem.quantity + delta);

		try {
			const response = await cartService.updateCartItem(id, nextQuantity);
			syncCartState(response.data);
		} catch (err) {
			setError(
				err?.response?.data?.message || "Cập nhật giỏ hàng thất bại",
			);
		}
	};

	const removeItem = async (id) => {
		try {
			const response = await cartService.removeCartItem(id);
			syncCartState(response.data);
		} catch (err) {
			setError(err?.response?.data?.message || "Xóa sản phẩm thất bại");
		}
	};

	const formatPrice = (value) => {
		return new Intl.NumberFormat("vi-VN").format(value) + "đ";
	};

	const subtotal = cartItems.reduce(
		(sum, item) => sum + item.price * item.quantity,
		0,
	);
	const shipping = subtotal >= 500000 ? 0 : 30000;
	const total = subtotal + shipping;

	return (
		<div className="cart-page">
			<div className="cart-container">
				<div className="cart-header">
					<h1>
						<ShoppingBag size={32} />
						Giỏ hàng của bạn
					</h1>
					<span className="cart-count">
						{cartItems.length} sản phẩm
					</span>
				</div>

				{loading ? (
					<div className="empty-cart">
						<p>Đang tải giỏ hàng...</p>
					</div>
				) : cartItems.length > 0 ? (
					<div className="cart-content">
						{/* Cart Items */}
						<div className="cart-items">
							{error && <p className="cart-error">{error}</p>}
							{cartItems.map((item) => (
								<div key={item.id} className="cart-item">
									<img
										src={
											item.image?.startsWith("http")
												? item.image
												: `${API_ORIGIN}${item.image}`
										}
										alt={item.name}
										className="item-image"
									/>

									<div className="item-details">
										<Link
											to={`/product/${item.productId}`}
											className="item-name"
										>
											{item.name}
										</Link>
										<div className="item-variants">
											<span>Hương vị: {item.flavor}</span>
											<span>
												Số lượng: {item.quantity}
											</span>
										</div>
										<span className="item-price-mobile">
											{formatPrice(item.price)}
										</span>
									</div>

									<div className="item-quantity">
										<button
											onClick={() =>
												updateQuantity(item.id, -1)
											}
										>
											<Minus size={16} />
										</button>
										<span>{item.quantity}</span>
										<button
											onClick={() =>
												updateQuantity(item.id, 1)
											}
										>
											<Plus size={16} />
										</button>
									</div>

									<div className="item-price">
										{formatPrice(item.price)}
									</div>

									<div className="item-total">
										{formatPrice(
											item.price * item.quantity,
										)}
									</div>

									<button
										className="remove-btn"
										onClick={() => removeItem(item.id)}
									>
										<Trash2 size={20} />
									</button>
								</div>
							))}

							<Link to="/products" className="continue-shopping">
								<ArrowLeft size={20} />
								Tiếp tục mua hàng
							</Link>
						</div>

						{/* Cart Summary */}
						<div className="cart-summary">
							<h2>Tổng đơn hàng</h2>

							<div className="coupon-section">
								<div className="coupon-input">
									<Tag size={20} />
									<input
										type="text"
										placeholder="Mã giảm giá"
										value={couponCode}
										onChange={(e) =>
											setCouponCode(e.target.value)
										}
									/>
									<button>Áp dụng</button>
								</div>
							</div>

							<div className="summary-details">
								<div className="summary-row">
									<span>Tạm tính</span>
									<span>{formatPrice(subtotal)}</span>
								</div>
								<div className="summary-row">
									<span>Phí vận chuyển</span>
									<span
										className={
											shipping === 0
												? "free-shipping"
												: ""
										}
									>
										{shipping === 0
											? "Miễn phí"
											: formatPrice(shipping)}
									</span>
								</div>
								{shipping === 0 && (
									<div className="free-shipping-note">
										🎉 Bạn được miễn phí vận chuyển!
									</div>
								)}
								<div className="summary-divider"></div>
								<div className="summary-row total">
									<span>Tổng cộng</span>
									<span>{formatPrice(total)}</span>
								</div>
							</div>

							<button className="checkout-btn" disabled>
								Tiến hành thanh toán
							</button>

							<div className="payment-methods">
								<span>Chấp nhận thanh toán:</span>
								<div className="payment-icons">
									<span>💳 Visa</span>
									<span>💳 Mastercard</span>
									<span>🏦 Chuyển khoản</span>
									<span>💵 COD</span>
								</div>
							</div>
						</div>
					</div>
				) : (
					<div className="empty-cart">
						<ShoppingBag size={80} />
						<h2>Giỏ hàng trống</h2>
						<p>Hãy thêm sản phẩm vào giỏ hàng của bạn</p>
						<Link to="/products" className="shop-now-btn">
							Mua sắm ngay
						</Link>
					</div>
				)}
			</div>
		</div>
	);
};

export default Cart;
