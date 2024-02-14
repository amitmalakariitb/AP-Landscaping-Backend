const express = require('express');
const router = express.Router();
const { OrderController } = require('../controllers');
const authenticate = require('../middlewares/authMiddleware');
const { OrderModel } = require('../models');

router.post('/create', authenticate, OrderController.createOrder);
router.get('/:orderId', authenticate, OrderController.getOrderById);
router.put('/update/:orderId', authenticate, OrderController.updateOrder);
router.put('/update/customer/:orderId', authenticate, OrderController.updateOrderByCustomer);
router.put('/update/provider/:orderId', authenticate, OrderController.updateOrderByProvider);
router.put('/cancel/customer/:orderId', authenticate, OrderController.cancelOrderByCustomer);
router.put('/cancel/provider/:orderId', authenticate, OrderController.cancelOrderByProvider);
router.get('/customerOrders/:customerId', authenticate, OrderController.getCustomerOrders);
router.get('/past/customer', authenticate, OrderController.getPastOrdersByCustomer);
router.get('/upcoming/customer', authenticate, OrderController.getUpcomingOrdersByCustomer);
router.get('/providerOrders/:providerId', authenticate, OrderController.getProviderOrders)
router.get('/past/provider', authenticate, OrderController.getPastOrdersByProvider);
router.get('/upcoming/provider', authenticate, OrderController.getUpcomingOrdersByProvider);
router.get('/no-provider', authenticate, OrderController.getOrdersWithNoProvider);
router.post('/orders/assign-provider', authenticate, OrderController.assignProviderToOrder);
router.put('/orders/:orderId/accept', authenticate, OrderController.acceptOrDeclineOrder);
module.exports = router;
