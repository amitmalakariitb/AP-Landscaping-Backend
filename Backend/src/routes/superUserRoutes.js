const express = require('express');
const router = express.Router();
const { superUserController } = require('../controllers');
const authenticate = require('../middlewares/authMiddleware');


router.post('/signup', superUserController.signup);
router.post('/login', superUserController.login);
router.post('/logout', authenticate, superUserController.logout);
router.get('/providers', authenticate, superUserController.getAllProviders);
router.get('/customers', authenticate, superUserController.getAllCustomers);
router.get('/unassigned', authenticate, superUserController.getOrdersWithNoProvider);
router.get('/orders', authenticate, superUserController.superuserGetAllOrders);
router.get('/orders/customer/:customerId', authenticate, superUserController.superuserGetOrdersForCustomer);
router.get('/orders/provider/:providerId', authenticate, superUserController.superuserGetOrdersForProvider);

module.exports = router;
