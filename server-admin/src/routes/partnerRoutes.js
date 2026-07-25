const express = require('express');
const router = express.Router();
const partnerController = require('../controllers/partnerController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', partnerController.getPartners);
router.get('/:id', partnerController.getPartnerById);
router.patch('/:id/status', partnerController.updatePartnerStatus);
router.delete('/:id', partnerController.deletePartner);

module.exports = router;
