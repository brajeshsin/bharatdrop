const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const partnerRoutes = require('./routes/partnerRoutes');

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'BharatDrop Admin API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/customers', userRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/partners', partnerRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
});

module.exports = app;
