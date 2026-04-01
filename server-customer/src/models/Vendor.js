const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Owner name is required'],
        trim: true
    },
    storeName: {
        type: String,
        required: [true, 'Store name is required'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['Sweets & Snacks', 'Fruits & Veg', 'Grocery', 'Restaurant', 'Pharmacy', 'Meat', 'Dhaba', 'Fast Food', 'Medicine', 'Dairy'],
        default: 'Grocery'
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    town: {
        type: String,
        required: [true, 'Town/Village is required'],
        trim: true
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Blocked'],
        default: 'Active'
    },
    image: {
        type: String,
        default: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800'
    },
    address: {
        type: String,
        trim: true
    },
    shopId: {
        type: String,
        unique: true
    },
    items: [{
        name: { type: String, required: true },
        price: { type: Number, required: true },
        image: { type: String },
        unit: { type: String }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Vendor', vendorSchema);
