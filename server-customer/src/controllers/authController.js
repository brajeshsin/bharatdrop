const User = require('../models/User');
const sendEmail = require('../utils/emailService');
const jwt = require('jsonwebtoken');

exports.requestOtp = async (req, res) => {
    try {
        let { email, mobile, name, role, storeName, businessCategory, vehicleType, address } = req.body;
        if (email) email = email.trim();
        if (mobile) mobile = mobile.trim();
        if (name) name = name.trim();
        if (role) role = role.toUpperCase();

        const otp = "209863"; // Fixed Dummy OTP
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Case 1: REGISTRATION (Basic fields + Role provided)
        if (email && mobile && name) {
            const conflicts = await User.collection.find(
                { $or: [{ email }, { mobile }] },
                { projection: { _id: 1, email: 1, mobile: 1 } }
            ).toArray();

            if (conflicts.length > 0) {
                const mobileTaken = conflicts.some(u => u.mobile === mobile);
                const emailTaken = conflicts.some(u => u.email === email);

                let message = "";
                if (mobileTaken && emailTaken) {
                    message = "Both Mobile and Email are already registered.";
                } else if (mobileTaken) {
                    message = "Mobile number is already registered.";
                } else {
                    message = "Email address is already registered.";
                }

                return res.status(400).json({
                    success: false,
                    code: 'USER_EXISTS',
                    message: `${message} Please login with your mobile number.`
                });
            }

            // Determine initial status based on role
            const status = (role === 'VENDOR' || role === 'DELIVERY') ? 'PENDING' : 'ACTIVE';

            await User.collection.insertOne({
                email,
                mobile,
                name,
                otp,
                otpExpires,
                role: role || 'CUSTOMER',
                storeName,
                businessCategory,
                vehicleType,
                address,
                status,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            return res.json({
                success: true,
                message: 'Registration successful.'
            });
        }

        // Case 2: LOGIN (Only mobile provided, or existing user trying to register with different role)
        if (mobile) {
            const existingUser = await User.findOne({ mobile });

            if (existingUser) {
                // If the registration request includes role/metadata, update the existing user
                const updateData = {
                    otp,
                    otpExpires,
                    updatedAt: new Date()
                };

                // Allow 'upgrading' from CUSTOMER to other roles
                if (role && role !== 'CUSTOMER' && (!existingUser.role || existingUser.role === 'CUSTOMER')) {
                    console.log(`[Auth] Upgrading user ${mobile} from ${existingUser.role || 'NONE'} to ${role}`);
                    updateData.role = role;
                    if (storeName) updateData.storeName = storeName;
                    if (businessCategory) updateData.businessCategory = businessCategory;
                    if (vehicleType) updateData.vehicleType = vehicleType;
                    if (address) updateData.address = address;
                    updateData.status = 'PENDING';
                }

                console.log(`[Auth] Updating user ${mobile}. New Role: ${updateData.role || existingUser.role}`);
                await User.findOneAndUpdate(
                    { mobile },
                    { $set: updateData },
                    { new: true }
                );
            } else if (email && name) {
                // This shouldn't really happen here as Case 1 handles new users with all info,
                // but for safety if it falls through:
                await User.collection.insertOne({
                    email, mobile, name, otp, otpExpires,
                    role: role || 'CUSTOMER',
                    status: (role === 'VENDOR' || role === 'DELIVERY') ? 'PENDING' : 'ACTIVE',
                    storeName, businessCategory, vehicleType, address,
                    createdAt: new Date(), updatedAt: new Date()
                });
            } else {
                return res.status(400).json({ success: false, message: 'User not found. Please register.' });
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
            { id: user._id, role: user.role, mobile: user.mobile },
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

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password -otp -otpExpires');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
