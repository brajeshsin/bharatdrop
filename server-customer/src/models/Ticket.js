const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    name: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ['CUSTOMER', 'VENDOR', 'DELIVERY', 'SELLER']
    },
    category: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    orderId: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        required: true,
        enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
        default: 'OPEN'
    },
    priority: {
        type: String,
        required: true,
        enum: ['LOW', 'MEDIUM', 'HIGH'],
        default: 'MEDIUM'
    },
    messages: [{
        sender: {
            type: String,
            required: true,
            enum: ['USER', 'ADMIN']
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId
        },
        senderName: {
            type: String
        },
        message: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    userTyping: {
        type: Boolean,
        default: false
    },
    adminTyping: {
        type: Boolean,
        default: false
    },
    typingLastUpdatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);
