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
        enum: ['CUSTOMER', 'VENDOR', 'DELIVERY'],
        default: 'CUSTOMER'
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
