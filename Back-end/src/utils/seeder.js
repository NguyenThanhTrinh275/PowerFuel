/** @format */

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User.model");
const Category = require("../models/Category.model");
const Product = require("../models/Product.model");

dotenv.config();

mongoose.connect(process.env.MONGODB_URI);

const categories = [
	{
		name: "Whey Protein",
		description:
			"Whey Protein là nguồn protein chất lượng cao từ sữa, hỗ trợ phát triển cơ bắp nhanh chóng.",
	},
	{
		name: "Mass Gainer",
		description:
			"Mass Gainer giúp tăng cân, tăng cơ cho người gầy khó tăng cân.",
	},
	{
		name: "BCAA & Amino",
		description:
			"BCAA và Amino Acids hỗ trợ phục hồi cơ bắp sau tập luyện.",
	},
	{
		name: "Pre-Workout",
		description: "Pre-Workout tăng năng lượng và hiệu suất tập luyện.",
	},
	{
		name: "Creatine",
		description:
			"Creatine tăng sức mạnh và hiệu suất trong các bài tập cường độ cao.",
	},
	{
		name: "Vitamin & Khoáng chất",
		description: "Vitamin và khoáng chất bổ sung thiết yếu cho sức khỏe.",
	},
];

const products = [
	{
		name: "Optimum Nutrition Gold Standard 100% Whey",
		description:
			"Gold Standard 100% Whey của Optimum Nutrition là sản phẩm whey protein bán chạy số 1 thế giới. Mỗi serving cung cấp 24g protein chất lượng cao, 5.5g BCAAs và 4g Glutamine.",
		shortDescription:
			"Whey Protein số 1 thế giới với 24g protein mỗi serving",
		price: 1890000,
		originalPrice: 2100000,
		discount: 10,
		brand: "Optimum Nutrition",
		stock: 50,
		weight: "2.27kg (5lbs)",
		flavor: [
			"Double Rich Chocolate",
			"Vanilla Ice Cream",
			"Strawberry Banana",
			"Cookies & Cream",
		],
		servings: 74,
		nutritionFacts: {
			calories: 120,
			protein: 24,
			carbs: 3,
			fat: 1,
			sugar: 1,
			fiber: 0,
		},
		isFeatured: true,
		tags: ["whey", "protein", "optimum nutrition", "gold standard"],
	},
	{
		name: "MuscleTech Nitro-Tech Whey Gold",
		description:
			"Nitro-Tech Whey Gold là công thức whey protein cao cấp từ MuscleTech với 24g protein và 5.5g BCAAs.",
		shortDescription: "Whey protein cao cấp với 24g protein",
		price: 1650000,
		brand: "MuscleTech",
		stock: 35,
		weight: "2.27kg (5lbs)",
		flavor: ["Double Rich Chocolate", "Vanilla", "Cookies & Cream"],
		servings: 76,
		nutritionFacts: {
			calories: 130,
			protein: 24,
			carbs: 4,
			fat: 2,
			sugar: 2,
			fiber: 0,
		},
		isFeatured: true,
		tags: ["whey", "protein", "muscletech", "nitro-tech"],
	},
	{
		name: "Serious Mass - Optimum Nutrition",
		description:
			"Serious Mass là sản phẩm tăng cân hàng đầu với 1250 calories và 50g protein mỗi serving. Lý tưởng cho người khó tăng cân.",
		shortDescription: "Mass gainer 1250 calories với 50g protein",
		price: 1750000,
		originalPrice: 1950000,
		discount: 10,
		brand: "Optimum Nutrition",
		stock: 30,
		weight: "5.44kg (12lbs)",
		flavor: ["Chocolate", "Vanilla", "Strawberry", "Banana"],
		servings: 16,
		nutritionFacts: {
			calories: 1250,
			protein: 50,
			carbs: 252,
			fat: 4,
			sugar: 20,
			fiber: 3,
		},
		isFeatured: true,
		tags: ["mass", "gainer", "tang can", "serious mass"],
	},
	{
		name: "Dymatize Super Mass Gainer",
		description:
			"Super Mass Gainer cung cấp 1280 calories và 52g protein chất lượng cao để hỗ trợ tăng cân hiệu quả.",
		shortDescription: "Mass gainer 1280 calories với 52g protein",
		price: 1450000,
		brand: "Dymatize",
		stock: 25,
		weight: "5.44kg (12lbs)",
		flavor: ["Rich Chocolate", "Gourmet Vanilla", "Strawberry"],
		servings: 16,
		nutritionFacts: {
			calories: 1280,
			protein: 52,
			carbs: 245,
			fat: 9,
			sugar: 18,
			fiber: 5,
		},
		tags: ["mass", "gainer", "tang can", "dymatize"],
	},
	{
		name: "XTEND Original BCAA",
		description:
			"XTEND là sản phẩm BCAA số 1 thế giới với tỷ lệ 2:1:1 (Leucine:Isoleucine:Valine), hỗ trợ phục hồi cơ bắp và tăng hiệu suất tập luyện.",
		shortDescription: "BCAA số 1 thế giới với tỷ lệ 2:1:1",
		price: 750000,
		brand: "Scivation",
		stock: 40,
		weight: "420g",
		flavor: ["Blue Raspberry", "Watermelon", "Mango", "Lemon Lime"],
		servings: 30,
		nutritionFacts: {
			calories: 0,
			protein: 0,
			carbs: 0,
			fat: 0,
			sugar: 0,
			fiber: 0,
		},
		isFeatured: true,
		tags: ["bcaa", "amino", "phuc hoi", "xtend"],
	},
	{
		name: "Cellucor C4 Original Pre-Workout",
		description:
			"C4 Original là pre-workout phổ biến nhất với công thức tăng năng lượng, sức mạnh và sự tập trung trong tập luyện.",
		shortDescription: "Pre-workout phổ biến nhất tăng năng lượng tập luyện",
		price: 650000,
		brand: "Cellucor",
		stock: 45,
		weight: "390g",
		flavor: [
			"Cherry Limeade",
			"Fruit Punch",
			"Watermelon",
			"Pink Lemonade",
		],
		servings: 60,
		nutritionFacts: {
			calories: 5,
			protein: 0,
			carbs: 1,
			fat: 0,
			sugar: 0,
			fiber: 0,
		},
		tags: ["pre-workout", "energy", "nang luong", "c4"],
	},
	{
		name: "MuscleTech Platinum Creatine",
		description:
			"Platinum Creatine cung cấp 5g creatine monohydrate tinh khiết mỗi serving, giúp tăng sức mạnh và hiệu suất tập luyện.",
		shortDescription: "Creatine monohydrate tinh khiết 5g mỗi serving",
		price: 450000,
		brand: "MuscleTech",
		stock: 60,
		weight: "400g",
		flavor: ["Unflavored"],
		servings: 80,
		nutritionFacts: {
			calories: 0,
			protein: 0,
			carbs: 0,
			fat: 0,
			sugar: 0,
			fiber: 0,
		},
		tags: ["creatine", "suc manh", "muscletech"],
	},
	{
		name: "Optimum Nutrition Opti-Men Multivitamin",
		description:
			"Opti-Men là vitamin tổng hợp cao cấp dành cho nam giới với hơn 75 thành phần hoạt chất hỗ trợ sức khỏe toàn diện.",
		shortDescription: "Vitamin tổng hợp cao cấp cho nam giới",
		price: 550000,
		brand: "Optimum Nutrition",
		stock: 55,
		weight: "150 viên",
		servings: 50,
		tags: ["vitamin", "multivitamin", "suc khoe", "opti-men"],
	},
];

