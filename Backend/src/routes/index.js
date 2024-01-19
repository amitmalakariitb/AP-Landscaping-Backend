const express = require('express');
const customerRoutes = require('./customerRoutes');
const providerRoutes = require('./providerRoutes');
const authRoutes = require('./authRoutes');
const orderRoutes = require('./orderRoutes')
const notificationRoutes = require('./notificationRoutes');
const reviewRoutes = require('./reviewRoutes')
const { auth } = require('firebase-admin');

const router = express.Router();

router.use('/customer', customerRoutes);
router.use('/provider', providerRoutes);
router.use('/user', authRoutes);
router.use('/orders', orderRoutes);
router.use('/notifications', notificationRoutes);
router.use('/reviews', reviewRoutes)

module.exports = router;
