/** @format */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Dumbbell } from "lucide-react";
import authService from "../../services/authService";
import "./Auth.css";

const Register = () => {
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		fullName: "",
		email: "",
		phone: "",
		password: "",
		confirmPassword: "",
	});
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

		if (formData.password !== formData.confirmPassword) {
			setError("Mật khẩu xác nhận không khớp");
			return;
		}

		try {
			setLoading(true);
			setError("");
			const payload = {
				name: formData.fullName,
				email: formData.email,
				phone: formData.phone,
				password: formData.password,
			};

			await authService.register(payload);
			navigate("/");
		} catch (err) {
			setError(
				err?.response?.data?.message ||
					"Đăng ký thất bại, vui lòng thử lại",
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
						<h1>Đăng ký tài khoản</h1>
						<p>Tạo tài khoản để nhận ưu đãi độc quyền</p>
					</div>

					<form className="auth-form" onSubmit={handleSubmit}>
						<div className="form-group">
							<label htmlFor="fullName">Họ và tên</label>
							<input
								type="text"
								id="fullName"
								name="fullName"
								placeholder="Nhập họ và tên"
								value={formData.fullName}
								onChange={handleChange}
								required
							/>
						</div>

						<div className="form-row">
							<div className="form-group">
								<label htmlFor="email">Email</label>
								<input
									type="email"
									id="email"
									name="email"
									placeholder="Nhập email"
									value={formData.email}
									onChange={handleChange}
									required
								/>
							</div>
							<div className="form-group">
								<label htmlFor="phone">Số điện thoại</label>
								<input
									type="tel"
									id="phone"
									name="phone"
									placeholder="Nhập số điện thoại"
									value={formData.phone}
									onChange={handleChange}
									required
								/>
							</div>
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

						<div className="form-group">
							<label htmlFor="confirmPassword">
								Xác nhận mật khẩu
							</label>
							<div className="password-input">
								<input
									type={
										showConfirmPassword
											? "text"
											: "password"
									}
									id="confirmPassword"
									name="confirmPassword"
									placeholder="Nhập lại mật khẩu"
									value={formData.confirmPassword}
									onChange={handleChange}
									required
								/>
								<button
									type="button"
									className="password-toggle"
									onClick={() =>
										setShowConfirmPassword(
											!showConfirmPassword,
										)
									}
								>
									{showConfirmPassword ? (
										<EyeOff size={20} />
									) : (
										<Eye size={20} />
									)}
								</button>
							</div>
						</div>

						{error && <p className="auth-error">{error}</p>}

						<label className="checkbox-label terms">
							<input type="checkbox" required />
							<span>
								Tôi đồng ý với{" "}
								<Link to="/terms">Điều khoản dịch vụ</Link> và{" "}
								<Link to="/privacy">Chính sách bảo mật</Link>
							</span>
						</label>

						<button
							type="submit"
							className="auth-submit"
							disabled={loading}
						>
							{loading ? "Đang tạo tài khoản..." : "Đăng ký"}
						</button>
					</form>

					<p className="auth-footer">
						Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
					</p>
				</div>
			</div>
		</div>
	);
};

export default Register;
