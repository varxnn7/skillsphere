import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { socket } from '../socket';
import {
  addMessage,
  setTypingStatus,
  updateConversationLastMessage,
  clearChatState
} from '../store/messagesSlice';

const useChat = (activeConversationId) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Send Message
  const sendMessage = useCallback((content, type = 'text', fileUrl = '', fileName = '', fileSize = 0) => {
    if (!socket.connected || !activeConversationId) return;
    
    socket.emit('send_message', {
      conversationId: activeConversationId,
      content,
      type,
      fileUrl,
      fileName,
      fileSize
    });
  }, [activeConversationId]);

  // Typing Start
  const sendTypingStart = useCallback(() => {
    if (!socket.connected || !activeConversationId) return;
    socket.emit('typing_start', activeConversationId);
  }, [activeConversationId]);

  // Typing Stop
  const sendTypingStop = useCallback(() => {
    if (!socket.connected || !activeConversationId) return;
    socket.emit('typing_stop', activeConversationId);
  }, [activeConversationId]);

  // Mark Read
  const markRead = useCallback(() => {
    if (!socket.connected || !activeConversationId) return;
    socket.emit('message_read', { conversationId: activeConversationId });
  }, [activeConversationId]);

  // Set up listeners for the active conversation
  useEffect(() => {
    if (!activeConversationId) return;

    // Join room
    socket.emit('join_conversation', activeConversationId);

    // Automatically mark existing messages as read
    markRead();

    // Listen for new messages
    socket.on('new_message', (message) => {
      if (message.conversation === activeConversationId) {
        dispatch(addMessage(message));
        // Reset unread count for current user
        markRead();
      }
    });

    // Listen for conversation updates (updates unread count, etc.)
    socket.on('conversation_updated', (data) => {
      dispatch(updateConversationLastMessage(data));
    });

    // Listen for typing events
    socket.on('typing_start', ({ conversationId, userId: typingUserId }) => {
      if (conversationId === activeConversationId && typingUserId !== user.id) {
        dispatch(setTypingStatus({ conversationId, userId: typingUserId, isTyping: true }));
      }
    });

    socket.on('typing_stop', ({ conversationId, userId: typingUserId }) => {
      if (conversationId === activeConversationId && typingUserId !== user.id) {
        dispatch(setTypingStatus({ conversationId, userId: typingUserId, isTyping: false }));
      }
    });

    // Listen for read receipts
    socket.on('message_read', ({ conversationId }) => {
      if (conversationId === activeConversationId) {
        // Redraw or local state update can be handled by reloading messages or manually mapping
      }
    });

    return () => {
      socket.off('new_message');
      socket.off('conversation_updated');
      socket.off('typing_start');
      socket.off('typing_stop');
      socket.off('message_read');
      dispatch(clearChatState());
    };
  }, [activeConversationId, user.id, dispatch, markRead]);

  return {
    sendMessage,
    sendTypingStart,
    sendTypingStop,
    markRead
  };
};

export default useChat;
