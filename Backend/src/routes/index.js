const express = require('express');
const customerRoutes = require('./customerRoutes');
const providerRoutes = require('./providerRoutes');

const router = express.Router();

router.use('/customer', customerRoutes);
router.use('/provider', providerRoutes);

module.exports = router;
