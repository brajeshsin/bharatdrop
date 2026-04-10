const mongoose = require('mongoose');

// @desc    Get all active vendors
// @route   GET /api/vendors
// @access  Public
exports.getVendors = async (req, res) => {
    try {
        const { category } = req.query;

        const adminDb = mongoose.connection.useDb('bharatdrop_admin');
        // We can reuse the schema from the existing model file
        const Vendor = adminDb.model('Vendor', require('../models/Vendor').schema);

        let query = { status: 'Active' };

        if (category && category !== 'All') {
            query.category = category;
        }

        const vendors = await Vendor.find(query).sort({ createdAt: -1 });

        res.json({
            success: true,
            vendors
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get vendor by ID
// @route   GET /api/vendors/:id
// @access  Public
exports.getVendorById = async (req, res) => {
    try {
        const adminDb = mongoose.connection.useDb('bharatdrop_admin');
        const Vendor = adminDb.model('Vendor', require('../models/Vendor').schema);

        const vendor = await Vendor.findById(req.params.id);
        if (!vendor) {
            return res.status(404).json({ success: false, message: 'Vendor not found' });
        }
        res.json({ success: true, vendor });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// @desc    Get current vendor's profile
// @route   GET /api/vendors/me
// @access  Private (Vendor)
exports.getMyVendorProfile = async (req, res) => {
    try {
        const adminDb = mongoose.connection.useDb('bharatdrop_admin');
        const Vendor = adminDb.model('Vendor', require('../models/Vendor').schema);

        // Find vendor by user's mobile (assuming they are linked via phone)
        let userMobile = req.user.mobile;

        // Fallback: If mobile is missing in token, fetch from DB
        if (!userMobile) {
            const User = require('../models/User');
            const user = await User.findById(req.user.id);
            if (user) userMobile = user.mobile;
        }

        if (!userMobile) {
            return res.status(401).json({ success: false, message: 'User identification failed' });
        }

        const vendor = await Vendor.findOne({ phone: userMobile });
        if (!vendor) {
            return res.status(404).json({ success: false, message: 'Vendor profile not found' });
        }
        res.json({ success: true, vendor });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update vendor inventory
// @route   PUT /api/vendors/me/inventory
// @access  Private (Vendor)
exports.updateVendorInventory = async (req, res) => {
    try {
        const adminDb = mongoose.connection.useDb('bharatdrop_admin');
        const Vendor = adminDb.model('Vendor', require('../models/Vendor').schema);

        const { items } = req.body;
        let userMobile = req.user.mobile;

        // Fallback: If mobile is missing in token, fetch from DB
        if (!userMobile) {
            const User = require('../models/User');
            const user = await User.findById(req.user.id);
            if (user) userMobile = user.mobile;
        }

        if (!userMobile) {
            return res.status(401).json({ success: false, message: 'User identification failed' });
        }

        const vendor = await Vendor.findOneAndUpdate(
            { phone: userMobile },
            { $set: { items, updatedAt: new Date() } },
            { new: true, runValidators: true }
        );

        if (!vendor) {
            return res.status(404).json({ success: false, message: 'Vendor profile not found' });
        }

        res.json({
            success: true,
            message: 'Inventory updated successfully',
            items: vendor.items
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
