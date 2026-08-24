const express = require('express');
const router = express.Router();
const {
  register,
  login,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  googleOAuth,
  me,
  logout,
  updatePassword,
  updateAccount
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.post('/google-oauth', googleOAuth);

// Protected routes
router.get('/me', protect, me);
router.put('/update-password', protect, updatePassword);
router.put('/update-account', protect, updateAccount);
router.post('/logout', protect, logout);

module.exports = router;
