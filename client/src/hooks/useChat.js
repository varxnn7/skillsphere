import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { socket } from '../socket';
import api from '../utils/api';
import {
  addMessage,
  setTypingStatus,
  updateConversationLastMessage,
  clearChatState
} from '../store/messagesSlice';

const useChat = (activeConversationId) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Send Message (Dual support: Socket + HTTP fallback)
  const sendMessage = useCallback(async (content, type = 'text', fileUrl = '', fileName = '', fileSize = 0) => {
    if (!activeConversationId || (!content && !fileUrl)) return;

    // 1. If socket is connected, send via Socket.IO
    if (socket && socket.connected) {
      socket.emit('send_message', {
        conversationId: activeConversationId,
        content,
        type,
        fileUrl,
        fileName,
        fileSize
      });
      return;
    }

    // 2. Otherwise send via HTTP API fallback
    try {
      const response = await api.post('/messages', {
        conversationId: activeConversationId,
        content,
        type,
        fileUrl,
        fileName,
        fileSize
      });

      if (response.data && response.data.success && response.data.message) {
        const msg = response.data.message;
        dispatch(addMessage(msg));
        dispatch(updateConversationLastMessage({
          conversationId: activeConversationId,
          lastMessage: msg
        }));
      }
    } catch (err) {
      console.error('Failed to send message via HTTP API:', err);
    }
  }, [activeConversationId, dispatch]);

  // Typing Start
  const sendTypingStart = useCallback(() => {
    if (!socket || !socket.connected || !activeConversationId) return;
    socket.emit('typing_start', activeConversationId);
  }, [activeConversationId]);

  // Typing Stop
  const sendTypingStop = useCallback(() => {
    if (!socket || !socket.connected || !activeConversationId) return;
    socket.emit('typing_stop', activeConversationId);
  }, [activeConversationId]);

  // Mark Read
  const markRead = useCallback(async () => {
    if (!activeConversationId) return;
    if (socket && socket.connected) {
      socket.emit('message_read', { conversationId: activeConversationId });
    } else {
      try {
        await api.put(`/conversations/${activeConversationId}/read`);
      } catch (err) {
        // silent catch
      }
    }
  }, [activeConversationId]);

  // Set up listeners for the active conversation
  useEffect(() => {
    if (!activeConversationId) return;

    const joinAndSync = () => {
      if (socket && socket.connected) {
        socket.emit('join_conversation', activeConversationId);
      }
      markRead();
    };

    joinAndSync();

    const handleConnect = () => {
      joinAndSync();
    };

    socket.on('connect', handleConnect);

    // Listen for new messages
    const handleNewMessage = (message) => {
      const messageConvId = message.conversation?._id || message.conversation;
      if (messageConvId === activeConversationId) {
        dispatch(addMessage(message));
        // Reset unread count for current user
        markRead();
      }
    };

    socket.on('new_message', handleNewMessage);

    // Listen for conversation updates (updates unread count, etc.)
    const handleConvUpdated = (data) => {
      dispatch(updateConversationLastMessage(data));
    };

    socket.on('conversation_updated', handleConvUpdated);

    // Listen for typing events
    const handleTypingStart = ({ conversationId, userId: typingUserId }) => {
      if (conversationId === activeConversationId && typingUserId !== user?.id && typingUserId !== user?._id) {
        dispatch(setTypingStatus({ conversationId, userId: typingUserId, isTyping: true }));
      }
    };

    const handleTypingStop = ({ conversationId, userId: typingUserId }) => {
      if (conversationId === activeConversationId && typingUserId !== user?.id && typingUserId !== user?._id) {
        dispatch(setTypingStatus({ conversationId, userId: typingUserId, isTyping: false }));
      }
    };

    socket.on('typing_start', handleTypingStart);
    socket.on('typing_stop', handleTypingStop);

    // Listen for read receipts
    const handleMessageRead = ({ conversationId }) => {
      if (conversationId === activeConversationId) {
        // Handled via conversation updates
      }
    };

    socket.on('message_read', handleMessageRead);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('new_message', handleNewMessage);
      socket.off('conversation_updated', handleConvUpdated);
      socket.off('typing_start', handleTypingStart);
      socket.off('typing_stop', handleTypingStop);
      socket.off('message_read', handleMessageRead);
      dispatch(clearChatState());
    };
  }, [activeConversationId, user, dispatch, markRead]);

  return {
    sendMessage,
    sendTypingStart,
    sendTypingStop,
    markRead
  };
};

export default useChat;
