import { io } from 'socket.io-client';
import { useAuthStorage } from 'store/authStore';

export const socket = io({
  transports: ['websocket'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 3000,
  reconnectionAttempts: 5,
  autoConnect: false,
  auth: (cb) => {
    const { access_token } = useAuthStorage.getState();
    cb({ token: access_token });
  },
});

// // "undefined" means the URL will be computed from the `window.location` object
