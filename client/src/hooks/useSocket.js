import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { socket, connectSocket, disconnectSocket } from '../socket';
import { setOnlineUsers, userOnline, userOffline } from '../store/messagesSlice';
import { addNotification } from '../store/notificationsSlice';

const useSocket = () => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token && user) {
      connectSocket(token);

      // Listen for online users list from server
      socket.on('online_users_list', (users) => {
        dispatch(setOnlineUsers(users));
      });

      // Listen for single contact coming online
      socket.on('user_online', ({ userId }) => {
        dispatch(userOnline(userId));
      });

      // Listen for single contact going offline
      socket.on('user_offline', ({ userId }) => {
        dispatch(userOffline(userId));
      });

      // Global real-time notifications listener
      socket.on('new_notification', (notification) => {
        dispatch(addNotification(notification));
      });

      // Handle socket error events
      socket.on('error_message', (data) => {
        console.error('[Socket Error]', data.message);
      });
    }

    return () => {
      // Cleanup listeners
      socket.off('online_users_list');
      socket.off('user_online');
      socket.off('user_offline');
      socket.off('new_notification');
      socket.off('error_message');
      
      if (!token) {
        disconnectSocket();
      }
    };
  }, [token, user, dispatch]);

  return socket;
};

export default useSocket;
