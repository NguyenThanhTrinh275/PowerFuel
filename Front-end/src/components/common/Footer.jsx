/** @format */

import { Link } from "react-router-dom";
import {
	Dumbbell,
	Facebook,
	Instagram,
	Youtube,
	Mail,
	Phone,
	MapPin,
} from "lucide-react";
import "./Footer.css";

const Footer = () => {
	return (
		<footer className="footer">
			<div className="footer-container">
				<div className="footer-section">
					<Link to="/" className="footer-logo">
						<Dumbbell className="footer-logo-icon" />
						<span>PowerFuel</span>
					</Link>
					<p className="footer-desc">
						Cung cấp các sản phẩm thực phẩm bổ sung chất lượng cao
						cho người tập thể hình và thể thao.
					</p>
					<div className="social-links">
						<a href="#" className="social-link">
							<Facebook size={20} />
						</a>
						<a href="#" className="social-link">
							<Instagram size={20} />
						</a>
						<a href="#" className="social-link">
							<Youtube size={20} />
						</a>
					</div>
				</div>

				<div className="footer-section">
					<h3>Sản phẩm</h3>
					<ul>
						<li>
							<Link to="/products?category=whey">
								Whey Protein
							</Link>
						</li>
						<li>
							<Link to="/products?category=mass">
								Mass Gainer
							</Link>
						</li>
						<li>
							<Link to="/products?category=bcaa">
								BCAA & Amino
							</Link>
						</li>
						<li>
							<Link to="/products?category=creatine">
								Creatine
							</Link>
						</li>
						<li>
							<Link to="/products?category=pre-workout">
								Pre-Workout
							</Link>
						</li>
						<li>
							<Link to="/products?category=vitamin">
								Vitamin & Khoáng chất
							</Link>
						</li>
					</ul>
				</div>

				<div className="footer-section">
					<h3>Hỗ trợ</h3>
					<ul>
						<li>
							<Link to="/guide">Hướng dẫn mua hàng</Link>
						</li>
						<li>
							<Link to="/shipping">Chính sách vận chuyển</Link>
						</li>
						<li>
							<Link to="/return">Đổi trả & Hoàn tiền</Link>
						</li>
						<li>
							<Link to="/faq">Câu hỏi thường gặp</Link>
						</li>
						<li>
							<Link to="/contact">Liên hệ</Link>
						</li>
					</ul>
				</div>

				<div className="footer-section">
					<h3>Liên hệ</h3>
					<div className="contact-info">
						<div className="contact-item">
							<MapPin size={18} />
							<span>123 Đường ABC, Quận 1, TP.HCM</span>
						</div>
						<div className="contact-item">
							<Phone size={18} />
							<span>0123 456 789</span>
						</div>
						<div className="contact-item">
							<Mail size={18} />
							<span>support@powerfuel.vn</span>
						</div>
					</div>
				</div>
			</div>

			<div className="footer-bottom">
				<p>&copy; 2026 PowerFuel. Tất cả quyền được bảo lưu.</p>
			</div>
		</footer>
	);
};

export default Footer;
