const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roleCheck');
const { upload, checkCloudinaryConfig } = require('../middleware/upload');
const {
  raiseDispute,
  getOwnDisputes,
  getAdminDisputes,
  getDisputeDetail,
  addEvidence,
  resolveDispute
} = require('../controllers/disputeController');

router.use(protect);

router.post('/', checkCloudinaryConfig, upload.array('evidence', 5), raiseDispute);
router.get('/', getOwnDisputes);
router.get('/admin/all', isAdmin, getAdminDisputes);
router.get('/:id', getDisputeDetail);
router.put('/:id/evidence', checkCloudinaryConfig, upload.single('evidence'), addEvidence);
router.put('/:id/resolve', isAdmin, resolveDispute);

module.exports = router;
