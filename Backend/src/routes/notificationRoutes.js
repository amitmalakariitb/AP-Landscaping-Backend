const express = require('express');
const { notificationController } = require('../controllers');

const router = express.Router();

router.post('/', notificationController.createNotification);
router.get('/:notificationId', notificationController.getNotification);
router.get('/receiver/:receiver', notificationController.getNotificationsByReceiver);
router.put('/:notificationId', notificationController.updateNotification);
router.delete('/:notificationId', notificationController.deleteNotification);

module.exports = router;
