const mongoose = require('mongoose');
require('dotenv').config();

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const customerDb = mongoose.connection.useDb('bharatdrop_customer');
        const userCollection = customerDb.collection('users');

        const users = await userCollection.find({ status: 'ACTIVE' }).toArray();
        console.log('--- Active Users ---');
        users.forEach(u => console.log(` - ${u.name} (${u.role}) - ${u.mobile}`));

        const vendorsInAdmin = await mongoose.model('Vendor', new mongoose.Schema({ phone: String })).find();
        console.log('\n--- Vendors in bharatdrop_admin ---');
        vendorsInAdmin.forEach(v => console.log(` - ${v.phone}`));

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
};

checkUsers();
