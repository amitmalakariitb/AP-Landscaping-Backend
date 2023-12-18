const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { CustomerModel } = require('../models');

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
            password,
        } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const existingCustomer = await CustomerModel.getCustomerByEmail(email);

        if (existingCustomer) {
            return res.status(400).json({ error: 'Customer with this email already exists' });
        }

        const newCustomer = new CustomerModel(
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
            hashedPassword
        );
        const customerId = await newCustomer.createCustomer();

        const token = jwt.sign({ customerId }, jwtSecret, { expiresIn: '1h' });

        res.status(201).json({ customerId, token, message: 'Customer created successfully!' });
    } catch (error) {
        console.error('Error creating customer:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;

        const customer = await CustomerModel.getCustomerByEmail(email);

        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        const passwordMatch = await bcrypt.compare(password, customer.hashedPassword);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        const token = jwt.sign({ customerId: customer.id }, jwtSecret, { expiresIn: '1h' });

        res.status(200).json({ customerId: customer.id, token, message: 'Login successful!' });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = { signup, login };
