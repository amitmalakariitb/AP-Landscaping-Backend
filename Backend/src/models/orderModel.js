const admin = require('firebase-admin');
const db = require('../db');

class OrderModel {
    constructor(
        serviceType,
        address,
        date,
        time,
        expectationNote,
        customerId,
        providerId,
        isFinished = false,
        isCancelled = false,
    ) {
        this.serviceType = serviceType || null;
        this.address = address || null;
        this.date = date || null;
        this.time = time || null;
        this.expectationNote = expectationNote || null;
        this.customerId = customerId || null;
        this.providerId = providerId || null;
        this.isFinished = isFinished;
        this.isCancelled = isCancelled
    }

    async createOrder() {
        const ordersCollection = admin.firestore().collection('orders');

        const orderData = {};

        Object.entries(this).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                orderData[key] = value;
            }
        });

        const newOrderRef = await ordersCollection.add(orderData);
        return newOrderRef.id;
    }

    async updateOrder(orderId, updateData) {
        const orderRef = admin.firestore().collection('orders').doc(orderId);

        await orderRef.update(updateData);
    }

    static async getOrderById(orderId) {
        const orderRef = admin.firestore().collection('orders').doc(orderId);
        const snapshot = await orderRef.get();

        if (snapshot.exists) {
            const orderData = snapshot.data();
            orderData.id = snapshot.id;
            return orderData;
        } else {
            return null;
        }
    }

    static async getOrdersByCustomer(customerId) {
        try {
            const snapshot = await db.collection('orders').where('customerId', '==', customerId).get();

            const orders = [];
            snapshot.forEach(doc => {
                const orderData = doc.data();
                orderData.id = doc.id;
                orders.push(orderData);
            });

            return orders;
        } catch (error) {
            console.error('Error getting orders by customer:', error);
            throw error;
        }
    }

    static async getOrdersByProvider(providerId) {
        try {
            const snapshot = await db.collection('orders').where('providerId', '==', providerId).get();

            const orders = [];
            snapshot.forEach(doc => {
                const orderData = doc.data();
                orderData.id = doc.id;
                orders.push(orderData);
            });

            return orders;
        } catch (error) {
            console.error('Error getting orders by provider:', error);
            throw error;
        }
    }
}

module.exports = OrderModel;
