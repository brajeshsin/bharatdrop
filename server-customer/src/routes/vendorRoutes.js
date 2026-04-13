const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', vendorController.getVendors);
router.get('/me', protect, vendorController.getMyVendorProfile);
router.put('/me/inventory', protect, vendorController.updateVendorInventory);
router.get('/:id', vendorController.getVendorById);
router.patch('/me/shop-status', protect, vendorController.updateShopStatus);

module.exports = router;
