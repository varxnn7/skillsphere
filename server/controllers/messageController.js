const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const { handleFileUpload } = require('../middleware/upload');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Send a message via HTTP
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res, next) => {
  try {
    const { conversationId, content, type = 'text', fileUrl = '', fileName = '', fileSize = 0 } = req.body;

    if (!conversationId || !content) {
      return res.status(400).json({ success: false, message: 'Conversation ID and content are required' });
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user.id
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found or access denied' });
    }

    // 1. Create message
    const message = await Message.create({
      conversation: conversationId,
      sender: req.user.id,
      content,
      type,
      fileUrl,
      fileName,
      fileSize
    });

    // 2. Update conversation info
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = Date.now();

    // Increment unread count for other participants
    conversation.participants.forEach(pId => {
      const participantId = pId.toString();
      if (participantId !== req.user.id) {
        const currentUnread = conversation.unreadCount.get(participantId) || 0;
        conversation.unreadCount.set(participantId, currentUnread + 1);
      }
    });

    await conversation.save();

    const populatedMessage = await message.populate('sender', 'name email avatar role');

    // 3. Emit real-time socket events if Socket.IO is initialized
    const io = req.app.get('io');
    if (io) {
      // Broadcast message to room
      io.to(conversationId).emit('new_message', populatedMessage);

      // Alert other participants
      conversation.participants.forEach(async (pId) => {
        const participantId = pId.toString();
        if (participantId !== req.user.id) {
          io.to(participantId).emit('conversation_updated', {
            conversationId,
            lastMessage: populatedMessage,
            unreadCount: conversation.unreadCount.get(participantId)
          });

          // Check if receiver is online and active in room
          const { onlineUsers } = require('../socket');
          const receiverSocketId = onlineUsers.get(participantId);
          const activeRooms = io.sockets.adapter.rooms.get(conversationId);
          const isReceiverInRoom = activeRooms && receiverSocketId && activeRooms.has(receiverSocketId);

          if (!isReceiverInRoom) {
            const senderUser = await User.findById(req.user.id).select('name');
            const notification = await Notification.create({
              user: participantId,
              type: 'new_message',
              title: 'New Message',
              message: `You received a message from ${senderUser?.name || 'User'}: "${content.substring(0, 50)}"`,
              link: `/messages/${conversationId}`,
              data: { conversationId, messageId: message._id }
            });

            io.to(participantId).emit('new_notification', notification);
          }
        }
      });
    }

    res.status(201).json({ success: true, message: populatedMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload file or image attachment for chat
// @route   POST /api/messages/upload
// @access  Private
exports.uploadChatFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const fileUrl = await handleFileUpload(req);

    res.status(200).json({
      success: true,
      fileUrl,
      fileName: req.file.originalname,
      fileSize: req.file.size
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
