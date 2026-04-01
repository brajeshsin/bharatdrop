const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: (process.env.SMTP_USER || '').trim(),
        pass: (process.env.SMTP_PASS || '').replace(/\s+/g, ''),
    },
});

console.log('Verifying connection for user:', process.env.SMTP_USER.trim());
console.log('Sanitized password length:', process.env.SMTP_PASS.replace(/\s+/g, '').length);

transporter.verify((error, success) => {
    if (error) {
        console.error('Verification Error:', error);
    } else {
        console.log('Server is ready to take our messages');
    }
    process.exit();
});
