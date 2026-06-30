const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getDashboardStats } = require('../controllers/dashboardController');

// Retrieve role-based dashboard stats
router.get('/stats', protect, getDashboardStats);

module.exports = router;
