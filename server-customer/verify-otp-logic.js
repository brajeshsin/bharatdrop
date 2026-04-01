const axios = require('axios');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function testOtp() {
    const email = 'testuser@example.com';
    const mobile = '1234567890';
    const name = 'Test User';

    try {
        console.log('--- Step 1: Requesting OTP ---');
        // Note: This will fail to send email if SMTP is not configured, but should still reach the point in controller.
        // We expect "Failed to send OTP email" if SMTP is wrong, which confirms the logic before it.
        const requestRes = await axios.post('http://localhost:5000/api/auth/request-otp', {
            email,
            mobile,
            name
        }).catch(err => err.response);

        console.log('Request OTP Response:', requestRes.data);

        // For verification, we need the OTP from the DB since we can't receive the email.
        // In a real test we'd access the DB directly or use a test SMTP like ethereal.

    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

// testOtp();
console.log('Please run the server first: npm start in server-customer');
console.log('Then run this test script manually if needed, or I can check logs.');
