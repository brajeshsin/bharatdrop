const mongoose = require('mongoose');
const paymentSchema = require('../models/PaymentMethod');

exports.getActivePaymentMethods = async (req, res) => {
    try {
        const adminDb = mongoose.connection.useDb('bharatdrop_admin');
        const PaymentMethod = adminDb.model('PaymentMethod', paymentSchema);

        let methods = await PaymentMethod.find({ isEnabled: true });

        // Seed if empty in admin db (just in case)
        if (methods.length === 0) {
            const allMethods = await PaymentMethod.find();
            if (allMethods.length === 0) {
                await PaymentMethod.insertMany([
                    { name: 'Cash on Delivery', code: 'cod', description: 'Pay at your doorstep', isEnabled: true },
                    { name: 'UPI Payment', code: 'upi', description: 'Instant online transfer', isEnabled: true }
                ]);
                methods = await PaymentMethod.find({ isEnabled: true });
            }
        }

        res.json({ success: true, data: methods });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
