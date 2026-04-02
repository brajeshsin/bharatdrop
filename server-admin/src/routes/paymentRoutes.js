const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, paymentController.getPaymentMethods);
router.patch('/:id/toggle', protect, paymentController.togglePaymentMethod);

module.exports = router;
