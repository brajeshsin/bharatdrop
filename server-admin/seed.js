const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./src/models/Admin');

dotenv.config();

const ADMINS = [
    { name: 'BharatDrop Admin', email: 'admin@bharatdrop.in', password: 'adminpassword123', role: 'ADMIN' }
];

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to seed admin DB');

        await Admin.deleteMany({});
        await Admin.insertMany(ADMINS);

        console.log('Admin DB seeded successfully');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seed();
