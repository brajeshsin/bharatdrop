const mongoose = require('mongoose');
const mongoURI = 'mongodb+srv://supportbrijesh_db_user:tghzPhFF5zPjKlJg@bharatdrop.zcco8ap.mongodb.net/bharatdrop_customer?retryWrites=true&w=majority';

async function checkOrder() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoURI);
        console.log('Connected.');

        const Order = mongoose.model('Order', new mongoose.Schema({
            orderId: String,
            status: String,
            createdAt: Date
        }), 'orders');

        const orderIdHex = '69cd158ab28bb220b0865a82';

        // Try direct findById first
        let order;
        try {
            order = await Order.findById(orderIdHex);
        } catch (e) {
            console.log('Invalid format for findById:', e.message);
        }

        if (order) {
            console.log('Order Found by _id:');
            console.log('ID:', order._id);
            console.log('Human ID:', order.orderId);
            console.log('Status:', order.status);
        } else {
            console.log('Order not found by _id hex. Trying by orderId human string...');
            const order2 = await Order.findOne({ orderId: orderIdHex });
            if (order2) {
                console.log('Order Found by Human ID:');
                console.log('Status:', order2.status);
            } else {
                console.log('Order not found even by human ID.');
            }
        }

        // List 10 most recent orders anyway to see what is happening in the DB
        console.log('\nLast 10 Orders in DB:');
        const recent = await Order.find().sort({ createdAt: -1 }).limit(10);
        recent.forEach(r => {
            console.log(`- ${r._id} | ${r.orderId} | ${r.status} | ${r.createdAt}`);
        });

        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

checkOrder();
