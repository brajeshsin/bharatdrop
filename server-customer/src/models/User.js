const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true, unique: true },
    password: { type: String }, // Optional for OTP based auth
    otp: { type: String },
    otpExpires: { type: Date },
    role: {
        type: String,
        required: true,
        enum: ['CUSTOMER', 'VENDOR', 'DELIVERY', 'SELLER'],
        default: 'CUSTOMER'
    },
    // Partner/Vendor Specific Fields
    storeName: { type: String },
    businessCategory: { type: String },
    vehicleType: { type: String },
    address: { type: String },
    status: {
        type: String,
        enum: ['PENDING', 'ACTIVE', 'SUSPENDED'],
        default: 'ACTIVE'
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
