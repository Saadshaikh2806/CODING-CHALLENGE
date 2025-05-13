import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

let socket: any = null;

export const initSocket = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!socket && user.accessToken) {
    socket = io(SOCKET_URL, {
      auth: {
        token: user.accessToken
      }
    });
    
    socket.on('connect', () => {
      console.log('Socket connected');
    });
    
    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
    
    socket.on('error', (error: any) => {
      console.error('Socket error:', error);
    });
  }
  
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const subscribeToEvent = (event: string, callback: Function) => {
  const socket = getSocket();
  if (socket) {
    socket.on(event, callback);
  }
};

export const unsubscribeFromEvent = (event: string, callback?: Function) => {
  if (socket) {
    if (callback) {
      socket.off(event, callback);
    } else {
      socket.off(event);
    }
  }
}; 