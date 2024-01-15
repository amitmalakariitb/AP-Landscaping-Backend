const { NotificationModel } = require('../models');

async function createNotification(req, res) {
    try {
        const { sender, receiver, content } = req.body;

        const newNotification = new NotificationModel(sender, receiver, content);
        const notificationId = await newNotification.createNotification();

        res.status(201).json({ notificationId, message: 'Notification created successfully!' });
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function getNotification(req, res) {
    try {
        const notificationId = req.params.notificationId;
        const notification = await NotificationModel.getNotificationById(notificationId);

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        res.status(200).json({ notification });
    } catch (error) {
        console.error('Error getting notification:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function getNotificationsByReceiver(req, res) {
    try {
        const receiver = req.params.receiver;
        const notifications = await NotificationModel.getNotificationsByReceiver(receiver);

        res.status(200).json({ notifications });
    } catch (error) {
        console.error('Error getting notifications by receiver:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function updateNotification(req, res) {
    try {
        const notificationId = req.params.notificationId;
        const updateData = req.body;

        await NotificationModel.updateNotification(notificationId, updateData);

        const updatedNotification = await NotificationModel.getNotificationById(notificationId);

        res.status(200).json({ updatedNotification, message: 'Notification updated successfully!' });
    } catch (error) {
        console.error('Error updating notification:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function deleteNotification(req, res) {
    try {
        const notificationId = req.params.notificationId;

        await NotificationModel.deleteNotification(notificationId);

        res.status(200).json({ message: 'Notification deleted successfully!' });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = {
    createNotification,
    getNotification,
    getNotificationsByReceiver,
    updateNotification,
    deleteNotification,
};
