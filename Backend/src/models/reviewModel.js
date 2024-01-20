const admin = require('firebase-admin');
const db = require('../db');

class ReviewModel {
    constructor(reviewerId, providerId, customerId, orderId, rating, comments) {
        this.reviewerId = reviewerId || null;
        this.providerId = providerId || null;
        this.customerId = customerId || null;
        this.orderId = orderId || null;
        this.rating = rating || null;
        this.comments = comments || null;
    }

    async createReview() {
        const reviewsCollection = admin.firestore().collection('reviews');

        const reviewData = {};

        Object.entries(this).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                reviewData[key] = value;
            }
        });

        const newReviewRef = await reviewsCollection.add(reviewData);
        return newReviewRef.id;
    }

    static async getReviewById(reviewId) {
        const reviewRef = admin.firestore().collection('reviews').doc(reviewId);
        const snapshot = await reviewRef.get();

        if (snapshot.exists) {
            const reviewData = snapshot.data();
            reviewData.id = snapshot.id;
            return reviewData;
        } else {
            return null;
        }
    }

    static async updateReview(reviewId, updateData) {
        const reviewRef = admin.firestore().collection('reviews').doc(reviewId);

        await reviewRef.update(updateData);
    }

    static async deleteReview(reviewId) {
        const reviewRef = admin.firestore().collection('reviews').doc(reviewId);

        await reviewRef.delete();
    }

    static async getReviewsByReviewer(reviewerId) {
        const snapshot = await db.collection('reviews').where('reviewerId', '==', reviewerId).get();

        const reviews = [];
        snapshot.forEach(doc => {
            const reviewData = doc.data();
            reviewData.id = doc.id;
            reviews.push(reviewData);
        });

        return reviews;
    }
}

module.exports = ReviewModel;