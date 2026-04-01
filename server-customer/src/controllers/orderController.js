const Order = require('../models/Order');
const User = require('../models/User');
const mongoose = require('mongoose');

// @desc    Create new orders
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
    try {
        const { shops, paymentMethod, deliveryAddress, upiDetails } = req.body;

        if (!shops || !shops.length) {
            return res.status(400).json({ success: false, message: 'Cart is empty' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const createdOrders = [];

        for (const shop of shops) {
            const orderId = `BD-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

            const newOrder = new Order({
                orderId,
                customer: {
                    id: user._id,
                    name: user.name,
                    mobile: user.mobile
                },
                vendor: {
                    id: shop.id,
                    name: shop.name,
                    shopId: shop.shopId || 'N/A'
                },
                items: shop.items.map(item => ({
                    name: item.name,
                    price: item.price,
                    quantity: item.qty,
                    image: item.image,
                    unit: item.unit
                })),
                subtotal: shop.items.reduce((acc, item) => acc + (item.price * item.qty), 0),
                deliveryFee: 20,
                total: shop.items.reduce((acc, item) => acc + (item.price * item.qty), 0) + 20,
                paymentMethod,
                upiDetails: paymentMethod === 'upi' ? upiDetails : undefined,
                deliveryAddress,
                status: 'PENDING'
            });

            await newOrder.save();
            createdOrders.push(newOrder);
        }

        res.status(201).json({
            success: true,
            message: 'Orders placed successfully',
            orders: createdOrders
        });

    } catch (error) {
        console.error('Create Order Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ 'customer.id': req.user.id }).sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
    try {
        const id = req.params.id;
        const query = mongoose.Types.ObjectId.isValid(id)
            ? { _id: id }
            : { orderId: id };

        const order = await Order.findOne({
            ...query,
            'customer.id': req.user.id
        });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
