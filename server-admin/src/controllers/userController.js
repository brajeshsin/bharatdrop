const mongoose = require('mongoose');

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
            id: user._id,
            name: user.name || 'N/A',
            email: user.email || 'N/A',
            mobile: user.mobile || 'N/A',
            role: user.role || 'CUSTOMER',
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
