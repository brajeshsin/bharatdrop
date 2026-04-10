const mongoose = require('mongoose');
require('dotenv').config();

const checkData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('--- DB Check ---');
        console.log('Connected to:', mongoose.connection.name);

        const Vendor = mongoose.model('Vendor', new mongoose.Schema({ storeName: String, shopId: String }));
        const adminVendors = await Vendor.find();
        console.log(`Vendors in bharatdrop_admin: ${adminVendors.length}`);
        adminVendors.slice(0, 3).forEach(v => console.log(` - ${v.storeName} (${v.shopId})`));

        const customerDb = mongoose.connection.useDb('bharatdrop_customer');
        const CustomerVendor = customerDb.model('Vendor', new mongoose.Schema({ storeName: String, shopId: String }));
        const customerVendors = await CustomerVendor.find();
        console.log(`Vendors in bharatdrop_customer: ${customerVendors.length}`);
        customerVendors.slice(0, 3).forEach(v => console.log(` - ${v.storeName} (${v.shopId})`));

        const Order = customerDb.model('Order', new mongoose.Schema({ orderId: String, total: Number }));
        const orders = await Order.find();
        console.log(`Total Orders in bharatdrop_customer: ${orders.length}`);
        orders.slice(0, 3).forEach(o => console.log(` - ${o.orderId} (₹${o.total})`));

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
};

checkData();
