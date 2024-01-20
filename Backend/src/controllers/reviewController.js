const { ReviewModel, OrderModel } = require('../models');

async function createReview(req, res) {
    try {
        const { orderId, rating, comments } = req.body;
        let reviewerId, providerId, customerId;

        if (req.user.providerId) {
            const order = await OrderModel.getOrderById(orderId);
            reviewerId = req.user.providerId;
            providerId = reviewerId;
            customerId = order.customerId;
        } else if (req.user.customerId) {
            reviewerId = req.user.customerId;
            const order = await OrderModel.getOrderById(orderId);
            providerId = order.providerId;
            customerId = reviewerId;
        }

        const newReview = new ReviewModel(reviewerId, providerId, customerId, orderId, rating, comments);
        const reviewId = await newReview.createReview();

        res.status(201).json({ reviewId, message: 'Review created successfully!' });
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


async function getReviews(req, res) {
    try {
        let reviewerId;

        if (req.user.providerId) {
            reviewerId = req.user.providerId;
        } else if (req.user.customerId) {
            reviewerId = req.user.customerId;
        }

        const userReviews = await ReviewModel.getReviewsByReviewer(reviewerId);

        res.status(200).json({ reviews: userReviews });
    } catch (error) {
        console.error('Error getting reviews:', error);
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
        const existingReview = await ReviewModel.getReviewById(reviewId);

        if (!existingReview) {
            return res.status(404).json({ error: 'Review not found' });
        }

        if (req.user.providerId === existingReview.reviewerId) {
            await ReviewModel.updateReview(reviewId, updateData);
            res.status(200).json({ message: 'Review updated successfully' });
        } else if (req.user.customerId === existingReview.reviewerId) {
            await ReviewModel.updateReview(reviewId, updateData);
            res.status(200).json({ message: 'Review updated successfully' });
        } else {
            res.status(403).json({ error: 'Unauthorized - You are not the reviewer of this review' });
        }

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

module.exports = { createReview, getReviews, getReviewById, updateReview, deleteReview };
