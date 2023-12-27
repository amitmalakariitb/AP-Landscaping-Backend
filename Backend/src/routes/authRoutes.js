const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/auth/google', authController.googleLogin);
router.get('/auth/google/callback', authController.googleCallback);
router.get('/logout', authController.logout);

module.exports = router;
