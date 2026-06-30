const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllRead,
  deleteNotification
} = require('../controllers/notificationController');

router.use(protect);

router.route('/')
  .get(getNotifications);

router.get('/unread-count', getUnreadCount);
router.put('/read-all', markAllRead);

router.route('/:id')
  .put(markAsRead)
  .delete(deleteNotification);

module.exports = router;
