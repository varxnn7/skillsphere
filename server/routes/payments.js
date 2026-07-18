const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { isAdmin, isClient } = require('../middleware/roleCheck');
const {
  createOrder,
  verifyPayment,
  releasePayment,
  refundPayment,
  getMyPayments,
  getMyEarnings,
  getGigPayments,
  getAdminPayments,
  getAdminStats,
  getPaymentDetail
} = require('../controllers/paymentController');

router.use(protect);

router.post('/create-order', isClient, createOrder);
router.post('/verify', isClient, verifyPayment);
router.post('/release/:paymentId', isClient, releasePayment);
router.post('/refund/:paymentId', isAdmin, refundPayment);

router.get('/my-payments', getMyPayments);
router.get('/my-earnings', getMyEarnings);
router.get('/gig/:gigId', getGigPayments);

// Admin routes MUST come before /:paymentId wildcard
router.get('/admin/all', isAdmin, getAdminPayments);
router.get('/admin/stats', isAdmin, getAdminStats);

// Wildcard route last
router.get('/:paymentId', getPaymentDetail);

module.exports = router;

