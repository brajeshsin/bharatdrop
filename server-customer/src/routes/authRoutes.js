const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', authController.login);
router.post('/request-otp', authController.requestOtp);
router.post('/verify-otp', authController.verifyOtp);
router.get('/me', protect, authController.getMe);
router.patch('/status', protect, authController.updateStatus);
router.patch('/documents', protect, authController.updateDocuments);

module.exports = router;
