const socketio = require('socket.io');
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Notification = require('../models/Notification');
const User = require('../models/User');

const onlineUsers = new Map(); // userId -> socket.id

const initSocket = (server) => {
  const io = socketio(server, {
    cors: {
      origin: '*', // For development, allow all origins
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Authentication Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'skillsphere_secret_key_12345');
      socket.userId = decoded.id;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.userId;
    console.log(`Socket Connected: User ${userId} (${socket.id})`);

    // Add to online users map
    onlineUsers.set(userId, socket.id);

    // Join personal room (for direct notifications/events)
    socket.join(userId);

    // Notify contacts / active conversations that user is online
    try {
      const userConvs = await Conversation.find({ participants: userId });
      userConvs.forEach(conv => {
        conv.participants.forEach(pId => {
          const participantId = pId.toString();
          if (participantId !== userId && onlineUsers.has(participantId)) {
            io.to(participantId).emit('user_online', { userId });
          }
        });
      });
    } catch (err) {
      console.error('Error notifying contacts of online status:', err);
    }

    // Emit initial online users list to this connected client
    const onlineIds = Array.from(onlineUsers.keys());
    socket.emit('online_users_list', onlineIds);

    // ── CHAT EVENTS ──

    // Join conversation room
    socket.on('join_conversation', (conversationId) => {
      socket.join(conversationId);
      console.log(`User ${userId} joined conversation room: ${conversationId}`);
    });

    // Send Message Event
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, content, type = 'text', fileUrl = '', fileName = '', fileSize = 0 } = data;

        if (!conversationId || !content) {
          return socket.emit('error_message', { message: 'Conversation ID and content required' });
        }

        // 1. Create and Save Message to DB
        const message = await Message.create({
          conversation: conversationId,
          sender: userId,
          content,
          type,
          fileUrl,
          fileName,
          fileSize
        });

        // 2. Fetch conversation to update lastMessage and unread counts
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;

        conversation.lastMessage = message._id;
        conversation.lastMessageAt = Date.now();

        // Increment unread count for other participants
        conversation.participants.forEach(pId => {
          const participantId = pId.toString();
          if (participantId !== userId) {
            const currentUnread = conversation.unreadCount.get(participantId) || 0;
            conversation.unreadCount.set(participantId, currentUnread + 1);
          }
        });

        await conversation.save();

        // Populate sender info
        const populatedMessage = await message.populate('sender', 'name email avatar role');

        // 3. Broadcast to all users in the conversation room (including sender)
        io.to(conversationId).emit('new_message', populatedMessage);

        // 4. Emit unread count update and alert notifications to other participants
        conversation.participants.forEach(async (pId) => {
          const participantId = pId.toString();
          if (participantId !== userId) {
            // Send conversation update to refresh last message & unread count
            io.to(participantId).emit('conversation_updated', {
              conversationId,
              lastMessage: populatedMessage,
              unreadCount: conversation.unreadCount.get(participantId)
            });

            // Create notification database object if they are not active in conversation
            const activeRooms = io.sockets.adapter.rooms.get(conversationId);
            const receiverSocketId = onlineUsers.get(participantId);
            const isReceiverInRoom = activeRooms && receiverSocketId && activeRooms.has(receiverSocketId);

            if (!isReceiverInRoom) {
              const senderUser = await User.findById(userId).select('name');
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

      } catch (err) {
        console.error('Error handling socket send_message:', err);
        socket.emit('error_message', { message: 'Failed to send message' });
      }
    });

    // Typing start
    socket.on('typing_start', (conversationId) => {
      socket.to(conversationId).emit('typing_start', { conversationId, userId });
    });

    // Typing stop
    socket.on('typing_stop', (conversationId) => {
      socket.to(conversationId).emit('typing_stop', { conversationId, userId });
    });

    // Message read receipt
    socket.on('message_read', async (data) => {
      try {
        const { conversationId } = data;
        if (!conversationId) return;

        // Reset unread count for current user
        const conversation = await Conversation.findById(conversationId);
        if (conversation) {
          conversation.unreadCount.set(userId, 0);
          await conversation.save();
        }

        // Mark messages as read in DB
        await Message.updateMany(
          { conversation: conversationId, sender: { $ne: userId }, isRead: false },
          { $set: { isRead: true, readAt: Date.now() } }
        );

        // Emit receipt back to participants
        socket.to(conversationId).emit('message_read', { conversationId, userId });
        io.to(userId).emit('conversation_updated', {
          conversationId,
          unreadCount: 0
        });

      } catch (err) {
        console.error('Error handling socket message_read:', err);
      }
    });

    // Disconnect handler
    socket.on('disconnect', async () => {
      console.log(`Socket Disconnected: User ${userId} (${socket.id})`);
      
      // Remove from online list
      onlineUsers.delete(userId);

      // Notify contacts / active conversations that user is offline
      try {
        const userConvs = await Conversation.find({ participants: userId });
        userConvs.forEach(conv => {
          conv.participants.forEach(pId => {
            const participantId = pId.toString();
            if (participantId !== userId && onlineUsers.has(participantId)) {
              io.to(participantId).emit('user_offline', { userId });
            }
          });
        });
      } catch (err) {
        console.error('Error notifying contacts of offline status:', err);
      }
    });
  });

  // Helper to send real-time notification from Express routes
  const sendRealTimeNotification = async (targetUserId, notificationData) => {
    try {
      io.to(targetUserId.toString()).emit('new_notification', notificationData);
    } catch (err) {
      console.error('Failed to dispatch real-time socket notification:', err);
    }
  };

  return { io, sendRealTimeNotification };
};

module.exports = { initSocket, onlineUsers };
