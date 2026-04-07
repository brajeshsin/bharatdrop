const HeroContent = require('../models/HeroContent');

exports.getHeroContent = async (req, res) => {
    try {
        let hero = await HeroContent.findOne({ isActive: true });
        if (!hero) {
            // Create default if none exists
            hero = await HeroContent.create({});
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

exports.updateHeroContent = async (req, res) => {
    try {
        let hero = await HeroContent.findOne({ isActive: true });
        if (!hero) {
            hero = await HeroContent.create(req.body);
        } else {
            hero = await HeroContent.findByIdAndUpdate(hero._id, req.body, {
                new: true,
                runValidators: true
            });
        }
        res.status(200).json({
            success: true,
            data: hero
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
