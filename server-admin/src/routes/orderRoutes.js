const express = require('express');
const router = express.Router();
const {
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    updatePaymentStatus
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getAllOrders);
router.get('/:id', getOrderById);
router.patch('/:id/status', updateOrderStatus);
router.patch('/:id/payment', updatePaymentStatus);

module.exports = router;
