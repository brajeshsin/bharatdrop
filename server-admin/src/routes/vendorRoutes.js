const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, vendorController.getVendors);
router.post('/', protect, vendorController.createVendor);
router.put('/:id', protect, vendorController.updateVendor);
router.delete('/:id', protect, vendorController.deleteVendor);

module.exports = router;
