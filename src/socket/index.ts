import { io } from 'socket.io-client';

export const socket = io(
  import.meta.env.VITE_API_URL || 'http://15.164.167.42',
  {
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 3000,
    reconnectionAttempts: 5,
  }
);

// // "undefined" means the URL will be computed from the `window.location` object
