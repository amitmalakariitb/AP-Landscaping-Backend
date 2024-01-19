const { ReviewModel, OrderModel } = require('../models');

async function createReview(req, res) {
    try {
        const { orderId, rating, comments } = req.body;
        const customerId = req.user.customerId;
        const order = await OrderModel.getOrderById(orderId);
        const providerId = order.providerId;

        const newReview = new ReviewModel(customerId, providerId, orderId, rating, comments);
        const reviewId = await newReview.createReview();

        res.status(201).json({ reviewId, message: 'Review created successfully!' });
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function getCustomerReviews(req, res) {
    try {
        const customerId = req.user.customerId;
        const customerReviews = await ReviewModel.getReviewsByCustomer(customerId);

        res.status(200).json({ reviews: customerReviews });
    } catch (error) {
        console.error('Error getting customer reviews:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function getReviewById(req, res) {
    try {
        const { reviewId } = req.params;
        const review = await ReviewModel.getReviewById(reviewId);

        if (review) {
            res.status(200).json({ review });
        } else {
            res.status(404).json({ error: 'Review not found' });
        }
    } catch (error) {
        console.error('Error getting review by ID:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function updateReview(req, res) {
    try {
        const { reviewId } = req.params;
        const updateData = req.body;

        await ReviewModel.updateReview(reviewId, updateData);

        res.status(200).json({ message: 'Review updated successfully' });
    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function deleteReview(req, res) {
    try {
        const { reviewId } = req.params;

        await ReviewModel.deleteReview(reviewId);

        res.status(200).json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = { createReview, getCustomerReviews, getReviewById, updateReview, deleteReview };
