const mongoose = require('mongoose');

// Helper to get collection
const getUserCollection = () => {
    const customerDb = mongoose.connection.useDb('bharatdrop_customer');
    return customerDb.collection('users');
};

// Seed initial delivery partners if none exist
const seedPartnersIfNeeded = async (userCollection) => {
    const count = await userCollection.countDocuments({ role: 'DELIVERY' });
    if (count === 0) {
        console.log('[Admin Partner Service] Seeding initial delivery partners...');
        const initialPartners = [
            {
                name: 'Vikram Singh',
                email: 'vikram@bharatdrop.com',
                mobile: '9876543220',
                role: 'DELIVERY',
                vehicleType: 'Bike',
                town: 'Rampur',
                status: 'ACTIVE',
                earnings: 14500,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Suresh Kumar',
                email: 'suresh@bharatdrop.com',
                mobile: '9876543221',
                role: 'DELIVERY',
                vehicleType: 'Bike',
                town: 'Bhagwant Nagar',
                status: 'ACTIVE',
                earnings: 18200,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Rajesh Gupta',
                email: 'rajesh@bharatdrop.com',
                mobile: '9876543222',
                role: 'DELIVERY',
                vehicleType: 'Bicycle',
                town: 'Dhanikhera',
                status: 'ACTIVE',
                earnings: 9800,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Amit Patel',
                email: 'amit@bharatdrop.com',
                mobile: '9876543223',
                role: 'DELIVERY',
                vehicleType: 'Bike',
                town: 'Rampur',
                status: 'ACTIVE',
                earnings: 22000,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Deepak Sharma',
                email: 'deepak@bharatdrop.com',
                mobile: '9876543224',
                role: 'DELIVERY',
                vehicleType: 'Bike',
                town: 'Sumerpur',
                status: 'SUSPENDED',
                earnings: 12000,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];
        await userCollection.insertMany(initialPartners);
    }
};

// @desc    Get all delivery partners
// @route   GET /api/partners
// @access  Private (Admin)
exports.getPartners = async (req, res) => {
    try {
        const userCollection = getUserCollection();
        await seedPartnersIfNeeded(userCollection);

        const partners = await userCollection.find({ role: 'DELIVERY' }).sort({ createdAt: -1 }).toArray();

        const transformed = partners.map(user => ({
            id: user._id.toString(),
            name: user.name,
            phone: user.mobile || 'N/A',
            status: user.status === 'ACTIVE' ? 'Online' : 'Offline',
            earnings: user.earnings || 12000,
            zone: user.town || 'Rampur',
            vehicleType: user.vehicleType || 'Bike',
            email: user.email || 'N/A',
            createdAt: user.createdAt || new Date()
        }));

        res.json({ success: true, data: transformed });
    } catch (error) {
        console.error('Error fetching partners:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get delivery partner by ID
// @route   GET /api/partners/:id
// @access  Private (Admin)
exports.getPartnerById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid Partner ID format' });
        }

        const userCollection = getUserCollection();
        const user = await userCollection.findOne({ _id: new mongoose.Types.ObjectId(id) });

        if (!user || user.role !== 'DELIVERY') {
            return res.status(404).json({ success: false, message: 'Partner not found' });
        }

        const transformed = {
            id: user._id.toString(),
            name: user.name,
            phone: user.mobile || 'N/A',
            status: user.status === 'ACTIVE' ? 'Online' : 'Offline',
            earnings: user.earnings || 12000,
            zone: user.town || 'Rampur',
            vehicleType: user.vehicleType || 'Bike',
            email: user.email || 'N/A',
            createdAt: user.createdAt || new Date()
        };

        res.json({ success: true, data: transformed });
    } catch (error) {
        console.error('Error fetching partner by id:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update delivery partner status
// @route   PATCH /api/partners/:id/status
// @access  Private (Admin)
exports.updatePartnerStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'Online' or 'Offline'

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid Partner ID format' });
        }

        const userCollection = getUserCollection();
        const dbStatus = status === 'Online' ? 'ACTIVE' : 'SUSPENDED';

        const result = await userCollection.updateOne(
            { _id: new mongoose.Types.ObjectId(id), role: 'DELIVERY' },
            { $set: { status: dbStatus, updatedAt: new Date() } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ success: false, message: 'Partner not found' });
        }

        res.json({ success: true, message: 'Partner status updated successfully' });
    } catch (error) {
        console.error('Error updating partner status:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete delivery partner
// @route   DELETE /api/partners/:id
// @access  Private (Admin)
exports.deletePartner = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid Partner ID format' });
        }

        const userCollection = getUserCollection();
        const result = await userCollection.deleteOne({ _id: new mongoose.Types.ObjectId(id), role: 'DELIVERY' });

        if (result.deletedCount === 0) {
            return res.status(404).json({ success: false, message: 'Partner not found' });
        }

        res.json({ success: true, message: 'Partner deleted successfully' });
    } catch (error) {
        console.error('Error deleting partner:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
