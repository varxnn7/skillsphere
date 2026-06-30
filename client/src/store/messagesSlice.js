import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  conversations: [],
  messages: [],
  typingUsers: {}, // conversationId -> [userIds]
  onlineUsers: [], // Array of online userIds
  loading: false,
  error: null
};

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    messagesStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    messagesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setConversations: (state, action) => {
      state.loading = false;
      state.conversations = action.payload;
    },
    updateConversationLastMessage: (state, action) => {
      const { conversationId, lastMessage, unreadCount } = action.payload;
      const index = state.conversations.findIndex(c => c._id === conversationId);
      if (index !== -1) {
        state.conversations[index].lastMessage = lastMessage;
        state.conversations[index].lastMessageAt = lastMessage.createdAt;
        if (unreadCount !== undefined) {
          state.conversations[index].unreadCountCurrent = unreadCount;
        }
        // Re-sort conversations by lastMessageAt descending
        state.conversations.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
      }
    },
    setMessages: (state, action) => {
      state.loading = false;
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setTypingStatus: (state, action) => {
      const { conversationId, userId, isTyping } = action.payload;
      const current = state.typingUsers[conversationId] || [];
      let updated;
      
      if (isTyping) {
        if (!current.includes(userId)) {
          updated = [...current, userId];
        } else {
          updated = current;
        }
      } else {
        updated = current.filter(id => id !== userId);
      }

      state.typingUsers = {
        ...state.typingUsers,
        [conversationId]: updated
      };
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    userOnline: (state, action) => {
      const userId = action.payload;
      if (!state.onlineUsers.includes(userId)) {
        state.onlineUsers.push(userId);
      }
    },
    userOffline: (state, action) => {
      const userId = action.payload;
      state.onlineUsers = state.onlineUsers.filter(id => id !== userId);
    },
    clearChatState: (state) => {
      state.messages = [];
      state.loading = false;
      state.error = null;
    }
  }
});

export const {
  messagesStart,
  messagesFailure,
  setConversations,
  updateConversationLastMessage,
  setMessages,
  addMessage,
  setTypingStatus,
  setOnlineUsers,
  userOnline,
  userOffline,
  clearChatState
} = messagesSlice.actions;

export default messagesSlice.reducer;
