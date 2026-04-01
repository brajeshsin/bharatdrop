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
            { status },
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
