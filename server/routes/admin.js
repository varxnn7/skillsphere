const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roleCheck');
const {
  getStats,
  getUsers,
  suspendUser,
  activateUser,
  verifyUser,
  deleteUser,
  getGigs,
  approveGig,
  rejectGig,
  getRevenue,
  getTopFreelancers
} = require('../controllers/adminController');

router.use(protect);
router.use(isAdmin);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/:id/suspend', suspendUser);
router.put('/users/:id/activate', activateUser);
router.put('/users/:id/verify', verifyUser);
router.delete('/users/:id', deleteUser);

router.get('/gigs', getGigs);
router.put('/gigs/:id/approve', approveGig);
router.put('/gigs/:id/reject', rejectGig);

router.get('/revenue', getRevenue);
router.get('/top-freelancers', getTopFreelancers);

module.exports = router;
