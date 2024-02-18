const express = require('express');
const router = express.Router();
const { signup, login, logout } = require('../controllers/superUserController');
const authenticate = require('../middlewares/authMiddleware');


router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', authenticate, logout);


module.exports = router;
