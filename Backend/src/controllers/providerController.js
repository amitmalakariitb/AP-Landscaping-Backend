const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { ProviderModel } = require('../models');

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

        const token = jwt.sign({ providerId }, jwtSecret, { expiresIn: '1h' });

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

        const token = jwt.sign({ providerId: provider.id }, jwtSecret, { expiresIn: '1h' });

        res.status(200).json({ providerId: provider.id, token, message: 'Login successful!' });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = { signup, login };
