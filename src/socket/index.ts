import { io } from 'socket.io-client';

export const socket = io({
  transports: ['websocket'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 3000,
  reconnectionAttempts: 5,
});

// // "undefined" means the URL will be computed from the `window.location` object
