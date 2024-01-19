const { OrderModel, ProviderModel, NotificationModel } = require('../models');

async function createOrder(req, res) {
    try {
        const {
            serviceType,
            address,
            date,
            time,
            expectationNote,
        } = req.body;
        const customerId = req.user.customerId

        const allProviders = await ProviderModel.getAllProviders();

        const randomProvider = getRandomProvider(allProviders);

        const newOrder = new OrderModel(
            serviceType,
            address,
            date,
            time,
            expectationNote,
            customerId,
            randomProvider.id
        );

        const orderId = await newOrder.createOrder();

        res.status(201).json({ orderId, message: 'Order created successfully!' });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function getOrderById(req, res) {
    try {
        const { orderId } = req.params;

        const order = await OrderModel.getOrderById(orderId);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.status(200).json({ order });
    } catch (error) {
        console.error('Error getting order by ID:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

function getRandomProvider(providers) {
    const randomIndex = Math.floor(Math.random() * providers.length);
    return providers[randomIndex];
}

async function updateOrder(req, res) {
    try {
        const { orderId } = req.params;
        const updateData = req.body;

        await OrderModel.updateOrder(orderId, updateData);

        res.status(200).json({ message: 'Order updated successfully' });
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function updateOrderByCustomer(req, res) {
    try {
        const { orderId } = req.params;
        const updateData = req.body;

        const existingOrder = await OrderModel.getOrderById(orderId);

        await OrderModel.updateOrder(orderId, updateData);

        const notificationContent = `Order (${orderId}) has been updated by customer.`;
        const sender = req.user.customerId;
        const receiver = existingOrder.providerId;

        await NotificationModel.createNotificationByUsers(sender, receiver, notificationContent);

        res.status(200).json({ message: 'Order updated successfully' });
    } catch (error) {
        console.error('Error updating order by customer:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


async function updateOrderByProvider(req, res) {
    try {
        const { orderId } = req.params;
        const updateData = req.body;

        const existingOrder = await OrderModel.getOrderById(orderId);
        await OrderModel.updateOrder(orderId, updateData);

        const notificationContent = `Order (${orderId}) has been updated by provider.`;
        const sender = req.user.providerId;
        const receiver = existingOrder.customerId;

        await NotificationModel.createNotificationByUsers(sender, receiver, notificationContent);

        res.status(200).json({ message: 'Order updated successfully' });
    } catch (error) {
        console.error('Error updating order by provider:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


async function cancelOrder(req, res) {
    try {
        const { orderId } = req.params;

        await OrderModel.updateOrder(orderId, { isCancelled: true });

        res.status(200).json({ message: 'Order cancelled successfully' });
    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function getCustomerOrders(req, res) {
    try {
        const { customerId } = req.params;

        const customerOrders = await OrderModel.getOrdersByCustomer(customerId);

        res.status(200).json({ orders: customerOrders });
    } catch (error) {
        console.error('Error retrieving customer orders:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function getPastOrdersByCustomer(req, res) {
    try {
        const customerId = req.user.customerId;
        console.log(customerId)
        const pastOrders = await OrderModel.getPastOrdersByCustomer(customerId);
        res.status(200).json({ pastOrders });
    } catch (error) {
        console.error('Error getting past orders by customer:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function getUpcomingOrdersByCustomer(req, res) {
    try {
        const customerId = req.user.customerId;
        const upcomingOrders = await OrderModel.getUpcomingOrdersByCustomer(customerId);
        res.status(200).json({ upcomingOrders });
    } catch (error) {
        console.error('Error getting upcoming orders by customer:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function getProviderOrders(req, res) {
    try {
        const { providerId } = req.params;

        const providerOrders = await OrderModel.getOrdersByProvider(providerId);

        res.status(200).json({ orders: providerOrders });
    } catch (error) {
        console.error('Error retrieving provider orders:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function getPastOrdersByProvider(req, res) {
    try {
        const providerId = req.user.providerId;
        console.log(providerId)
        const pastOrders = await OrderModel.getPastOrdersByProvider(providerId);
        res.status(200).json({ pastOrders });
    } catch (error) {
        console.error('Error getting past orders by provider:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function getUpcomingOrdersByProvider(req, res) {
    try {
        const providerId = req.user.providerId;
        const upcomingOrders = await OrderModel.getUpcomingOrdersByProvider(providerId);
        res.status(200).json({ upcomingOrders });
    } catch (error) {
        console.error('Error getting upcoming orders by provider:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = { createOrder, getOrderById, updateOrder, updateOrderByCustomer, updateOrderByProvider, cancelOrder, getCustomerOrders, getPastOrdersByCustomer, getUpcomingOrdersByCustomer, getProviderOrders, getPastOrdersByProvider, getUpcomingOrdersByProvider };
