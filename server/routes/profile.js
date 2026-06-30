const express = require('express');
const router = express.Router();
const {
  getFreelancerProfile,
  updateFreelancerProfile,
  addPortfolioItem,
  uploadResume,
  getClientProfile,
  updateClientProfile,
  uploadAvatar
} = require('../controllers/profileController');
const { protect, optionalProtect } = require('../middleware/auth');
const { isFreelancer, isClient } = require('../middleware/roleCheck');
const { upload, checkCloudinaryConfig } = require('../middleware/upload');

// Public routes for profile queries
router.get('/freelancer/:id', optionalProtect, getFreelancerProfile);
router.get('/client/:id', getClientProfile);

// Shared avatar upload route (both Client and Freelancer)
router.post('/upload-avatar', protect, checkCloudinaryConfig, upload.single('avatar'), uploadAvatar);

// Protected Freelancer routes
router.put('/freelancer', protect, isFreelancer, updateFreelancerProfile);
router.post('/freelancer/portfolio', protect, isFreelancer, checkCloudinaryConfig, upload.single('portfolioImage'), addPortfolioItem);
router.post('/freelancer/upload-resume', protect, isFreelancer, checkCloudinaryConfig, upload.single('resume'), uploadResume);

// Protected Client routes
router.put('/client', protect, isClient, updateClientProfile);

module.exports = router;
