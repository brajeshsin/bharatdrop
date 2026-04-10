const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./src/models/Admin');

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const adminEmail = 'admin@bharatdrop.com';
        const adminPassword = 'admin@123';

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log('Admin already exists. No changes made.');
        } else {
            const newAdmin = new Admin({
                name: 'BharatDrop Administrator',
                email: adminEmail,
                password: adminPassword,
                role: 'ADMIN'
            });
            await newAdmin.save();
            console.log('Admin created successfully');
        }

        console.log('---------------------------');
        console.log('Email:', adminEmail);
        console.log('Password:', adminPassword);
        console.log('---------------------------');

        process.exit();
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
