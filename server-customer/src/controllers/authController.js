const User = require('../models/User');
const sendEmail = require('../utils/emailService');
const jwt = require('jsonwebtoken');

exports.requestOtp = async (req, res) => {
    try {
        let { email, mobile, name } = req.body;
        if (email) email = email.trim();
        if (mobile) mobile = mobile.trim();
        if (name) name = name.trim();

        const otp = "209863"; // Fixed Dummy OTP
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Case 1: REGISTRATION (All fields provided)
        if (email && mobile && name) {
            // DIRECT MONGO QUERY - Faster than Mongoose findOne
            const existingUser = await User.collection.findOne(
                { $or: [{ email }, { mobile }] },
                { projection: { _id: 1 } }
            );

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    code: 'USER_EXISTS',
                    message: 'Account already exists. Please login with your mobile number.'
                });
            }

            // DIRECT MONGO INSERT - Faster than User.create
            await User.collection.insertOne({
                email,
                mobile,
                name,
                otp,
                otpExpires,
                role: 'CUSTOMER',
                createdAt: new Date(),
                updatedAt: new Date()
            });

            return res.json({
                success: true,
                message: 'Registration successful.'
            });
        }

        // Case 2: LOGIN (Only mobile provided)
        if (mobile && !email && !name) {
            // DIRECT MONGO UPDATE
            const updateResult = await User.collection.updateOne(
                { mobile },
                { $set: { otp, otpExpires, updatedAt: new Date() } }
            );

            if (updateResult.matchedCount === 0) {
                return res.status(404).json({
                    success: false,
                    code: 'USER_NOT_FOUND',
                    message: 'No account found with this mobile number. Please register.'
                });
            }

            return res.json({
                success: true,
                message: 'OTP sent to your mobile.'
            });
        }

        return res.status(400).json({
            success: false,
            message: 'Invalid request.'
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        let { email, mobile, otp } = req.body;
        if (email) email = email.trim();
        if (mobile) mobile = mobile.trim();

        // Check for bypass OTP or dummy OTP
        let user;
        if (otp === '209863' || otp === '123456') {
            user = await User.findOne({
                $or: [{ email }, { mobile }]
            });
        } else {
            user = await User.findOne({
                $or: [{ email }, { mobile }],
                otp,
                otpExpires: { $gt: Date.now() }
            });
        }

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        // Clear OTP after successful verification
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        // Generate JWT
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'supersecretcustomerkey',
            { expiresIn: '7d' }
        );

        const { password, ...userWithoutPassword } = user.toObject();
        res.json({
            success: true,
            user: userWithoutPassword,
            token
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.login = async (req, res) => {
    // Keep for legacy or if needed, but the new flow is requestOtp -> verifyOtp
    res.status(400).json({ success: false, message: 'Please use OTP login' });
};
