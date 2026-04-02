const mongoose = require('mongoose');
const Vendor = require('../models/Vendor'); // I'll create this model file next

// @desc    Get all vendors
// @route   GET /api/vendors
// @access  Private (Admin)
exports.getVendors = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        let query = {};
        if (search) {
            query = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { storeName: { $regex: search, $options: 'i' } },
                    { town: { $regex: search, $options: 'i' } },
                    { category: { $regex: search, $options: 'i' } },
                    { shopId: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const count = await Vendor.countDocuments(query);
        const vendors = await Vendor.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: vendors,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(count / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get vendor by ID
// @route   GET /api/vendors/:id
// @access  Private (Admin)
exports.getVendorById = async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.params.id);
        if (!vendor) {
            return res.status(404).json({ success: false, message: 'Vendor not found' });
        }
        res.json({
            success: true,
            data: vendor
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create new vendor
// @route   POST /api/vendors
// @access  Private (Admin)
exports.createVendor = async (req, res) => {
    try {
        const vendor = await Vendor.create(req.body);

        res.status(201).json({
            success: true,
            data: vendor
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
// @desc    Update vendor
// @route   PUT /api/vendors/:id
// @access  Private (Admin)
exports.updateVendor = async (req, res) => {
    try {
        const vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!vendor) {
            return res.status(404).json({ success: false, message: 'Vendor not found' });
        }

        res.json({
            success: true,
            data: vendor
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Toggle item stock status
// @route   PATCH /api/vendors/:id/items/:itemName/toggle-stock
// @access  Private (Admin)
exports.toggleItemStock = async (req, res) => {
    try {
        const { id, itemName } = req.params;
        const vendor = await Vendor.findById(id);

        if (!vendor) {
            return res.status(404).json({ success: false, message: 'Vendor not found' });
        }

        const item = vendor.items.find(i => i.name === itemName);
        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found in this shop' });
        }

        item.isOutOfStock = !item.isOutOfStock;
        await vendor.save();

        res.json({
            success: true,
            data: vendor
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete vendor
// @route   DELETE /api/vendors/:id
// @access  Private (Admin)
exports.deleteVendor = async (req, res) => {
    try {
        const vendor = await Vendor.findByIdAndDelete(req.params.id);

        if (!vendor) {
            return res.status(404).json({ success: false, message: 'Vendor not found' });
        }

        res.json({
            success: true,
            message: 'Vendor removed successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
