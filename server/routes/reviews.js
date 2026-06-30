const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  submitReview,
  getFreelancerReviews,
  getClientReviews,
  getGigReviews,
  respondToReview,
  markHelpful,
  flagReview
} = require('../controllers/reviewController');

// Public read routes
router.get('/freelancer/:id', getFreelancerReviews);
router.get('/client/:id', getClientReviews);
router.get('/gig/:id', getGigReviews);

// Private write routes
router.use(protect);
router.post('/', submitReview);
router.put('/:id/response', respondToReview);
router.put('/:id/helpful', markHelpful);
router.put('/:id/flag', flagReview);

module.exports = router;
