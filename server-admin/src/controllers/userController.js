const mongoose = require('mongoose');
const Vendor = require('../models/Vendor');

// @desc    Get all customers from bharatdrop_customer database
// @route   GET /api/customers
// @access  Private (Admin)
exports.getCustomers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Use the connection to access the customer database
        const customerDb = mongoose.connection.useDb('bharatdrop_customer');
        const userCollection = customerDb.collection('users');

        // Build query for search
        let query = {};
        if (search) {
            query = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { mobile: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const usersCount = await userCollection.countDocuments(query);
        const users = await userCollection.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .toArray();

        // Transform data for frontend
        const transformedUsers = users.map(user => ({
            id: user._id.toString(),
            name: user.name || 'N/A',
            email: user.email || 'N/A',
            mobile: user.mobile || 'N/A',
            role: user.role || 'CUSTOMER',
            status: user.status || 'ACTIVE',
            createdAt: user.createdAt,
            totalOrders: Math.floor(Math.random() * 20),
            town: 'Rampur'
        }));

        res.json({
            success: true,
            data: transformedUsers,
            pagination: {
                total: usersCount,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(usersCount / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all pending registrations
// @route   GET /api/customers/pending
// @access  Private (Admin)
exports.getPendingRegistrations = async (req, res) => {
    try {
        const customerDb = mongoose.connection.useDb('bharatdrop_customer');
        const userCollection = customerDb.collection('users');

        const pendingUsers = await userCollection.find({
            status: 'PENDING',
            role: { $in: ['VENDOR', 'DELIVERY'] }
        }).sort({ createdAt: -1 }).toArray();

        res.json({
            success: true,
            data: pendingUsers.map(user => ({
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                role: user.role,
                storeName: user.storeName,
                businessCategory: user.businessCategory,
                vehicleType: user.vehicleType,
                address: user.address,
                createdAt: user.createdAt
            }))
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Approve registration
// @route   POST /api/customers/:id/approve
// @access  Private (Admin)
exports.approveRegistration = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`[Admin] Attempting to approve user: ${id}`);

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid User ID format' });
        }

        const customerDb = mongoose.connection.useDb('bharatdrop_customer');
        const userCollection = customerDb.collection('users');

        const objectId = new mongoose.Types.ObjectId(id);
        const user = await userCollection.findOne({ _id: objectId });

        if (!user) {
            console.error(`[Admin] User not found: ${id}`);
            return res.status(404).json({ success: false, message: 'User not found in customer database' });
        }

        // Update user status
        const updateResult = await userCollection.updateOne(
            { _id: objectId },
            { $set: { status: 'ACTIVE', updatedAt: new Date() } }
        );

        if (updateResult.modifiedCount === 0) {
            console.warn(`[Admin] User ${id} status was already ACTIVE or not updated`);
        }

        // If Vendor, create profile in bharatdrop_admin
        if (user.role === 'VENDOR') {
            try {
                const existingVendor = await Vendor.findOne({ phone: user.mobile });
                if (existingVendor) {
                    console.log(`[Admin] Vendor profile already exists for ${user.mobile}. Updating...`);
                    await Vendor.findOneAndUpdate(
                        { phone: user.mobile },
                        {
                            status: 'Active',
                            storeName: user.storeName || existingVendor.storeName,
                            category: user.businessCategory || existingVendor.category
                        }
                    );
                } else {
                    console.log(`[Admin] Creating new Vendor profile for ${user.storeName}`);
                    await Vendor.create({
                        name: user.name,
                        storeName: user.storeName || 'My Store',
                        category: user.businessCategory || 'Grocery',
                        phone: user.mobile,
                        email: user.email,
                        town: 'Rampur',
                        address: user.address,
                        status: 'Active'
                    });
                }
            } catch (vendorError) {
                console.error(`[Admin] Error during Vendor profile creation/update:`, vendorError);
                // We still report success for user activation, but log the vendor profile error
            }
        }

        res.json({ success: true, message: `${user.role} approved successfully` });
    } catch (error) {
        console.error(`[Admin] Approval process failed:`, error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Reject registration
// @route   POST /api/customers/:id/reject
// @access  Private (Admin)
exports.rejectRegistration = async (req, res) => {
    try {
        const { id } = req.params;
        const customerDb = mongoose.connection.useDb('bharatdrop_customer');
        const userCollection = customerDb.collection('users');

        const result = await userCollection.updateOne(
            { _id: new mongoose.Types.ObjectId(id) },
            { $set: { status: 'SUSPENDED', updatedAt: new Date() } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, message: 'Registration rejected' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
