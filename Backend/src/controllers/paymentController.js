const { OrderModel } = require('../models');
const admin = require('firebase-admin');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function initiateCheckout(req, res) {
    try {
        const { orderId, amount } = req.body;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'Your Product Name',
                        },
                        unit_amount: amount * 100,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            // success_url: `${process.env.CLIENT_URL}/success?orderId=${orderId}`, 
            // cancel_url: `${process.env.CLIENT_URL}/cancel?orderId=${orderId}`,
            success_url: 'https://www.google.com',
            cancel_url: 'https://www.google.com',

        });

        const updatedOrder = await OrderModel.updateOrder(orderId, { stripePaymentSessionId: session.id });

        res.status(200).json({ sessionId: session.id });
    } catch (error) {
        console.error('Error initiating checkout:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function handleCheckoutSession(req, res) {
    try {
        const payload = req.body;

        const sig = req.headers['stripe-signature'];
        const event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET);

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;

            const order = await OrderModel.getOrderByStripeSessionId(session.id);

            await OrderModel.updateOrder(order.id, { status: 'completed' });

            res.status(200).end();
        }
    } catch (error) {
        console.error('Error handling checkout session:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = { initiateCheckout, handleCheckoutSession };
