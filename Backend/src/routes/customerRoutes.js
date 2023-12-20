const express = require('express');
const authenticate = require('../middlewares/authMiddleware');
const { customerController } = require('../controllers');

const router = express.Router();

router.post('/signup', customerController.signup);
router.post('/login', customerController.login);

module.exports = router;
