const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { sendMessage, uploadChatFile } = require('../controllers/messageController');
const { upload, checkCloudinaryConfig } = require('../middleware/upload');

router.use(protect);

router.post('/', sendMessage);
router.post('/upload', checkCloudinaryConfig, upload.single('file'), uploadChatFile);

module.exports = router;
