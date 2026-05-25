const Ticket = require('../models/Ticket');
const User = require('../models/User');

// @desc    Create a new support ticket
// @route   POST /api/tickets
// @access  Private
exports.createTicket = async (req, res) => {
    try {
        const { category, subject, description, priority, orderId } = req.body;

        if (!category || !subject || !description) {
            return res.status(400).json({ success: false, message: 'Please fill in all required fields' });
        }

        // Fetch user from DB to get their actual name and role
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const ticket = await Ticket.create({
            userId: user._id,
            name: user.name,
            role: user.role,
            category,
            subject,
            description,
            priority: priority || 'MEDIUM',
            orderId: orderId || '',
            status: 'OPEN',
            messages: [{
                sender: 'USER',
                senderId: user._id,
                senderName: user.name,
                message: description,
                createdAt: new Date()
            }]
        });

        res.status(201).json({
            success: true,
            message: 'Ticket created successfully',
            ticket
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all tickets for the logged in user
// @route   GET /api/tickets
// @access  Private
exports.getMyTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find({ userId: req.user.id }).sort({ createdAt: -1 });

        res.json({
            success: true,
            tickets
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get details of a single ticket
// @route   GET /api/tickets/:id
// @access  Private
exports.getTicketDetails = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        // Ensure user owns this ticket
        if (ticket.userId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to view this ticket' });
        }

        res.json({
            success: true,
            ticket
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Reply to a support ticket (from user side)
// @route   POST /api/tickets/:id/messages
// @access  Private
exports.replyToTicket = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, message: 'Message content is required' });
        }

        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        // Ensure user owns this ticket
        if (ticket.userId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to reply to this ticket' });
        }

        // Append message
        ticket.messages.push({
            sender: 'USER',
            senderId: ticket.userId,
            senderName: ticket.name,
            message: message.trim(),
            createdAt: new Date()
        });

        // Set status back to OPEN when the user replies, indicating they are still active/reopening
        ticket.status = 'OPEN';

        await ticket.save();

        res.json({
            success: true,
            message: 'Reply sent successfully',
            ticket
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update user typing status
// @route   POST /api/tickets/:id/typing
// @access  Private
exports.updateTypingStatus = async (req, res) => {
    try {
        const { isTyping } = req.body;
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        if (ticket.userId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to update typing status for this ticket' });
        }

        ticket.userTyping = !!isTyping;
        ticket.typingLastUpdatedAt = new Date();
        await ticket.save();

        res.json({ success: true, userTyping: ticket.userTyping });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
