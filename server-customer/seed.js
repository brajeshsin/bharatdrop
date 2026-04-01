const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');

dotenv.config();

const USERS = [
    { name: 'Brajesh Kushwaha', email: 'user@bharatdrop.in', password: 'password123', role: 'CUSTOMER' },
    { name: 'Shop Owner', email: 'vendor@bharatdrop.in', password: 'password123', role: 'VENDOR' },
    { name: 'Delivery Partner', email: 'partner@bharatdrop.in', password: 'password123', role: 'DELIVERY' }
];

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to seed customer DB');

        await User.deleteMany({});
        await User.insertMany(USERS);

        console.log('Customer DB seeded successfully');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seed();
