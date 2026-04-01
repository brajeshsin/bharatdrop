const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        unique: true,
        trim: true
    },
    image: {
        type: String,
        required: [true, 'Category image is required']
    },
    color: {
        type: String,
        default: 'bg-slate-50 text-slate-600'
    },
    section: {
        type: String,
        required: [true, 'Section is required'],
        enum: ['Essential', 'Food', 'Health', 'Specialty'],
        default: 'Essential'
    }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
