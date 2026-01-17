import { io } from 'socket.io-client';

// API URL에서 /api 제거 (socket.io 접속용)
// 예: https://api.example.com/api -> https://api.example.com
const SOCKET_URL = (import.meta.env.VITE_API_URL || '').replace(/\/api$/, '');

export const socket = io(SOCKET_URL || undefined, {
  transports: ['websocket'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 3000,
  reconnectionAttempts: 5,
});

// // "undefined" means the URL will be computed from the `window.location` object
