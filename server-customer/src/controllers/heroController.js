const mongoose = require('mongoose');

// @desc    Get hero content
// @route   GET /api/hero
// @access  Public
exports.getHeroContent = async (req, res) => {
    try {
        const adminDb = mongoose.connection.useDb('bharatdrop_admin');

        // Check if model already exists on this connection to avoid OverwriteModelError
        const HeroContent = adminDb.models.HeroContent || adminDb.model('HeroContent', new mongoose.Schema({
            images: [String],
            title: String,
            subtitle: String,
            description: String,
            deliveryDuration: String,
            carouselTimer: Number,
            isActive: { type: Boolean, default: true }
        }, { timestamps: true }));

        let hero = await HeroContent.findOne({ isActive: true });

        if (!hero) {
            return res.status(404).json({
                success: false,
                message: 'Hero content not found'
            });
        }

        res.status(200).json({
            success: true,
            data: hero
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
