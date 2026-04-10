const mongoose = require('mongoose');
const Vendor = require('./src/models/Vendor');
require('dotenv').config();

const syncMissingVendors = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const customerDb = mongoose.connection.useDb('bharatdrop_customer');
        const userCollection = customerDb.collection('users');

        // Find all ACTIVE users with role VENDOR or SELLER
        const activeUsers = await userCollection.find({
            status: 'ACTIVE',
            role: { $in: ['VENDOR', 'SELLER'] }
        }).toArray();

        console.log(`Checking ${activeUsers.length} active merchant users...`);

        const validCategories = ['Sweets & Snacks', 'Fruits & Veg', 'Grocery', 'Restaurant', 'Pharmacy', 'Meat', 'Dhaba', 'Fast Food', 'Medicine', 'Dairy'];

        for (const user of activeUsers) {
            const userPhone = user.mobile || user.phone;
            const existingVendor = await Vendor.findOne({ phone: userPhone });

            if (!existingVendor) {
                console.log(`Syncing profile for: ${user.name} (${userPhone})`);

                let mappedCategory = user.businessCategory || 'Grocery';
                if (!validCategories.includes(mappedCategory)) {
                    mappedCategory = 'Grocery';
                }

                await Vendor.create({
                    name: user.name,
                    storeName: user.storeName || user.name || 'Merchant Store',
                    category: mappedCategory,
                    phone: userPhone,
                    email: user.email,
                    town: user.town || 'Rampur',
                    address: user.address || 'N/A',
                    status: 'Active'
                });
            } else {
                // Ensure it is Active
                if (existingVendor.status !== 'Active') {
                    existingVendor.status = 'Active';
                    await existingVendor.save();
                    console.log(`Activated existing profile for: ${userPhone}`);
                }
            }
        }

        console.log('Synchronization completed.');
        await mongoose.disconnect();
    } catch (err) {
        console.error('Sync failed:', err);
    }
};

syncMissingVendors();
