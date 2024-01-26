const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendOtpEmail(email, otp) {
    const msg = {
        to: email,
        from: process.env.SENDER_EMAIL,
        subject: 'Password Reset OTP',
        text: `Your OTP for password reset is: ${otp}`,
    };

    await sgMail.send(msg);
}

async function sendPasswordResetConfirmation(email) {
    const msg = {
        to: email,
        from: process.env.SENDER_EMAIL,
        subject: 'Password Reset Successful',
        text: 'Your password has been successfully reset.',
    };

    await sgMail.send(msg);
}

module.exports = { sendOtpEmail, sendPasswordResetConfirmation };
