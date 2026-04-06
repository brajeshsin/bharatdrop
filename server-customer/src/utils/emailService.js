const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    console.log('Sending email using user:', process.env.SMTP_USER);
    // For development, you can use ethereal.email or your own SMTP
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.SMTP_USER.trim(),
            pass: process.env.SMTP_PASS.replace(/\s+/g, ''),
        },
        // Add timeouts to prevent long hangs
        connectionTimeout: 5000, // 5 seconds
        greetingTimeout: 5000,   // 5 seconds
        socketTimeout: 5000      // 5 seconds
    });

    const from = "namwedding@gmail.com";
    console.log('Email from field:', from);
    const mailOptions = {
        from: from,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
