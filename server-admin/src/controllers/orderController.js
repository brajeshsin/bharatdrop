const mongoose = require('mongoose');
const OrderSchema = require('../models/Order').schema;

// @desc    Get all orders across platforms
// @route   GET /api/orders
// @access  Private (Admin)
exports.getAllOrders = async (req, res) => {
    try {
        const customerDb = mongoose.connection.useDb('bharatdrop_customer');
        const Order = customerDb.model('Order', OrderSchema);

        const orders = await Order.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            orders
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private (Admin)
exports.getOrderById = async (req, res) => {
    try {
        const customerDb = mongoose.connection.useDb('bharatdrop_customer');
        const Order = customerDb.model('Order', OrderSchema);

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.json({
            success: true,
            order
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get orders by group ID
// @route   GET /api/orders/group/:groupId
// @access  Private (Admin)
exports.getOrdersByGroupId = async (req, res) => {
    try {
        const { groupId } = req.params;
        const customerDb = mongoose.connection.useDb('bharatdrop_customer');
        const Order = customerDb.model('Order', OrderSchema);

        // 1. Try finding by groupId field
        let orders = await Order.find({ groupId }).sort({ vendorName: 1 });

        // 2. Fallback for old orders or single orders
        if (!orders || orders.length === 0) {
            // Check if it's the fallback key format: customerId_timestamp
            if (groupId.includes('_')) {
                const [customerId, timestamp] = groupId.split('_');
                if (mongoose.Types.ObjectId.isValid(customerId)) {
                    // Find orders for this customer within a 1-minute window of the timestamp
                    const startTime = new Date(parseInt(timestamp));
                    const endTime = new Date(startTime.getTime() + 60000); // 1 minute window

                    orders = await Order.find({
                        'customer.id': customerId,
                        createdAt: { $gte: startTime, $lt: endTime }
                    });
                }
            } else if (mongoose.Types.ObjectId.isValid(groupId)) {
                // If it's a valid ObjectId, maybe it's a direct order ID
                const singleOrder = await Order.findById(groupId);
                if (singleOrder) orders = [singleOrder];
            }
        }

        if (!orders || orders.length === 0) {
            return res.status(404).json({ success: false, message: 'No orders found for this reference' });
        }

        res.json({
            success: true,
            orders
        });
    } catch (error) {
        console.error('getOrdersByGroupId Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private (Admin)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['PENDING', 'ACCEPTED', 'READY', 'PICKED', 'DELIVERED', 'CANCELLED'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const customerDb = mongoose.connection.useDb('bharatdrop_customer');
        const Order = customerDb.model('Order', OrderSchema);

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            {
                status,
                $push: { statusTimeline: { status, timestamp: new Date() } }
            },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.json({
            success: true,
            message: `Order status updated to ${status}`,
            order
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update order payment status
// @route   PATCH /api/orders/:id/payment
// @access  Private (Admin)
exports.updatePaymentStatus = async (req, res) => {
    try {
        const { paymentStatus } = req.body;
        const validStatuses = ['PENDING', 'COMPLETED', 'FAILED'];

        if (!validStatuses.includes(paymentStatus)) {
            return res.status(400).json({ success: false, message: 'Invalid payment status' });
        }

        const customerDb = mongoose.connection.useDb('bharatdrop_customer');
        const Order = customerDb.model('Order', OrderSchema);

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { paymentStatus },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.json({
            success: true,
            message: `Payment status updated to ${paymentStatus}`,
            order
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get dashboard stats
// @route   GET /api/orders/stats
// @access  Private (Admin)
exports.getStats = async (req, res) => {
    try {
        const customerDb = mongoose.connection.useDb('bharatdrop_customer');
        const Order = customerDb.model('Order', OrderSchema);

        const adminDb = mongoose.connection.useDb('bharatdrop_admin');
        const Vendor = adminDb.model('Vendor', require('../models/Vendor').schema);

        const [totalOrders, revenueResult, activeVendors] = await Promise.all([
            Order.countDocuments(),
            Order.aggregate([
                { $match: { status: { $ne: 'CANCELLED' } } },
                { $group: { _id: null, total: { $sum: { $ifNull: ['$total', '$amount'] } } } }
            ]),
            Vendor.countDocuments({ status: 'Active' })
        ]);

        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
        const activeDeliveries = await Order.countDocuments({ status: { $in: ['ACCEPTED', 'READY', 'PICKED'] } });

        res.json({
            success: true,
            stats: {
                totalOrders,
                totalRevenue,
                activeVendors,
                activeDeliveries
            }
        });
    } catch (error) {
        console.error('getStats Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
