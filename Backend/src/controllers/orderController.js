const { OrderModel, ProviderModel, NotificationModel, SuperuserModel } = require('../models');

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


async function checkIfSuperuser(superuserId) {

    const superuser = await SuperuserModel.getSuperuserById(superuserId);

    return !!superuser;
}

async function assignProviderToOrder(req, res) {
    try {
        const { orderId, providerId } = req.body;

        const isSuperuser = await checkIfSuperuser(req.user.superuserId);

        if (!isSuperuser) {
            return res.status(403).json({ error: 'Unauthorized - Only superusers can assign providers to orders' });
        }

        await OrderModel.updateOrder(orderId, { providerId });

        res.status(200).json({ message: 'Provider assigned to order successfully' });
    } catch (error) {
        console.error('Error assigning provider to order:', error);
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


async function cancelOrderByCustomer(req, res) {
    try {
        const { orderId } = req.params;
        const customerId = req.user.customerId;
        const order = await OrderModel.getOrderById(orderId);
        if (!order || order.customerId !== customerId) {
            return res.status(404).json({ error: 'Order not found or unauthorized' });
        }

        await OrderModel.updateOrder(orderId, { isCancelled: true });

        res.status(200).json({ message: 'Order cancelled successfully' });
    } catch (error) {
        console.error('Error cancelling order by customer:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function cancelOrderByProvider(req, res) {
    try {
        const { orderId } = req.params;
        const providerId = req.user.providerId;

        const order = await OrderModel.getOrderById(orderId);
        if (!order || order.providerId !== providerId) {
            return res.status(404).json({ error: 'Order not found or unauthorized' });
        }

        await OrderModel.updateOrder(orderId, { isCancelled: true, providerId: null });

        res.status(200).json({ message: 'Order cancelled successfully' });
    } catch (error) {
        console.error('Error cancelling order by provider:', error);
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
async function acceptOrDeclineOrder(req, res) {
    try {
        const { orderId } = req.params;
        const { action } = req.body;

        if (action !== 'accept' && action !== 'decline') {
            return res.status(400).json({ error: 'Invalid action. Must be either "accept" or "decline".' });
        }

        const updateData = {
            providerId: action === 'accept' ? req.user.providerId : null,
        };

        await updateOrder(orderId, updateData);

        res.status(200).json({ message: `Order ${action === 'accept' ? 'accepted' : 'declined'} successfully` });
    } catch (error) {
        console.error('Error accepting/declining order:', error);
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

async function getOrdersWithNoProvider(req, res) {
    try {
        const orders = await OrderModel.getOrdersWithNoProvider();
        res.status(200).json({ orders });
    } catch (error) {
        console.error('Error getting orders with no provider:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = { createOrder, getOrderById, updateOrder, updateOrderByCustomer, updateOrderByProvider, cancelOrderByCustomer, cancelOrderByProvider, getCustomerOrders, getPastOrdersByCustomer, getUpcomingOrdersByCustomer, getProviderOrders, getPastOrdersByProvider, getUpcomingOrdersByProvider, getOrdersWithNoProvider, assignProviderToOrder, acceptOrDeclineOrder };
