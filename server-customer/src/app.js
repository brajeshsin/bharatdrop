const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const adRoutes = require('./routes/adRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'BharatDrop Customer API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/promos', adRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
});

module.exports = app;
