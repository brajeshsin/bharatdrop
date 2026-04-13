const express = require('express');
const router = express.Router();
const {
    createOrder,
    getMyOrders,
    getOrderById,
    getVendorOrders,
    updateVendorOrderStatus
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createOrder);
router.get('/my-orders', getMyOrders);
router.get('/vendor/orders', getVendorOrders);
router.patch('/vendor/orders/:id/status', updateVendorOrderStatus);
router.get('/:id', getOrderById);

module.exports = router;
