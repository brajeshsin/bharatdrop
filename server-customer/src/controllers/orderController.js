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
        const groupId = `TRANS-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

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
                groupId,
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

// @desc    Get vendor orders
// @route   GET /api/orders/vendor/orders
// @access  Private (Vendor)
exports.getVendorOrders = async (req, res) => {
    try {
        let userMobile = req.user.mobile;
        if (!userMobile) {
            const user = await User.findById(req.user.id);
            if (user) userMobile = user.mobile;
        }

        if (!userMobile) {
            return res.status(401).json({ success: false, message: 'User identification failed' });
        }

        const adminDb = mongoose.connection.useDb('bharatdrop_admin');
        const Vendor = adminDb.model('Vendor', require('../models/Vendor').schema);

        const vendor = await Vendor.findOne({ phone: userMobile });
        if (!vendor) {
            return res.status(404).json({ success: false, message: 'Vendor profile not found' });
        }

        const orders = await Order.find({ 'vendor.id': vendor._id.toString() }).sort({ createdAt: -1 });

        res.json({ success: true, orders });
    } catch (error) {
        console.error('Get Vendor Orders Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get vendor order by ID
// @route   GET /api/orders/vendor/orders/:id
// @access  Private (Vendor)
exports.getVendorOrderById = async (req, res) => {
    try {
        let userMobile = req.user.mobile;
        if (!userMobile) {
            const user = await User.findById(req.user.id);
            if (user) userMobile = user.mobile;
        }

        if (!userMobile) {
            return res.status(401).json({ success: false, message: 'User identification failed' });
        }

        const adminDb = mongoose.connection.useDb('bharatdrop_admin');
        const Vendor = adminDb.model('Vendor', require('../models/Vendor').schema);
        const vendor = await Vendor.findOne({ phone: userMobile });

        if (!vendor) {
            return res.status(404).json({ success: false, message: 'Vendor profile not found' });
        }

        const order = await Order.findOne({ 
            $or: [{ _id: req.params.id }, { orderId: req.params.id }],
            'vendor.id': vendor._id.toString() 
        });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found or unauthorized' });
        }

        res.json({ success: true, order });
    } catch (error) {
        console.error('Get Vendor Order By ID Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update order status by vendor
// @route   PATCH /api/orders/vendor/orders/:id/status
// @access  Private (Vendor)
exports.updateVendorOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        // Include common status names across the app
        const validStatuses = ['PENDING', 'ACCEPTED', 'READY', 'READY_FOR_PICKUP', 'PICKED', 'DELIVERED', 'CANCELLED'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        let userMobile = req.user.mobile;
        if (!userMobile) {
            const user = await User.findById(req.user.id);
            if (user) userMobile = user.mobile;
        }

        if (!userMobile) {
             return res.status(401).json({ success: false, message: 'User identification failed' });
        }

        const adminDb = mongoose.connection.useDb('bharatdrop_admin');
        const Vendor = adminDb.model('Vendor', require('../models/Vendor').schema);
        const vendor = await Vendor.findOne({ phone: userMobile });

        if (!vendor) {
            return res.status(404).json({ success: false, message: 'Vendor profile not found' });
        }

        const order = await Order.findOne({ 
            _id: req.params.id,
            'vendor.id': vendor._id.toString()
        });

        if (!order) {
             return res.status(404).json({ success: false, message: 'Order not found or unauthorized' });
        }

        order.status = status;
        order.statusTimeline.push({ status, timestamp: new Date() });
        await order.save();

        res.json({ success: true, message: `Order status updated to ${status}`, order });
    } catch (error) {
        console.error('Update Vendor Order Status Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
