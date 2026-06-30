const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createConversation,
  getConversations,
  getConversationById,
  getConversationMessages,
  markConversationRead
} = require('../controllers/conversationController');

router.use(protect);

router.route('/')
  .post(createConversation)
  .get(getConversations);

router.route('/:id')
  .get(getConversationById);

router.route('/:id/messages')
  .get(getConversationMessages);

router.route('/:id/read')
  .put(markConversationRead);

module.exports = router;
