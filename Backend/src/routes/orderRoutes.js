const express = require('express');
const router = express.Router();
const { OrderController } = require('../controllers');
const authenticate = require('../middlewares/authMiddleware');

router.post('/create', authenticate, OrderController.createOrder);
router.put('/update/:orderId', authenticate, OrderController.updateOrder);
router.put('/cancel/:orderId', authenticate, OrderController.cancelOrder);
router.get('/customerOrders/:customerId', authenticate, OrderController.getCustomerOrders);
router.get('/providerOrders/:providerId', authenticate, OrderController.getProviderOrders)

module.exports = router;
