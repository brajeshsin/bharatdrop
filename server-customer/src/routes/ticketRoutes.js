const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, ticketController.createTicket)
    .get(protect, ticketController.getMyTickets);

router.route('/:id')
    .get(protect, ticketController.getTicketDetails);

router.route('/:id/messages')
    .post(protect, ticketController.replyToTicket);

router.post('/:id/typing', protect, ticketController.updateTypingStatus);

module.exports = router;
