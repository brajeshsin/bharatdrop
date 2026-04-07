const mongoose = require('mongoose');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res) => {
    try {
        const { section } = req.query;

        const adminDb = mongoose.connection.useDb('bharatdrop_admin');

        // Use existing models if already defined on the connection
        const Category = adminDb.models.Category || adminDb.model('Category', new mongoose.Schema({
            name: { type: String, required: true },
            image: { type: String, required: true },
            color: { type: String },
            section: { type: String }
        }));

        const Vendor = adminDb.models.Vendor || adminDb.model('Vendor', new mongoose.Schema({
            category: { type: String },
            status: { type: String }
        }));

        // 1. Get unique categories that have active vendors
        const activeCategories = await Vendor.distinct('category', { status: 'Active' });

        // 2. Build query for Category
        let query = { name: { $in: activeCategories } };
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
