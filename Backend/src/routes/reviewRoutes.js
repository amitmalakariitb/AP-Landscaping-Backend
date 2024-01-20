const express = require('express');
const { reviewController } = require('../controllers');
const authenticate = require('../middlewares/authMiddleware');

const router = express.Router();


router.post('/create', authenticate, reviewController.createReview);
router.get('/getReviews', authenticate, reviewController.getReviews);
router.get('/:reviewId', authenticate, reviewController.getReviewById);
router.put('/update/:reviewId', authenticate, reviewController.updateReview);
router.delete('/delete/:reviewId', authenticate, reviewController.deleteReview);

module.exports = router;
