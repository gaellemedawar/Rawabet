import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SERVER_ORIGIN = API_URL.replace(/\/api\/?$/, '');

let socket = null;

export function getSocket() {
  if (socket) return socket;

  const token = localStorage.getItem('rawabet_token');
  socket = io(SERVER_ORIGIN, {
    auth: { token },
    autoConnect: false,
  });
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
