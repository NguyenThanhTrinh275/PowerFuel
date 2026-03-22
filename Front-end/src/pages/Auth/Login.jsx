/** @format */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Dumbbell } from "lucide-react";
import authService from "../../services/authService";
import "./Auth.css";

const Login = () => {
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
		setError("");
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			setLoading(true);
			setError("");
			const result = await authService.login(formData);
			if (result?.data?.role === "admin") {
				navigate("/admin");
			} else {
				navigate("/");
			}
		} catch (err) {
			setError(
				err?.response?.data?.message ||
					"Đăng nhập thất bại, vui lòng thử lại",
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="auth-page">
			<div className="auth-container">
				<div className="auth-card">
					<div className="auth-header">
						<Link to="/" className="auth-logo">
							<Dumbbell className="auth-logo-icon" />
							<span>PowerFuel</span>
						</Link>
						<h1>Đăng nhập</h1>
						<p>Chào mừng bạn quay trở lại!</p>
					</div>

					<form className="auth-form" onSubmit={handleSubmit}>
						<div className="form-group">
							<label htmlFor="email">Email</label>
							<input
								type="email"
								id="email"
								name="email"
								placeholder="Nhập email của bạn"
								value={formData.email}
								onChange={handleChange}
								required
							/>
						</div>

						<div className="form-group">
							<label htmlFor="password">Mật khẩu</label>
							<div className="password-input">
								<input
									type={showPassword ? "text" : "password"}
									id="password"
									name="password"
									placeholder="Nhập mật khẩu"
									value={formData.password}
									onChange={handleChange}
									required
								/>
								<button
									type="button"
									className="password-toggle"
									onClick={() =>
										setShowPassword(!showPassword)
									}
								>
									{showPassword ? (
										<EyeOff size={20} />
									) : (
										<Eye size={20} />
									)}
								</button>
							</div>
						</div>

						<div className="form-options">
							<label className="checkbox-label">
								<input type="checkbox" />
								<span>Ghi nhớ đăng nhập</span>
							</label>
							<Link to="/forgot-password" className="forgot-link">
								Quên mật khẩu?
							</Link>
						</div>

						{error && <p className="auth-error">{error}</p>}

						<button
							type="submit"
							className="auth-submit"
							disabled={loading}
						>
							{loading ? "Đang đăng nhập..." : "Đăng nhập"}
						</button>
					</form>

					<div className="auth-divider">
						<span>Hoặc đăng nhập với</span>
					</div>

					<div className="social-login">
						<button className="social-btn google">
							<img
								src="https://www.google.com/favicon.ico"
								alt="Google"
							/>
							Google
						</button>
						<button className="social-btn facebook">
							<img
								src="https://www.facebook.com/favicon.ico"
								alt="Facebook"
							/>
							Facebook
						</button>
					</div>

					<p className="auth-footer">
						Chưa có tài khoản?{" "}
						<Link to="/register">Đăng ký ngay</Link>
					</p>
				</div>
			</div>
		</div>
	);
};

export default Login;
