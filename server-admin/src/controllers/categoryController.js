const Category = require('../models/Category');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res) => {
    try {
        const { section } = req.query;
        let query = {};
        if (section) {
            query.section = section;
        }

        const categories = await Category.find(query).sort({ name: 1 });
        res.json({
            success: true,
            categories
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Private (Admin)
exports.createCategory = async (req, res) => {
    try {
        const category = await Category.create(req.body);
        res.status(201).json({
            success: true,
            category
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Seed categories (for initial setup)
// @route   POST /api/categories/seed
// @access  Private (Admin)
exports.seedCategories = async (req, res) => {
    try {
        const categories = [
            { name: "Grocery", image: "/images/generated/grocery.png", color: "bg-emerald-50 text-emerald-600", section: "Essential" },
            { name: "Medicine", image: "/images/generated/medicine.png", color: "bg-red-50 text-red-600", section: "Essential" },
            { name: "Dairy", image: "https://images.unsplash.com/photo-1628088062854-d1870b4553ad?auto=format&fit=crop&q=80&w=400", color: "bg-blue-50 text-blue-600", section: "Essential" },
            { name: "Bakery", image: "/images/generated/bakery.png", color: "bg-orange-50 text-orange-600", section: "Essential" },
            { name: "Vegetables", image: "/images/generated/vegetables.png", color: "bg-green-50 text-green-600", section: "Essential" },
            { name: "Meat", image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&q=80&w=400", color: "bg-rose-50 text-rose-600", section: "Food" },
            { name: "Dhaba", image: "https://images.unsplash.com/photo-1585933423032-b5fbd8a3bc44?auto=format&fit=crop&q=80&w=400", color: "bg-orange-50 text-orange-600", section: "Food" },
            { name: "Fast Food", image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&q=80&w=400", color: "bg-blue-50 text-blue-600", section: "Food" },
            { name: "Restaurant", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=400", color: "bg-amber-50 text-amber-600", section: "Food" },
            { name: "Pharmacy", image: "/images/generated/medicine.png", color: "bg-red-50 text-red-600", section: "Health" },
            { name: "Sweets & Snacks", image: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&q=80&w=400", color: "bg-yellow-50 text-yellow-600", section: "Food" },
            { name: "Fruits & Veg", image: "/images/generated/vegetables.png", color: "bg-green-50 text-green-600", section: "Essential" },
        ];

        await Category.deleteMany({});
        const createdCategories = await Category.insertMany(categories);

        res.status(201).json({
            success: true,
            message: "Categories seeded successfully",
            count: createdCategories.length
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
