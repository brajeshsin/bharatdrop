const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, vendorController.getVendors);
router.get('/:id', protect, vendorController.getVendorById);
router.post('/', protect, vendorController.createVendor);
router.put('/:id', protect, vendorController.updateVendor);
router.delete('/:id', protect, vendorController.deleteVendor);
router.patch('/:id/items/:itemName/toggle-stock', protect, vendorController.toggleItemStock);

module.exports = router;
