const passport = require('../middlewares/passport');
const appleSignin = require('apple-signin-auth');
const jwt = require('jsonwebtoken');
const uuid = require('uuid');
const session = require('express-session');
const CustomerModel = require('../models/customerModel');
const ProviderModel = require('../models/providerModel');
require('dotenv').config();
const jwtSecret = process.env.JWT_SECRET;

exports.googleLogin = passport.authenticate('google', { scope: ['profile', 'email'] });

exports.googleCallback = async (req, res, next) => {
    passport.authenticate('google', async (err, user) => {
        if (err) {
            return res.status(401).json({ error: 'Authentication failed' });
        }
        const googleId = user.id;
        const role = req.body.role;
        try {
            let loggedUser;
            if (role === 'customer') {
                loggedUser = await CustomerModel.getCustomerByField('googleId', googleId);
                if (!loggedUser) {
                    const googleProfile = user;
                    loggedUser = await CustomerModel.createCustomerFromGoogle(googleProfile);
                }

            } else if (role === 'provider') {
                loggedUser = await ProviderModel.getProviderByField('googleId', googleId);
                if (!loggedUser) {
                    const googleProfile = user;
                    loggedUser = await ProviderModel.createProviderFromGoogle(googleProfile);
                }
            }
            const token = jwt.sign({ userId: loggedUser.id }, jwtSecret, { expiresIn: '3600h' });

            res.status(200).json({ userId: loggedUser.id, token, user: loggedUser, message: 'Login successful!' });

        } catch (error) {
            console.error('Error handling Google login:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    })(req, res, next);
};

exports.logout = (req, res) => {
    req.logout();
    res.redirect('/');
};

exports.appleLogin = async (req, res) => {
    const { identityToken, role } = req.body;

    try {
        const nonce = uuid.v4(); // Generate a unique nonce
        req.session.nonce = nonce;

        const appleProfile = await appleSignin.verifyIdToken(identityToken, {
            audience: process.env.CLIENT_ID, // Ensure you have the client ID set in your environment variables
            nonce,
        });

        const { sub: appleId, email, name } = appleProfile;

        let loggedUser;
        if (role === 'customer') {
            loggedUser = await CustomerModel.getCustomerByField('appleId', appleId);
            if (!loggedUser) {
                const appleUser = {
                    id: appleId,
                    username: name || '', // Apple may not provide the name after the first login
                    email: email || '', // Apple may not provide the email after the first login
                };
                const customerId = await CustomerModel.createCustomerFromApple(appleUser);
                loggedUser = await CustomerModel.getCustomerById(customerId);
            }
        } else if (role === 'provider') {
            loggedUser = await ProviderModel.getProviderByField('appleId', appleId);
            if (!loggedUser) {
                const appleUser = {
                    id: appleId,
                    username: name || '',
                    email: email || '',
                };
                const providerId = await ProviderModel.createProviderFromApple(appleUser);
                loggedUser = await ProviderModel.getProviderById(providerId);
            }
        }

        const token = jwt.sign({ userId: loggedUser.id }, jwtSecret, { expiresIn: '3600h' });

        res.status(200).json({ userId: loggedUser.id, token, message: 'Login successful!' });
    } catch (error) {
        console.error('Error handling Apple login:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
