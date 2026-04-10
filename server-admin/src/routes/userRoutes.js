const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, userController.getCustomers);
router.get('/pending', protect, userController.getPendingRegistrations);
router.post('/:id/approve', protect, userController.approveRegistration);
router.post('/:id/reject', protect, userController.rejectRegistration);

module.exports = router;
