const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        console.log('Connecting to MongoDB...');
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000, // 5 seconds timeout
            connectTimeoutMS: 10000, // 10 seconds timeout
        });
        console.log(`MongoDB Connected: ${conn.connection.host} (${conn.connection.name})`);
        return conn;
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        // Don't exit immediately, let the caller decide
        throw error;
    }
};

module.exports = connectDB;
