const mongoose = require('mongoose');

const heroContentSchema = new mongoose.Schema({
    images: [{
        type: String,
        required: [true, 'At least one image is required']
    }],
    title: {
        type: String,
        required: [true, 'Hero title is required'],
        default: "Hyperlocal Village Hub"
    },
    subtitle: {
        type: String,
        required: [true, 'Hero subtitle is required'],
        default: "TOWN'S BEST BAZAAR AT YOUR DOORSTEP."
    },
    description: {
        type: String,
        required: [true, 'Hero description is required'],
        default: "Order fresh groceries, medicines, and daily needs from town vendors directly to your village within 30 minutes."
    },
    deliveryDuration: {
        type: String,
        required: [true, 'Delivery duration is required'],
        default: "30 Mins"
    },
    carouselTimer: {
        type: Number,
        default: 5
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('HeroContent', heroContentSchema);
