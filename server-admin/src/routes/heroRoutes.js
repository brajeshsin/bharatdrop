const express = require('express');
const router = express.Router();
const { getHeroContent, updateHeroContent } = require('../controllers/heroController');
const { protect } = require('../middleware/authMiddleware');

// Public route for customer app
router.get('/', getHeroContent);

// Protected routes for admin
router.put('/', protect, updateHeroContent);

module.exports = router;
