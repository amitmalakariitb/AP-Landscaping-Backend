const { CustomerModel, ProviderModel, TokenModel } = require('../models');
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

        let user = await CustomerModel.getCustomerByEmail(email);
        let userType = 'customer';

        if (!user) {
            user = await ProviderModel.getProviderByEmail(email);
            userType = 'provider'
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
        }
        const resetToken = jwt.sign({ userId: user.id, userType }, jwtSecret, { expiresIn: '1h' });
        const otp = generateOTP();

        const expirationTime = Date.now() + 60 * 60 * 1000;

        await TokenModel.saveResetToken(user.id, resetToken, otp, expirationTime);

        await sendOtpEmail(user.email, otp);

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
        let user;

        if (decodedToken.userType === 'customer') {
            user = await CustomerModel.getCustomerById(decodedToken.userId);
        } else if (decodedToken.userType === 'provider') {
            user = await ProviderModel.getProviderById(decodedToken.userId);
        }

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const isTokenValid = await TokenModel.isTokenValid(decodedToken.userId, resetToken);
        if (!isTokenValid) {
            return res.status(401).json({ error: 'Invalid or expired reset token' });
        }

        const storedOTP = await TokenModel.getOTP(decodedToken.userId);
        if (!storedOTP || otp !== storedOTP) {
            return res.status(401).json({ error: 'Invalid OTP' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        if (decodedToken.userType === 'customer') {
            await CustomerModel.updateCustomer(decodedToken.userId, { hashedPassword });
        } else if (decodedToken.userType === 'provider') {
            await ProviderModel.updateProvider(decodedToken.userId, { hashedPassword });
        }
        try {
            await TokenModel.removeOTP(decodedToken.userId);
            await TokenModel.removeResetToken(decodedToken.userId);

        } catch (removeError) {
            console.error('Error removing OTP:', removeError);
            return res.status(500).json({ error: 'Error removing OTP. Password reset successful.' });
        }

        if (user) {
            await sendPasswordResetConfirmation(user.email);
        } else {
            console.error('Customer not found after password reset:', decodedToken.userId);
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

        if (!isValidPhoneNumber(phoneNumber)) {
            return res.status(400).json({ error: 'Invalid phone number' });
        }

        let user = await CustomerModel.getCustomerByPhoneNumber(phoneNumber);
        let userType = 'customer';

        if (!user) {
            user = await ProviderModel.getProviderByPhoneNumber(phoneNumber);
            userType = 'provider';
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
        }

        const formattedPhoneNumber = `+91${phoneNumber}`;

        const resetToken = jwt.sign({ userId: user.id, userType }, jwtSecret, { expiresIn: '1h' });
        const otp = generateOTP();

        const expirationTime = Date.now() + 60 * 60 * 1000;

        await TokenModel.saveResetToken(user.id, resetToken, otp, expirationTime);

        await sendOtpSMS(formattedPhoneNumber, otp);

        res.status(200).json({ message: 'Reset token and OTP sent successfully. Check your phone.', resetToken: resetToken });
    } catch (error) {
        console.error('Error generating reset token:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


module.exports = { forgotPasswordEmail, resetPassword, forgotPasswordPhone };