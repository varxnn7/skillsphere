import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import api from '../utils/api';
import {
  notificationsStart,
  notificationsFailure,
  setNotifications,
  setUnreadCount,
  markReadSuccess,
  markAllReadSuccess,
  deleteNotificationSuccess
} from '../store/notificationsSlice';

const useNotifications = () => {
  const dispatch = useDispatch();

  // Fetch notifications
  const fetchNotifications = useCallback(async (page = 1, limit = 20) => {
    dispatch(notificationsStart());
    try {
      const response = await api.get(`/notifications?page=${page}&limit=${limit}`);
      if (response.data.success) {
        dispatch(setNotifications(response.data.notifications));
      }
    } catch (err) {
      dispatch(notificationsFailure(err.response?.data?.message || 'Failed to fetch notifications'));
    }
  }, [dispatch]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      if (response.data.success) {
        dispatch(setUnreadCount(response.data.count));
      }
    } catch (err) {
      console.error('Failed to fetch unread notification count:', err);
    }
  }, [dispatch]);

  // Mark single as read
  const markAsRead = useCallback(async (id) => {
    try {
      const response = await api.put(`/notifications/${id}/read`);
      if (response.data.success) {
        dispatch(markReadSuccess(id));
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, [dispatch]);

  // Mark all as read
  const markAllRead = useCallback(async () => {
    try {
      const response = await api.put('/notifications/read-all');
      if (response.data.success) {
        dispatch(markAllReadSuccess());
      }
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  }, [dispatch]);

  // Delete notification
  const deleteNotification = useCallback(async (id) => {
    try {
      const response = await api.delete(`/notifications/${id}`);
      if (response.data.success) {
        dispatch(deleteNotificationSuccess(id));
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  }, [dispatch]);

  return {
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllRead,
    deleteNotification
  };
};

export default useNotifications;
