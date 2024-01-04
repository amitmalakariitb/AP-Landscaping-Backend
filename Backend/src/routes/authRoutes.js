const express = require('express');
const { googleLogin, googleCallback, logout } = require('../controllers/authController');

const router = express.Router();

router.get('/auth/google', googleLogin);
router.get('/auth/google/callback', googleCallback);
router.get('/logout', logout);

module.exports = router;
