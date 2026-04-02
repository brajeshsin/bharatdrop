const PaymentMethod = require('../models/PaymentMethod');

exports.getPaymentMethods = async (req, res) => {
    try {
        let methods = await PaymentMethod.find();

        // Seed if empty
        if (methods.length === 0) {
            await PaymentMethod.insertMany([
                { name: 'Cash on Delivery', code: 'cod', description: 'Pay at your doorstep', isEnabled: true },
                { name: 'UPI Payment', code: 'upi', description: 'Instant online transfer', isEnabled: true }
            ]);
            methods = await PaymentMethod.find();
        }

        res.json({ success: true, data: methods });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.togglePaymentMethod = async (req, res) => {
    try {
        const { id } = req.params;
        const method = await PaymentMethod.findById(id);

        if (!method) {
            return res.status(404).json({ success: false, message: 'Payment method not found' });
        }

        method.isEnabled = !method.isEnabled;
        await method.save();

        res.json({ success: true, data: method });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
