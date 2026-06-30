import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    notificationsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    notificationsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setNotifications: (state, action) => {
      state.loading = false;
      state.notifications = action.payload;
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
    markReadSuccess: (state, action) => {
      const notificationId = action.payload;
      const index = state.notifications.findIndex(n => n._id === notificationId);
      if (index !== -1 && !state.notifications[index].isRead) {
        state.notifications[index].isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllReadSuccess: (state) => {
      state.notifications = state.notifications.map(n => ({ ...n, isRead: true }));
      state.unreadCount = 0;
    },
    deleteNotificationSuccess: (state, action) => {
      const notificationId = action.payload;
      const notification = state.notifications.find(n => n._id === notificationId);
      if (notification && !notification.isRead) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      state.notifications = state.notifications.filter(n => n._id !== notificationId);
    }
  }
});

export const {
  notificationsStart,
  notificationsFailure,
  setNotifications,
  addNotification,
  setUnreadCount,
  markReadSuccess,
  markAllReadSuccess,
  deleteNotificationSuccess
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
