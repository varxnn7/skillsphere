import { io } from 'socket.io-client';

// Socket URL from env — falls back to localhost for development
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  transports: ['websocket', 'polling']
});

export const connectSocket = (token) => {
  if (token) {
    socket.auth = { token };
    if (!socket.connected) {
      socket.connect();
    }
    console.log('[Socket] Initiating socket connection...');
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
    console.log('[Socket] Disconnected.');
  }
};
