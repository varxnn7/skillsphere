import { io } from 'socket.io-client';

// Determine Socket URL based on API URL context
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionDelay: 2000,
  reconnectionAttempts: 10
});

export const connectSocket = (token) => {
  if (token) {
    socket.auth = { token };
    socket.connect();
    console.log('[Socket] Initiating socket connection...');
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
    console.log('[Socket] Disconnected.');
  }
};
