const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const { TokenModel } = require('../models');

async function authenticate(req, res, next) {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized - Missing token' });
    }

    const isBlacklisted = await TokenModel.isTokenBlacklisted(token);
    if (isBlacklisted) {
        return res.status(401).json({ error: 'Unauthorized - Token has been invalidated' });
    }
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Unauthorized - Invalid token' });
        }
        req.user = decoded;
        next();
    });
}

module.exports = authenticate;

// Apply the authentication middleware to future route
// router.get('/protected-route', authenticate, someControllerFunction);

