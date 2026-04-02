const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    customer: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true },
        mobile: { type: String, required: true }
    },
    vendor: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
        name: { type: String, required: true },
        shopId: { type: String }
    },
    items: [{
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        image: { type: String },
        unit: { type: String }
    }],
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
        type: String,
        enum: ['PENDING', 'ACCEPTED', 'READY', 'PICKED', 'DELIVERED', 'CANCELLED'],
        default: 'PENDING'
    },
    paymentMethod: {
        type: String,
        enum: ['cod', 'upi'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'FAILED'],
        default: 'PENDING'
    },
    upiDetails: {
        refNumber: { type: String },
        screenshot: { type: String }
    },
    deliveryAddress: {
        address: { type: String, required: true },
        village: { type: String },
        landmark: { type: String },
        pincode: { type: String }
    },
    statusTimeline: [{
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
