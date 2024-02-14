const { CustomerModel, TokenModel } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { sendOtpEmail, sendPasswordResetConfirmation } = require('../utils/emailUtil');
const { sendOtpSMS } = require('../utils/smsUtil');
const jwtSecret = process.env.JWT_SECRET;

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000);
}

function isValidPhoneNumber(phoneNumber) {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phoneNumber);
}


async function forgotPasswordEmail(req, res) {
    try {
        const { email } = req.body;

        const customer = await CustomerModel.getCustomerByEmail(email);

        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        const resetToken = jwt.sign({ customerId: customer.id }, jwtSecret, { expiresIn: '1h' });
        const otp = generateOTP();

        const expirationTime = Date.now() + 60 * 60 * 1000;


        await TokenModel.saveResetToken(customer.id, resetToken, otp, expirationTime);

        await sendOtpEmail(customer.email, otp);

        res.status(200).json({ message: 'Reset token and OTP sent successfully. Check your email.', resetToken: resetToken });
    } catch (error) {
        console.error('Error generating reset token:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function resetPassword(req, res) {
    try {
        const { otp, newPassword } = req.body;

        const authorizationHeader = req.headers.authorization;
        if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Invalid authorization header' });
        }

        const resetToken = authorizationHeader.replace('Bearer ', '');

        const decodedToken = jwt.verify(resetToken, jwtSecret);
        const customer = await CustomerModel.getCustomerById(decodedToken.customerId);

        const isTokenValid = await TokenModel.isTokenValid(decodedToken.customerId, resetToken);
        if (!isTokenValid) {
            return res.status(401).json({ error: 'Invalid or expired reset token' });
        }

        const storedOTP = await TokenModel.getOTP(decodedToken.customerId);
        if (!storedOTP || otp !== storedOTP) {
            return res.status(401).json({ error: 'Invalid OTP' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await CustomerModel.updateCustomer(decodedToken.customerId, { hashedPassword });

        try {
            await TokenModel.removeOTP(decodedToken.customerId);
            await TokenModel.removeResetToken(decodedToken.customerId);

        } catch (removeError) {
            console.error('Error removing OTP:', removeError);
            return res.status(500).json({ error: 'Error removing OTP. Password reset successful.' });
        }

        if (customer) {
            await sendPasswordResetConfirmation(customer.email);
        } else {
            console.error('Customer not found after password reset:', decodedToken.customerId);
        }
        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function forgotPasswordPhone(req, res) {
    try {
        const { phoneNumber } = req.body;
        console.log(phoneNumber)

        if (!isValidPhoneNumber(phoneNumber)) {
            return res.status(400).json({ error: 'Invalid phone number' });
        }

        const customer = await CustomerModel.getCustomerByPhoneNumber(phoneNumber);

        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        const formattedPhoneNumber = `+91${phoneNumber}`;

        const resetToken = jwt.sign({ customerId: customer.id }, jwtSecret, { expiresIn: '1h' });
        const otp = generateOTP();

        const expirationTime = Date.now() + 60 * 60 * 1000;

        await TokenModel.saveResetToken(customer.id, resetToken, otp, expirationTime);

        await sendOtpSMS(formattedPhoneNumber, otp);

        res.status(200).json({ message: 'Reset token and OTP sent successfully. Check your phone.', resetToken: resetToken });
    } catch (error) {
        console.error('Error generating reset token:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


module.exports = { forgotPasswordEmail, resetPassword, forgotPasswordPhone };