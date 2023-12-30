const { OrderModel, ProviderModel } = require('../models');

async function createOrder(req, res) {
    try {
        const {
            serviceType,
            address,
            date,
            time,
            expectationNote,
            customerId,
        } = req.body;

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

module.exports = { createOrder, updateOrder, cancelOrder, getCustomerOrders, getProviderOrders };
