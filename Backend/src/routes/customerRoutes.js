const express = require('express');
const authenticate = require('../middlewares/authMiddleware');
const { customerController } = require('../controllers');

const router = express.Router();

router.post('/signup', customerController.signup);
router.post('/login', customerController.login);
router.get('/profile', authenticate, customerController.getCustomerProfile);
router.put('/profile', authenticate, customerController.updateCustomerProfile);
router.post('/logout', authenticate, customerController.logout);

module.exports = router;
