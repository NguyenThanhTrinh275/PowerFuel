/** @format */

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import "./ChatButton.css";

const ChatButton = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [messages, setMessages] = useState([
		{
			id: 1,
			type: "bot",
			text: "Xin chào! 👋 Tôi là trợ lý AI của PowerFuel. Tôi có thể giúp bạn tìm sản phẩm phù hợp, tư vấn dinh dưỡng hoặc giải đáp thắc mắc. Bạn cần hỗ trợ gì?",
		},
	]);
	const [inputValue, setInputValue] = useState("");
	const [isTyping, setIsTyping] = useState(false);
	const messagesEndRef = useRef(null);
	const inputRef = useRef(null);
	const messageIdRef = useRef(2);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	useEffect(() => {
		if (isOpen && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isOpen]);

	const handleSendMessage = async (e) => {
		e.preventDefault();
		if (!inputValue.trim()) return;

		const userMessageId = messageIdRef.current++;
		const userMessage = {
			id: userMessageId,
			type: "user",
			text: inputValue.trim(),
		};

		setMessages((prev) => [...prev, userMessage]);
		setInputValue("");
		setIsTyping(true);

		// Simulate AI response (thay thế bằng API call thực tế)
		setTimeout(() => {
			const botResponse = {
				id: messageIdRef.current++,
				type: "bot",
				text: getBotResponse(userMessage.text),
			};
			setMessages((prev) => [...prev, botResponse]);
			setIsTyping(false);
		}, 1000);
	};

	// Mock response function - thay thế bằng API call thực tế
	const getBotResponse = (userText) => {
		const text = userText.toLowerCase();

		if (text.includes("whey") || text.includes("protein")) {
			return "Chúng tôi có nhiều loại Whey Protein chất lượng cao! 💪 Bạn có thể xem Gold Standard Whey - sản phẩm bán chạy nhất của chúng tôi. Bạn muốn tôi giới thiệu thêm về sản phẩm này không?";
		}

		if (text.includes("giá") || text.includes("bao nhiêu")) {
			return "Giá sản phẩm của chúng tôi dao động từ 450.000đ đến 2.000.000đ tùy loại. Bạn có ngân sách cụ thể nào không? Tôi sẽ gợi ý sản phẩm phù hợp cho bạn!";
		}

		if (text.includes("giao hàng") || text.includes("ship")) {
			return "Chúng tôi giao hàng toàn quốc! 🚚 Miễn phí ship cho đơn hàng từ 500.000đ. Thời gian giao hàng từ 2-5 ngày tùy khu vực.";
		}

		if (text.includes("tăng cân") || text.includes("mass")) {
			return "Để tăng cân hiệu quả, tôi khuyên bạn dùng Mass Gainer kết hợp với chế độ tập luyện phù hợp. Serious Mass là sản phẩm được nhiều người tin dùng. Bạn muốn biết thêm chi tiết không?";
		}

		if (text.includes("giảm cân") || text.includes("giảm mỡ")) {
			return "Để giảm cân, bạn nên kết hợp Whey Protein Isolate với chế độ ăn kiểm soát calories. Tôi có thể gợi ý một số sản phẩm phù hợp cho bạn!";
		}

		if (
			text.includes("cảm ơn") ||
			text.includes("thank") ||
			text.includes("thanks")
		) {
			return "Không có gì! 😊 Nếu bạn cần hỗ trợ thêm, cứ hỏi tôi nhé. Chúc bạn có trải nghiệm mua sắm tuyệt vời!";
		}

		return "Cảm ơn bạn đã liên hệ! Tôi sẽ cố gắng hỗ trợ bạn tốt nhất. Bạn có thể cho tôi biết thêm chi tiết về nhu cầu của mình không? Ví dụ: loại sản phẩm, mục tiêu tập luyện, hoặc ngân sách dự kiến.";
	};

	const quickReplies = [
		"Tư vấn Whey Protein",
		"Sản phẩm tăng cân",
		"Chính sách giao hàng",
	];

	const handleQuickReply = (text) => {
		setInputValue(text);
		inputRef.current?.focus();
	};

	return (
		<>
			{/* Chat Window */}
			<div className={`chat-window ${isOpen ? "open" : ""}`}>
				<div className="chat-header">
					<div className="chat-header-info">
						<div className="chat-avatar">
							<Bot size={24} />
						</div>
						<div className="chat-header-text">
							<h4>Trợ lý AI PowerFuel</h4>
							<span className="chat-status">
								<span className="status-dot"></span>
								Đang hoạt động
							</span>
						</div>
					</div>
					<button
						className="chat-close"
						onClick={() => setIsOpen(false)}
					>
						<X size={20} />
					</button>
				</div>

				<div className="chat-messages">
					{messages.map((message) => (
						<div
							key={message.id}
							className={`chat-message ${message.type}`}
						>
							<div className="message-avatar">
								{message.type === "bot" ? (
									<Bot size={18} />
								) : (
									<User size={18} />
								)}
							</div>
							<div className="message-content">
								<p>{message.text}</p>
							</div>
						</div>
					))}

					{isTyping && (
						<div className="chat-message bot">
							<div className="message-avatar">
								<Bot size={18} />
							</div>
							<div className="message-content typing">
								<span></span>
								<span></span>
								<span></span>
							</div>
						</div>
					)}

					<div ref={messagesEndRef} />
				</div>

				{/* Quick Replies */}
				{messages.length === 1 && (
					<div className="quick-replies">
						{quickReplies.map((reply, index) => (
							<button
								key={index}
								className="quick-reply-btn"
								onClick={() => handleQuickReply(reply)}
							>
								{reply}
							</button>
						))}
					</div>
				)}

				<form className="chat-input-form" onSubmit={handleSendMessage}>
					<input
						ref={inputRef}
						type="text"
						placeholder="Nhập tin nhắn..."
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
					/>
					<button
						type="submit"
						className="send-btn"
						disabled={!inputValue.trim()}
					>
						<Send size={20} />
					</button>
				</form>
			</div>

			{/* Floating Button */}
			<button
				className={`chat-fab ${isOpen ? "open" : ""}`}
				onClick={() => setIsOpen(!isOpen)}
				aria-label="Mở chat hỗ trợ"
			>
				<span className="fab-icon">
					{isOpen ? <X size={28} /> : <MessageCircle size={28} />}
				</span>
				{!isOpen && <span className="fab-pulse"></span>}
			</button>
		</>
	);
};

export default ChatButton;
