const mongoose = require('mongoose');
const TicketSchema = require('../models/Ticket').schema;

// Helper: Get Ticket model connected to the customer database
const getTicketModel = () => {
    const customerDb = mongoose.connection.useDb('bharatdrop_customer');
    return customerDb.model('Ticket', TicketSchema);
};

// @desc    Get all tickets across platforms
// @route   GET /api/tickets
// @access  Private (Admin)
exports.getAllTickets = async (req, res) => {
    try {
        const { status, priority, role, search } = req.query;
        const Ticket = getTicketModel();

        let query = {};

        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (role) query.role = role.toUpperCase();

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { subject: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const tickets = await Ticket.find(query).sort({ updatedAt: -1 });

        res.json({
            success: true,
            tickets
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get ticket by ID
// @route   GET /api/tickets/:id
// @access  Private (Admin)
exports.getTicketById = async (req, res) => {
    try {
        const Ticket = getTicketModel();
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        res.json({
            success: true,
            ticket
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update ticket status and priority
// @route   PUT /api/tickets/:id
// @access  Private (Admin)
exports.updateTicket = async (req, res) => {
    try {
        const { status, priority } = req.body;
        const Ticket = getTicketModel();

        const updates = {};
        if (status) {
            const validStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ success: false, message: 'Invalid status value' });
            }
            updates.status = status;
        }

        if (priority) {
            const validPriorities = ['LOW', 'MEDIUM', 'HIGH'];
            if (!validPriorities.includes(priority)) {
                return res.status(400).json({ success: false, message: 'Invalid priority value' });
            }
            updates.priority = priority;
        }

        const ticket = await Ticket.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true }
        );

        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        res.json({
            success: true,
            message: 'Ticket updated successfully',
            ticket
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Reply to a ticket as Admin
// @route   POST /api/tickets/:id/messages
// @access  Private (Admin)
exports.replyToTicket = async (req, res) => {
    try {
        const { message, status } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, message: 'Message content is required' });
        }

        const Ticket = getTicketModel();
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        // Add admin message
        ticket.messages.push({
            sender: 'ADMIN',
            senderId: req.admin?.id || null,
            senderName: req.admin?.name || 'Support Admin',
            message: message.trim(),
            createdAt: new Date()
        });

        // Set status to IN_PROGRESS (default after reply) or admin-specified status (e.g. RESOLVED)
        if (status) {
            const validStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
            if (validStatuses.includes(status)) {
                ticket.status = status;
            }
        } else {
            ticket.status = 'IN_PROGRESS';
        }

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

// @desc    Update admin typing status
// @route   POST /api/tickets/:id/typing
// @access  Private
exports.updateTypingStatus = async (req, res) => {
    try {
        const { isTyping } = req.body;
        const Ticket = getTicketModel();
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        ticket.adminTyping = !!isTyping;
        ticket.typingLastUpdatedAt = new Date();
        await ticket.save();

        res.json({ success: true, adminTyping: ticket.adminTyping });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
