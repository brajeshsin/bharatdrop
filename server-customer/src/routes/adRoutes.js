const express = require('express');
const router = express.Router();
const adController = require('../controllers/adController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', adController.getAds);
router.post('/', protect, adController.createAd);
router.delete('/:id', protect, adController.deleteAd);

module.exports = router;
