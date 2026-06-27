const express = require('express');
const router = express.Router();
const {
  searchFreelancers,
  searchGigs,
  getSuggestions
} = require('../controllers/searchController');

router.get('/freelancers', searchFreelancers);
router.get('/gigs', searchGigs);
router.get('/suggestions', getSuggestions);

module.exports = router;
