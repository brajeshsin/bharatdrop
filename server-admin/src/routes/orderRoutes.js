const express = require('express');
const router = express.Router();
const {
    getAllOrders,
    getOrderById,
    getOrdersByGroupId,
    updateOrderStatus,
    updatePaymentStatus,
    getStats
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/stats', getStats);
router.get('/', getAllOrders);
router.get('/group/:groupId', getOrdersByGroupId);
router.get('/:id', getOrderById);
router.patch('/:id/status', updateOrderStatus);
router.patch('/:id/payment', updatePaymentStatus);

module.exports = router;
