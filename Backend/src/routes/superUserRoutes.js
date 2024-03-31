const express = require('express');
const router = express.Router();
const { superUserController } = require('../controllers');
const authenticate = require('../middlewares/authMiddleware');


router.post('/signup', superUserController.signup);
router.post('/login', superUserController.login);
router.post('/logout', authenticate, superUserController.logout);
router.get('/providers', superUserController.getAllProviders);
router.get('/customers', superUserController.getAllCustomers);
router.get('/unassigned', authenticate, superUserController.getOrdersWithNoProvider);

module.exports = router;
