const express = require('express');
const router = express.Router();
const {
  getFreelancerProfile,
  updateFreelancerProfile,
  addPortfolioItem,
  uploadResume,
  getClientProfile,
  updateClientProfile
} = require('../controllers/profileController');
const { protect } = require('../middleware/auth');
const { isFreelancer, isClient } = require('../middleware/roleCheck');
const { upload } = require('../middleware/upload');

// Public routes for profile queries
router.get('/freelancer/:id', getFreelancerProfile);
router.get('/client/:id', getClientProfile);

// Protected Freelancer routes
router.put('/freelancer', protect, isFreelancer, updateFreelancerProfile);
router.post('/freelancer/portfolio', protect, isFreelancer, upload.single('portfolioImage'), addPortfolioItem);
router.post('/freelancer/upload-resume', protect, isFreelancer, upload.single('resume'), uploadResume);

// Protected Client routes
router.put('/client', protect, isClient, updateClientProfile);

module.exports = router;
