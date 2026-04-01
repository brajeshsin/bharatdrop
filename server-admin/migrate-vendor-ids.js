const mongoose = require('mongoose');
const Vendor = require('./src/models/Vendor');
require('dotenv').config();

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('DB Connected');

        const vendors = await Vendor.find({ shopId: { $exists: false } }).sort({ createdAt: 1 });
        console.log(`Found ${vendors.length} vendors without shopId`);

        for (let i = 0; i < vendors.length; i++) {
            const shopId = `SHOP-${(i + 1).toString().padStart(3, '0')}`;
            vendors[i].shopId = shopId;
            await vendors[i].save();
            console.log(`Assigned ${shopId} to ${vendors[i].storeName}`);
        }

        console.log('Migration completed successfully');
        await mongoose.disconnect();
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrate();
