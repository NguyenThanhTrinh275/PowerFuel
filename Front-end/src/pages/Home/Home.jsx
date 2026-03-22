/** @format */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, Shield, Truck, Clock } from "lucide-react";
import ProductCard from "../../components/product/ProductCard";
import productService from "../../services/productService";
import "./Home.css";

const defaultCategories = [
	{
		id: "whey",
		name: "Whey Protein",
		image: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400",
		description: "Protein chất lượng cao cho tăng cơ",
	},
	{
		id: "mass",
		name: "Mass Gainer",
		image: "https://images.unsplash.com/photo-1606937295547-bc0f668595b3?w=400",
		description: "Tăng cân hiệu quả cho người gầy",
	},
	{
		id: "bcaa",
		name: "BCAA & Amino",
		image: "https://images.unsplash.com/photo-1709976142774-ce1ef41a8378?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
		description: "Phục hồi cơ bắp nhanh chóng",
	},
	{
		id: "pre-workout",
		name: "Pre-Workout",
		image: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=400",
		description: "Tăng năng lượng tập luyện",
	},
];

const Home = () => {
	const [featuredProducts, setFeaturedProducts] = useState([]);
	const [categories, setCategories] = useState(defaultCategories);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [featuredRes, categoriesRes] = await Promise.all([
					productService.getFeaturedProducts(),
					productService.getCategories(),
				]);

				setFeaturedProducts(featuredRes.data || []);

				if (
					Array.isArray(categoriesRes.data) &&
					categoriesRes.data.length
				) {
					setCategories(
						categoriesRes.data.slice(0, 4).map((category) => ({
							id: category.slug || category.id,
							name: category.name,
							image: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400",
							description:
								category.description ||
								"Sản phẩm chất lượng cao",
						})),
					);
				}
			} catch (error) {
				console.error("Home API error:", error);
			}
		};

		fetchData();
	}, []);

	return (
		<div className="home">
			{/* Hero Section */}
			<section className="hero">
				<div className="hero-content">
					<div className="hero-text">
						<span className="hero-badge">
							🔥 Ưu đãi đặc biệt - Giảm đến 30%
						</span>
						<h1>
							Nâng Tầm <span className="highlight">Sức Mạnh</span>
							<br />
							Chinh Phục Mọi Giới Hạn
						</h1>
						<p>
							Khám phá bộ sưu tập thực phẩm bổ sung hàng đầu thế
							giới. Chất lượng đảm bảo, giá tốt nhất thị trường.
						</p>
						<div className="hero-buttons">
							<Link to="/products" className="btn-primary">
								Mua ngay
								<ArrowRight size={20} />
							</Link>
							<Link to="/about" className="btn-secondary">
								Tìm hiểu thêm
							</Link>
						</div>
					</div>
					<div className="hero-image">
						<img
							src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600"
							alt="Fitness"
						/>
					</div>
				</div>
			</section>

			{/* Features */}
			<section className="features">
				<div className="features-container">
					<div className="feature-item">
						<div className="feature-icon">
							<Shield size={28} />
						</div>
						<div className="feature-text">
							<h4>100% Chính hãng</h4>
							<p>Cam kết hàng nhập khẩu</p>
						</div>
					</div>
					<div className="feature-item">
						<div className="feature-icon">
							<Truck size={28} />
						</div>
						<div className="feature-text">
							<h4>Giao hàng toàn quốc</h4>
							<p>Freeship đơn từ 500K</p>
						</div>
					</div>
					<div className="feature-item">
						<div className="feature-icon">
							<Zap size={28} />
						</div>
						<div className="feature-text">
							<h4>Giao nhanh 2H</h4>
							<p>Nội thành TP.HCM & Hà Nội</p>
						</div>
					</div>
					<div className="feature-item">
						<div className="feature-icon">
							<Clock size={28} />
						</div>
						<div className="feature-text">
							<h4>Đổi trả 30 ngày</h4>
							<p>Hoàn tiền nếu không hài lòng</p>
						</div>
					</div>
				</div>
			</section>

			{/* Categories */}
			<section className="categories-section">
				<div className="section-container">
					<div className="section-header">
						<h2>Danh Mục Sản Phẩm</h2>
						<p>Khám phá các dòng sản phẩm chất lượng cao</p>
					</div>
					<div className="categories-grid">
						{categories.map((category) => (
							<Link
								to={`/products?category=${category.id}`}
								key={category.id}
								className="category-card"
							>
								<div className="category-image">
									<img
										src={category.image}
										alt={category.name}
									/>
								</div>
								<div className="category-info">
									<h3>{category.name}</h3>
									<p>{category.description}</p>
									<span className="category-link">
										Xem thêm <ArrowRight size={16} />
									</span>
								</div>
							</Link>
						))}
					</div>
				</div>
			</section>

			{/* Featured Products */}
			<section className="featured-section">
				<div className="section-container">
					<div className="section-header">
						<h2>Sản Phẩm Nổi Bật</h2>
						<p>Những sản phẩm được yêu thích nhất</p>
					</div>
					<div className="products-grid">
						{featuredProducts.slice(0, 4).map((product) => (
							<ProductCard key={product.id} product={product} />
						))}
					</div>
					<div className="section-footer">
						<Link to="/products" className="view-all-btn">
							Xem tất cả sản phẩm
							<ArrowRight size={20} />
						</Link>
					</div>
				</div>
			</section>

			{/* CTA Banner */}
			<section className="cta-section">
				<div className="cta-container">
					<div className="cta-content">
						<h2>Đăng ký nhận ưu đãi độc quyền</h2>
						<p>Nhận ngay voucher giảm 10% cho đơn hàng đầu tiên</p>
						<form className="cta-form">
							<input
								type="email"
								placeholder="Nhập email của bạn"
							/>
							<button type="submit">Đăng ký</button>
						</form>
					</div>
				</div>
			</section>
		</div>
	);
};

export default Home;
