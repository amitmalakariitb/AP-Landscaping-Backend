const passport = require('../middlewares/passport');
const CustomerModel = require('../models/customerModel');
const providerModel = require('../models/providerModel');

exports.googleLogin = passport.authenticate('google', { scope: ['profile', 'email'] });

exports.googleCallback = async (req, res, next) => {
    passport.authenticate('google', async (err, user) => {
        if (err) {
            return res.status(401).json({ error: 'Authentication failed' });
        }
        const googleId = user.id;
        const role = req.body.role;
        try {
            let loggedUser;
            if (role === 'customer') {
                loggedUser = await CustomerModel.getCustomerByField('googleId', googleId);
                if (!loggedUser) {
                    const googleProfile = user;
                    loggedUser = await CustomerModel.createCustomerFromGoogle(googleProfile);
                }

            } else if (role === 'provider') {
                loggedUser = await providerModel.getProviderByField('googleId', googleId);
                if (!loggedUser) {
                    const googleProfile = user;
                    loggedUser = await providerModel.createProviderFromGoogle(googleProfile);
                }
            }

            console.log(loggedUser)

            res.status(200).json({ "user": loggedUser });
        } catch (error) {
            console.error('Error handling Google login:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    })(req, res, next);
};

exports.logout = (req, res) => {
    req.logout();
    res.redirect('/');
};
