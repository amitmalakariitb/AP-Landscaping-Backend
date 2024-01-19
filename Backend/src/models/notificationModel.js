const admin = require('firebase-admin');
const db = require('../db');

class NotificationModel {
    constructor(sender, receiver, content) {
        this.sender = sender || null;
        this.receiver = receiver || null;
        this.content = content || null;
        this.creationTime = new Date();
    }

    async createNotification() {
        const notificationsCollection = admin.firestore().collection('notifications');

        const notificationData = {};

        Object.entries(this).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                notificationData[key] = value;
            }
        });

        const newNotificationRef = await notificationsCollection.add(notificationData);
        return newNotificationRef.id;
    }

    static async createNotificationByUsers(sender, receiver, content) {
        try {
            const notificationsCollection = admin.firestore().collection('notifications');

            const notificationData = {
                sender,
                receiver,
                content,
                creationTime: new Date(),
            };

            const newNotificationRef = await notificationsCollection.add(notificationData);
            return newNotificationRef.id;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }

    static async updateNotification(notificationId, updateData) {
        const notificationRef = admin.firestore().collection('notifications').doc(notificationId);

        await notificationRef.update(updateData);
    }

    static async getNotificationById(notificationId) {
        const notificationRef = admin.firestore().collection('notifications').doc(notificationId);
        const snapshot = await notificationRef.get();

        if (snapshot.exists) {
            const notificationData = snapshot.data();
            notificationData.id = snapshot.id;
            return notificationData;
        } else {
            return null;
        }
    }

    static async getNotificationsByReceiver(receiver) {
        try {
            const snapshot = await db.collection('notifications').where('receiver', '==', receiver).get();

            const notifications = [];
            snapshot.forEach(doc => {
                const notificationData = doc.data();
                notificationData.id = doc.id;
                notifications.push(notificationData);
            });

            return notifications;
        } catch (error) {
            console.error('Error getting notifications by receiver:', error);
            throw error;
        }
    }

    static async deleteNotification(notificationId) {
        const notificationRef = admin.firestore().collection('notifications').doc(notificationId);
        await notificationRef.delete();
    }
}

module.exports = NotificationModel;
