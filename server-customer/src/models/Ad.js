const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
    title: { type: String, required: true },
    imageUrl: { type: String, required: true },
    link: { type: String }, // Optional link to a category or product
    category: {
        type: String,
        enum: ['HERO', 'PROMO', 'BANNER'],
        default: 'HERO'
    },
    active: { type: Boolean, default: true },
    priority: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Ad', adSchema);
