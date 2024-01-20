const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { ProviderModel, TokenModel } = require('../models');

const jwtSecret = process.env.JWT_SECRET;

async function signup(req, res) {
    try {
        const {
            username,
            email,
            mobilenumber,
            address,
            carddetails,
            cvv,
            paypalid,
            aectransfer,
            cardtype,
            cardholdersname,
            cardnumber,
            qualifications,
            yearsofexperience,
            bio,
            bankname,
            accountnumber,
            services,
            password,
        } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const existingProvider = await ProviderModel.getProviderByEmail(email);

        if (existingProvider) {
            return res.status(400).json({ error: 'Provider with this email already exists' });
        }

        const newProvider = new ProviderModel(
            username,
            null,
            email,
            mobilenumber,
            address,
            carddetails,
            cvv,
            paypalid,
            aectransfer,
            cardtype,
            cardholdersname,
            cardnumber,
            qualifications,
            yearsofexperience,
            bio,
            bankname,
            accountnumber,
            services,
            hashedPassword,
        );

        const providerId = await newProvider.createProvider();

        const token = jwt.sign({ providerId }, jwtSecret, { expiresIn: '3600h' });

        res.status(201).json({ providerId, token, message: 'Provider created successfully!' });
    } catch (error) {
        console.error('Error creating provider:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;

        const provider = await ProviderModel.getProviderByEmail(email);

        if (!provider) {
            return res.status(404).json({ error: 'Provider not found' });
        }

        const passwordMatch = await bcrypt.compare(password, provider.hashedPassword);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        const token = jwt.sign({ providerId: provider.id }, jwtSecret, { expiresIn: '3600h' });

        res.status(200).json({ providerId: provider.id, token, message: 'Login successful!' });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function logout(req, res) {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        await TokenModel.addToBlacklist(token, req.user.providerId, 'provider');

        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


async function getProviderProfile(req, res) {
    try {
        const providerId = req.user.providerId;
        const provider = await ProviderModel.getProviderById(providerId);

        if (!provider) {
            return res.status(404).json({ error: 'Provider not found' });
        }

        res.status(200).json({ provider });
    } catch (error) {
        console.error('Error getting provider profile:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


async function getProviderDetails(req, res) {
    try {
        const providerId = req.params.providerId;
        const provider = await ProviderModel.getProviderById(providerId);

        if (!provider) {
            return res.status(404).json({ error: 'Provider not found' });
        }

        res.status(200).json({ provider });
    } catch (error) {
        console.error('Error getting provider profile:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function updateProviderProfile(req, res) {
    try {
        const providerId = req.user.providerId;

        const {
            username,
            email,
            mobilenumber,
            address,
            carddetails,
            cvv,
            paypalid,
            aectransfer,
            cardtype,
            cardholdersname,
            cardnumber,
            qualifications,
            yearsofexperience,
            bio,
            bankname,
            accountnumber,
            services,
            hashedPassword,
            googleId,
        } = req.body;

        const existingProvider = await ProviderModel.getProviderById(providerId);

        if (!existingProvider) {
            return res.status(404).json({ error: 'Provider not found' });
        }


        const updatedData = {};

        Object.keys(existingProvider).forEach((field) => {
            updatedData[field] = req.body[field] !== undefined ? req.body[field] : existingProvider[field];
        });

        await ProviderModel.updateProvider(providerId, updatedData);

        const updatedProvider = await ProviderModel.getProviderById(providerId);

        res.status(200).json({ updatedProvider, message: 'Provider profile updated successfully!' });
    } catch (error) {
        console.error('Error updating provider profile:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}



module.exports = { signup, login, logout, getProviderProfile, getProviderDetails, updateProviderProfile };
