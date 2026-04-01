require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const authController = require('./src/controllers/authController');

// Mock request and response
const mockResponse = () => {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.jsonData = data;
        return res;
    };
    return res;
};

async function testLogic() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB for testing');

        // Cleanup test user
        await User.deleteOne({ email: 'test@example.com' });

        console.log('--- Testing OTP Request ---');
        const req1 = {
            body: {
                email: 'test@example.com',
                mobile: '9876543210',
                name: 'Test Tester'
            }
        };
        const res1 = mockResponse();

        await authController.requestOtp(req1, res1);

        // We expect failure to send email since SMTP is not configured
        console.log('Request OTP Status:', res1.statusCode || 200);
        console.log('Request OTP Message:', res1.jsonData.message);

        const user = await User.findOne({ email: 'test@example.com' });
        if (user && user.otp) {
            console.log('OTP generated in DB:', user.otp);
            console.log('OTP Expiry:', user.otpExpires);

            console.log('--- Testing OTP Verification (Success) ---');
            const req2 = {
                body: {
                    email: 'test@example.com',
                    otp: user.otp
                }
            };
            const res2 = mockResponse();

            await authController.verifyOtp(req2, res2);
            console.log('Verify OTP Status:', res2.statusCode || 200);
            console.log('Verify OTP Success:', res2.jsonData.success);
            if (res2.jsonData.token) {
                console.log('Token generated:', res2.jsonData.token.substring(0, 10) + '...');
            }

            const userAfter = await User.findOne({ email: 'test@example.com' });
            console.log('OTP cleared after verify:', userAfter.otp === undefined);

        } else {
            console.error('User or OTP not found in DB!');
        }

        await User.deleteOne({ email: 'test@example.com' });
        await mongoose.disconnect();
    } catch (error) {
        console.error('Test execution error:', error);
        if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
    }
}

testLogic();
