const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { isClient } = require('../middleware/roleCheck');
const {
  createGig,
  getGigs,
  getGig,
  updateGig,
  deleteGig,
  incrementViews,
  getMyGigs,
  getGigsByCategory,
  updateMilestoneInProgress,
  updateMilestoneSubmit,
  updateMilestoneRevision
} = require('../controllers/gigController');

// Public search/browse routes
router.get('/', getGigs);
router.get('/category/:category', getGigsByCategory);

// Client-specific list route
router.get('/client/my-gigs', protect, isClient, getMyGigs);

// Create route
router.post('/', protect, isClient, createGig);

// Single gig management
router.get('/:id', getGig);
router.put('/:id', protect, isClient, updateGig);
router.delete('/:id', protect, deleteGig);
router.post('/:id/view', incrementViews);

// Milestone Tracking routes
router.put('/:id/milestones/:index/in-progress', protect, updateMilestoneInProgress);
router.put('/:id/milestones/:index/submit', protect, updateMilestoneSubmit);
router.put('/:id/milestones/:index/revision', protect, updateMilestoneRevision);

module.exports = router;

