const express = require('express');
const authenticate = require('../middlewares/authMiddleware');
const { providerController } = require('../controllers');

const router = express.Router();

router.post('/signup', providerController.signup);
router.post('/login', providerController.login);
router.post('/logout', authenticate, providerController.logout);
router.get('/profile', authenticate, providerController.getProviderProfile);
router.put('/profile', authenticate, providerController.updateProviderProfile);


module.exports = router;
