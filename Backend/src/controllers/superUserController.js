const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { SuperuserModel, TokenModel, CustomerModel, ProviderModel, OrderModel } = require('../models');

const jwtSecret = process.env.JWT_SECRET;

async function signup(req, res) {
    try {
        const {
            username,
            email,
            password,
            token: providedToken,
            superuserToken
        } = req.body;

        if (providedToken !== jwtSecret || superuserToken !== process.env.SUPERUSER_TOKEN) {
            return res.status(400).json({ error: 'Invalid token provided' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const existingSuperuser = await SuperuserModel.getSuperuserByEmail(email);

        if (existingSuperuser) {
            return res.status(400).json({ error: 'Superuser with this email already exists' });
        }

        const newSuperuser = new SuperuserModel(
            username,
            email,
            hashedPassword
        );
        const superuserId = await newSuperuser.createSuperuser();

        const token = jwt.sign({ superuserId }, jwtSecret, { expiresIn: '3600h' });

        res.status(201).json({ superuserId, token, message: 'Superuser created successfully!' });
    } catch (error) {
        console.error('Error creating superuser:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;

        const superuser = await SuperuserModel.getSuperuserByEmail(email);

        if (!superuser) {
            return res.status(404).json({ error: 'Superuser not found' });
        }

        const passwordMatch = await bcrypt.compare(password, superuser.hashedPassword);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        const token = jwt.sign({ superuserId: superuser.id }, jwtSecret, { expiresIn: '3600h' });

        res.status(200).json({ superuserId: superuser.id, token, message: 'Login successful!' });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function logout(req, res) {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        await TokenModel.addToBlacklist(token, req.user.superuserId, 'superuser');

        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function getAllCustomers(req, res) {
    try {
        const customers = await CustomerModel.getAllCustomers();
        res.status(200).json({ customers });
    } catch (error) {
        console.error('Error getting all customers:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function getAllProviders(req, res) {
    try {
        const providers = await ProviderModel.getAllProviders();
        res.status(200).json({ providers });
    } catch (error) {
        console.error('Error getting all providers:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function getOrdersWithNoProvider(req, res) {
    console.log("hi")
    try {
        console.log("hi")
        const orders = await OrderModel.getOrdersWithNoProvider();
        res.status(200).json({ orders });
    } catch (error) {
        console.log("hi")
        console.error('Error getting orders with no provider:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = { signup, login, logout, getAllCustomers, getAllProviders, getOrdersWithNoProvider };
