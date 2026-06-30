const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Create or get existing conversation between 2 users
// @route   POST /api/conversations
// @access  Private
exports.createConversation = async (req, res, next) => {
  try {
    const { recipientId, gigId } = req.body;

    if (!recipientId) {
      return res.status(400).json({ success: false, message: 'Recipient ID is required' });
    }

    if (recipientId === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot start a conversation with yourself' });
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ success: false, message: 'Recipient not found' });
    }

    // Look for existing conversation between these two participants
    let query = {
      participants: { $all: [req.user.id, recipientId], $size: 2 }
    };

    // If gigId is provided, look for one that links to that gig context
    if (gigId) {
      query.gig = gigId;
    }

    let conversation = await Conversation.findOne(query)
      .populate('participants', 'name email avatar role')
      .populate('lastMessage')
      .populate('gig', 'title budgetType budgetMin budgetMax');

    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        participants: [req.user.id, recipientId],
        unreadCount: {
          [req.user.id]: 0,
          [recipientId]: 0
        }
      });

      if (gigId) {
        conversation.gig = gigId;
      }

      await conversation.save();
      await conversation.populate('participants', 'name email avatar role');
    }

    res.status(200).json({ success: true, conversation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all conversations for logged in user
// @route   GET /api/conversations
// @access  Private
exports.getConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const conversations = await Conversation.find({ participants: userId })
      .populate('participants', 'name email avatar role')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'name avatar' }
      })
      .populate('gig', 'title status')
      .sort({ lastMessageAt: -1 });

    // Format list to map unread count for current user
    const formattedConversations = conversations.map(conv => {
      const convObj = conv.toObject();
      convObj.unreadCountCurrent = conv.unreadCount.get(userId) || 0;
      return convObj;
    });

    res.status(200).json({ success: true, conversations: formattedConversations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single conversation with last 50 messages
// @route   GET /api/conversations/:id
// @access  Private
exports.getConversationById = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      participants: req.user.id
    })
      .populate('participants', 'name email avatar role')
      .populate('gig', 'title budgetType budgetMin budgetMax status');

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found or access denied' });
    }

    // Fetch last 50 messages
    const messages = await Message.find({ conversation: conversation._id })
      .populate('sender', 'name email avatar role')
      .sort({ createdAt: -1 })
      .limit(50);

    // Reverse to show chronologically
    messages.reverse();

    res.status(200).json({
      success: true,
      conversation: {
        ...conversation.toObject(),
        unreadCountCurrent: conversation.unreadCount.get(req.user.id) || 0
      },
      messages
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get messages for a conversation with pagination
// @route   GET /api/conversations/:id/messages
// @access  Private
exports.getConversationMessages = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const conversation = await Conversation.findOne({
      _id: req.params.id,
      participants: req.user.id
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found or access denied' });
    }

    const messages = await Message.find({ conversation: conversation._id })
      .populate('sender', 'name email avatar role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    messages.reverse();

    res.status(200).json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark all messages in a conversation as read
// @route   PUT /api/conversations/:id/read
// @access  Private
exports.markConversationRead = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      participants: req.user.id
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found or access denied' });
    }

    // Reset unread count for current user
    conversation.unreadCount.set(req.user.id, 0);
    await conversation.save();

    // Update unread messages
    await Message.updateMany(
      { conversation: conversation._id, sender: { $ne: req.user.id }, isRead: false },
      { $set: { isRead: true, readAt: Date.now() } }
    );

    res.status(200).json({ success: true, message: 'Conversation marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
