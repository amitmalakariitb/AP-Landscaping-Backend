const express = require('express');
const { googleLogin, googleCallback, logout, appleLogin } = require('../controllers/authController');

const router = express.Router();

router.get('/auth/google', googleLogin);
router.post('/auth/google/callback', googleCallback);
router.get('/logout', logout);
router.post('/auth/apple', appleLogin);

module.exports = router;
