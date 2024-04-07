const express = require('express');
const router = express.Router();
const { paymentController } = require('../controllers');

router.post('/checkout/session', paymentController.initiateCheckout);
router.post('/checkout/webhook', paymentController.handleCheckoutSession);


module.exports = router;