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
        isRescheduled = false,
        orderId,
    ) {
        this.serviceType = serviceType || null;
        this.address = address || null;
        this.date = date || null;
        this.time = time || null;
        this.expectationNote = expectationNote || null;
        this.customerId = customerId || null;
        this.providerId = providerId || null;
        this.isFinished = isFinished;
        this.isCancelled = isCancelled;
        this.isRescheduled = isRescheduled;
        this.orderId = orderId || null;
    }

    async createOrder() {
        try {
            const ordersCollection = admin.firestore().collection('orders');
            const totalOrders = await ordersCollection.get().then(snapshot => snapshot.size + 1);
            const orderId = `#${totalOrders}`;
            const orderData = { ...this, orderId };  // Include orderId in the orderData

            const newOrderRef = await ordersCollection.add(orderData);
            return newOrderRef.id;
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    }

    static async updateOrder(orderId, updateData) {
        try {
            const orderRef = admin.firestore().collection('orders').doc(orderId);
            const snapshot = await orderRef.get();
            const orderData = snapshot.data();

            if (updateData.date !== undefined && updateData.date !== orderData.date ||
                updateData.time !== undefined && updateData.time !== orderData.time) {
                updateData.isRescheduled = true;
            }

            await orderRef.update(updateData);
        } catch (error) {
            console.error('Error updating order:', error);
            throw error;
        }
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

    static async getPastOrdersByCustomer(customerId) {
        try {
            const currentDate = new Date();
            const timestamp = admin.firestore.Timestamp.fromDate(currentDate);
            const snapshot = await db.collection('orders')
                .where('customerId', '==', customerId)
                // .where('date', '<', timestamp.toDate().toISOString())
                .where('isFinished', '==', true)
                .where('isCancelled', '==', true)
                .get();
            const pastOrders = [];
            snapshot.forEach(doc => {
                const orderData = doc.data();
                orderData.id = doc.id;
                pastOrders.push(orderData);
            });

            return pastOrders;
        } catch (error) {
            console.error('Error getting past orders by customer:', error);
            throw error;
        }
    }


    static async getUpcomingOrdersByCustomer(customerId) {
        try {
            const currentDate = new Date();
            const timestamp = admin.firestore.Timestamp.fromDate(currentDate);
            const snapshot = await db.collection('orders')
                .where('customerId', '==', customerId)
                // .where('date', '>=', timestamp.toDate().toISOString())
                .where('isFinished', '==', false)
                .where('isCancelled', '==', false)
                .get();

            const upcomingOrders = [];
            snapshot.forEach(doc => {
                const orderData = doc.data();
                orderData.id = doc.id;
                upcomingOrders.push(orderData);
            });

            return upcomingOrders;
        } catch (error) {
            console.error('Error getting upcoming orders by customer:', error);
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

    static async getPastOrdersByProvider(providerId) {
        try {
            const currentDate = new Date();
            const timestamp = admin.firestore.Timestamp.fromDate(currentDate);
            const snapshot = await db.collection('orders')
                .where('providerId', '==', providerId)
                // .where('date', '<', timestamp.toDate().toISOString())
                .where('isFinished', '==', true)
                .where('isCancelled', '==', true)
                .get();

            const pastOrders = [];
            snapshot.forEach(doc => {
                const orderData = doc.data();
                orderData.id = doc.id;
                pastOrders.push(orderData);
            });

            return pastOrders;
        } catch (error) {
            console.error('Error getting past orders by provider:', error);
            throw error;
        }
    }


    static async getUpcomingOrdersByProvider(providerId) {
        try {
            const currentDate = new Date();
            const timestamp = admin.firestore.Timestamp.fromDate(currentDate);
            const snapshot = await db.collection('orders')
                .where('providerId', '==', providerId)
                // .where('date', '>=', timestamp.toDate().toISOString())
                .where('isFinished', '==', false)
                .where('isCancelled', '==', false)
                .get();

            const upcomingOrders = [];
            snapshot.forEach(doc => {
                const orderData = doc.data();
                orderData.id = doc.id;
                upcomingOrders.push(orderData);
            });

            return upcomingOrders;
        } catch (error) {
            console.error('Error getting upcoming orders by provider:', error);
            throw error;
        }
    }
    static async getOrdersWithNoProvider() {
        try {
            const snapshot = await db.collection('orders')
                .where('providerId', '==', null)
                .get();

            const ordersWithNoProvider = [];
            snapshot.forEach(doc => {
                const orderData = doc.data();
                orderData.id = doc.id;
                ordersWithNoProvider.push(orderData);
            });

            return ordersWithNoProvider;
        } catch (error) {
            console.error('Error getting orders with no provider:', error);
            throw error;
        }
    }

}

module.exports = OrderModel;