const seedData = async () => {
	try {
		// Clear existing data
		await User.deleteMany();
		await Category.deleteMany();
		await Product.deleteMany();

		console.log("Data cleared...");

		// Create admin user
		await User.create({
			name: "Admin",
			email: "admin@wheymass.com",
			password: "admin123",
			role: "admin",
			phone: "0123456789",
		});

		console.log("Admin user created...");

		// Create categories
		const createdCategories = await Category.insertMany(categories);
		console.log("Categories created...");

		// Assign categories to products and create
		const productsWithCategory = products.map((product, index) => {
			let categoryIndex;
			if (product.name.toLowerCase().includes("whey")) {
				categoryIndex = 0; // Whey Protein
			} else if (
				product.name.toLowerCase().includes("mass") ||
				product.name.toLowerCase().includes("gainer")
			) {
				categoryIndex = 1; // Mass Gainer
			} else if (
				product.name.toLowerCase().includes("bcaa") ||
				product.name.toLowerCase().includes("amino")
			) {
				categoryIndex = 2; // BCAA & Amino
			} else if (
				product.name.toLowerCase().includes("pre-workout") ||
				product.name.toLowerCase().includes("c4")
			) {
				categoryIndex = 3; // Pre-Workout
			} else if (product.name.toLowerCase().includes("creatine")) {
				categoryIndex = 4; // Creatine
			} else {
				categoryIndex = 5; // Vitamin
			}

			return {
				...product,
				category: createdCategories[categoryIndex]._id,
			};
		});

		await Product.insertMany(productsWithCategory);
		console.log("Products created...");

		console.log("Data seeded successfully!");
		process.exit();
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
};

const destroyData = async () => {
	try {
		await User.deleteMany();
		await Category.deleteMany();
		await Product.deleteMany();

		console.log("Data destroyed!");
		process.exit();
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
};

if (process.argv[2] === "-d") {
	destroyData();
} else {
	seedData();
}
