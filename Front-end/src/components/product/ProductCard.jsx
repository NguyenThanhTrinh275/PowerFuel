/** @format */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Star, Eye } from "lucide-react";
import authService from "../../services/authService";
import cartService from "../../services/cartService";
import "./ProductCard.css";

const ProductCard = ({ product }) => {
	const navigate = useNavigate();
	const [adding, setAdding] = useState(false);

	const {
		id,
		name,
		image,
		price,
		originalPrice,
		rating = 5,
		reviewCount = 0,
		badge,
		brand,
	} = product;

	const discount = originalPrice
		? Math.round((1 - price / originalPrice) * 100)
		: 0;

	const formatPrice = (value) => {
		return new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
		}).format(value);
	};

	const handleAddToCart = async () => {
		if (!id) return;

		if (!authService.isAuthenticated()) {
			navigate("/login");
			return;
		}

		try {
			setAdding(true);
			await cartService.addToCart({
				productId: id,
				quantity: 1,
				flavor: "",
			});
			window.dispatchEvent(new Event("auth-changed"));
		} catch (error) {
			console.error("Add to cart failed:", error);
			alert(
				error?.response?.data?.message || "Không thể thêm vào giỏ hàng",
			);
		} finally {
			setAdding(false);
		}
	};

	return (
		<div className="product-card">
			{badge && (
				<span className={`product-badge ${badge.type}`}>
					{badge.text}
				</span>
			)}
			{discount > 0 && (
				<span className="discount-badge">-{discount}%</span>
			)}

			<Link to={`/product/${id}`} className="product-image">
				<img src={image} alt={name} />
				<div className="product-overlay">
					<button className="overlay-btn">
						<Eye size={20} />
						<span>Xem nhanh</span>
					</button>
				</div>
			</Link>

			<div className="product-info">
				<span className="product-brand">{brand}</span>
				<Link to={`/product/${id}`} className="product-name">
					{name}
				</Link>

				<div className="product-rating">
					<div className="stars">
						{[...Array(5)].map((_, i) => (
							<Star
								key={i}
								size={14}
								className={
									i < rating ? "star-filled" : "star-empty"
								}
							/>
						))}
					</div>
					<span className="review-count">({reviewCount})</span>
				</div>

				<div className="product-pricing">
					<span className="current-price">{formatPrice(price)}</span>
					{originalPrice && (
						<span className="original-price">
							{formatPrice(originalPrice)}
						</span>
					)}
				</div>

				<button
					className="add-to-cart-btn"
					onClick={handleAddToCart}
					disabled={adding}
				>
					<ShoppingCart size={18} />
					<span>{adding ? "Đang thêm..." : "Thêm vào giỏ"}</span>
				</button>
			</div>
		</div>
	);
};

export default ProductCard;
