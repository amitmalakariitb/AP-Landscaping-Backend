const customerController = require('./customerController');
const providerController = require('./providerController');
const OrderController = require('./orderController');
const notificationController = require('./notificationController');
const reviewController = require('./reviewController');
const crewController = require('./crewController');
const superUserController = require('./superUserController');
const messageController = require('./messageController')


module.exports = {
    customerController,
    providerController,
    OrderController,
    notificationController,
    reviewController,
    crewController,
    superUserController,
    messageController
};
