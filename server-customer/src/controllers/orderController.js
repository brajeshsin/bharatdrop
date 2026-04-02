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

        const adminDb = mongoose.connection.useDb('bharatdrop_admin');
        const Vendor = adminDb.model('Vendor', require('../models/Vendor').schema);

        const createdOrders = [];

        for (const shop of shops) {
            // Fetch latest vendor data to verify prices and stock
            const vendor = await Vendor.findById(shop.id);
            if (!vendor) {
                return res.status(404).json({ success: false, message: `Vendor ${shop.name} no longer available` });
            }

            const verifiedItems = [];
            let shopSubtotal = 0;

            for (const item of shop.items) {
                const dbItem = vendor.items.find(i => i.name === item.name);

                if (!dbItem) {
                    return res.status(400).json({ success: false, message: `Item ${item.name} is no longer available at ${shop.name}` });
                }

                // 1. Availability/Manual Out of Stock Validation
                if (dbItem.isOutOfStock) {
                    return res.status(400).json({
                        success: false,
                        message: `${item.name} is currently out of stock at ${shop.name}.`
                    });
                }

                // 2. Price Validation
                if (dbItem.price !== item.price) {
                    return res.status(400).json({
                        success: false,
                        message: `Price for ${item.name} has changed from ₹${item.price} to ₹${dbItem.price}. Please refresh your cart.`
                    });
                }

                // 2. Stock Validation
                if (dbItem.stock < item.qty) {
                    return res.status(400).json({
                        success: false,
                        message: `Only ${dbItem.stock} units of ${item.name} available. You requested ${item.qty}.`
                    });
                }

                verifiedItems.push({
                    name: dbItem.name,
                    price: dbItem.price,
                    quantity: item.qty,
                    image: dbItem.image,
                    unit: dbItem.unit
                });

                shopSubtotal += (dbItem.price * item.qty);

                // 3. Decrement Stock
                dbItem.stock -= item.qty;
            }

            // Save updated vendor stock
            await vendor.save();

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
                    shopId: vendor.shopId || 'N/A'
                },
                items: verifiedItems,
                subtotal: shopSubtotal,
                deliveryFee: 20,
                total: shopSubtotal + 20,
                paymentMethod,
                upiDetails: paymentMethod === 'upi' ? upiDetails : undefined,
                deliveryAddress,
                status: 'PENDING',
                statusTimeline: [{ status: 'PENDING', timestamp: new Date() }]
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
