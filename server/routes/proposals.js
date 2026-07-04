const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { isFreelancer, isClient } = require('../middleware/roleCheck');
const {
  submitProposal,
  getGigProposals,
  getMyProposals,
  getProposal,
  acceptProposal,
  rejectProposal,
  negotiateProposal,
  withdrawProposal
} = require('../controllers/proposalController');

// All proposal routes require authentication
router.use(protect);

router.post('/', isFreelancer, submitProposal);
router.get('/my-proposals', isFreelancer, getMyProposals);
router.get('/gig/:gigId', getGigProposals);

router.get('/:id', getProposal);
router.put('/:id/accept', isClient, acceptProposal);
router.put('/:id/reject', isClient, rejectProposal);
router.put('/:id/negotiate', negotiateProposal);
router.put('/:id/withdraw', isFreelancer, withdrawProposal);

module.exports = router;
