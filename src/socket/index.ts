import { io, Socket } from 'socket.io-client';
import { useAuthStorage } from 'store/authStore';

let socketInstance: Socket | null = null;

/**
 * Lazily create (and cache) the singleton socket instance.
 * The instance is created with autoConnect disabled so it only
 * connects when explicitly requested.
 */
export const getSocket = (): Socket => {
  if (socketInstance) return socketInstance;

  socketInstance = io({
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

  return socketInstance;
};

export const socket = getSocket();
