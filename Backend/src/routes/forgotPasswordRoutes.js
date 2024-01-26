const express = require('express');
const forgotPasswordController = require('../controllers/forgotPasswordController');

const router = express.Router();

router.post('/email', forgotPasswordController.forgotPasswordEmail);
router.post('/phone', forgotPasswordController.forgotPasswordPhone);
router.post('/reset-password', forgotPasswordController.resetPassword);

module.exports = router;
