const User = require('../models/User');
const sendEmail = require('../utils/emailService');
const jwt = require('jsonwebtoken');

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.requestOtp = async (req, res) => {
    try {
        const { email, mobile, name } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        // Allow testing with same mobile for different emails

        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Find user or create a temporary one
        let user = await User.findOne({ email });

        if (user) {
            user.otp = otp;
            user.otpExpires = otpExpires;
            if (mobile) user.mobile = mobile;
            if (name) user.name = name;
            await user.save();
        } else {
            user = await User.create({
                email,
                mobile,
                name,
                otp,
                otpExpires,
                role: 'CUSTOMER'
            });
        }

        // Send OTP via email
        try {
            await sendEmail({
                email: user.email,
                subject: 'Your BharatDrop Verification Code',
                message: `Your verification code is ${otp}. It will expire in 10 minutes.`,
                html: `<h1>Verification Code</h1><p>Your code is <strong>${otp}</strong>. It will expire in 10 minutes.</p>`
            });
            res.json({ success: true, message: 'OTP sent to email' });
        } catch (emailError) {
            console.error('Email Delivery Error:', emailError);
            console.log('--- DEMO MODE OTP ---');
            console.log(`Email: ${email}`);
            console.log(`OTP: ${otp}`);
            console.log('---------------------');
            res.json({
                success: true,
                message: 'OTP generated (Demo Mode: Check server console)',
                demo: true
            });
        }

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Check for bypass OTP (123456) for development
        let user;
        if (otp === '123456') {
            user = await User.findOne({ email });
        } else {
            user = await User.findOne({
                email,
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
