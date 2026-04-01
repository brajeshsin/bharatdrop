const Ad = require('../models/Ad');

// @desc Get all active ads
// @route GET /api/ads
// @access Public
exports.getAds = async (req, res) => {
    try {
        const ads = await Ad.find({ active: true }).sort({ priority: -1, createdAt: -1 });
        res.json({ success: true, ads });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc Create a new ad
// @route POST /api/ads
// @access Private (Admin only - for now just protected by awareness)
exports.createAd = async (req, res) => {
    try {
        const ad = await Ad.create(req.body);
        res.status(201).json({ success: true, ad });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc Delete an ad
// @route DELETE /api/ads/:id
exports.deleteAd = async (req, res) => {
    try {
        await Ad.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Ad removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
