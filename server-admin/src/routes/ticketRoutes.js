const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, ticketController.getAllTickets);

router.route('/:id')
    .get(protect, ticketController.getTicketById)
    .put(protect, ticketController.updateTicket);

router.route('/:id/messages')
    .post(protect, ticketController.replyToTicket);

router.post('/:id/typing', protect, ticketController.updateTypingStatus);

module.exports = router;
