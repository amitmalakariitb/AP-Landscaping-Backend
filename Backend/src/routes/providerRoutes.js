const express = require('express');
const authenticate = require('../middlewares/authMiddleware');
const { providerController } = require('../controllers');

const router = express.Router();

router.post('/signup', providerController.signup);
router.post('/login', providerController.login);

module.exports = router;
