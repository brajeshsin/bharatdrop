const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    try {
        let { email, password } = req.body;

        // Sanitize inputs
        email = email?.trim().toLowerCase();
        password = password?.trim();

        // Find admin by email
        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(401).json({ success: false, message: 'Admin account not found' });
        }

        if (admin.password === password) {
            const { password: _, ...adminWithoutPassword } = admin.toObject();

            // Sign a real JWT token
            const token = jwt.sign(
                { id: admin._id, email: admin.email, role: admin.role },
                process.env.JWT_SECRET || 'your_admin_jwt_secret_key_123',
                { expiresIn: '30d' }
            );

            res.json({
                success: true,
                user: adminWithoutPassword,
                token: token
            });
        } else {
            res.status(401).json({ success: false, message: 'Incorrect password' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
