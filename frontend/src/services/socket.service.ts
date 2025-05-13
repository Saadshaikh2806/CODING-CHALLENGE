import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

// Keep a single socket instance for the application
let socket: Socket | null = null;
// Track subscribed events to prevent duplicates
const subscribedEvents = new Set<string>();

export const initSocket = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  // Only initialize socket once if it doesn't exist and user is authenticated
  if (!socket && user.accessToken) {
    console.log('Initializing socket connection');
    
    socket = io(SOCKET_URL, {
      auth: {
        token: user.accessToken
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    
    socket.on('connect', () => {
      console.log('Socket connected with ID:', socket?.id);
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
    console.log('Disconnecting socket');
    
    // Clean up all subscribed events before disconnecting
    subscribedEvents.forEach(event => {
      socket?.off(event);
    });
    subscribedEvents.clear();
    
    socket.disconnect();
    socket = null;
  }
};

export const subscribeToEvent = (event: string, callback: Function) => {
  const socket = getSocket();
  if (socket) {
    // Prevent duplicate subscriptions to the same event
    const eventKey = `${event}:${callback.toString()}`;
    if (!subscribedEvents.has(eventKey)) {
      socket.on(event, callback as any);
      subscribedEvents.add(eventKey);
      console.log(`Subscribed to event: ${event}`);
    }
  }
};

export const unsubscribeFromEvent = (event: string, callback?: Function) => {
  if (socket) {
    if (callback) {
      const eventKey = `${event}:${callback.toString()}`;
      if (subscribedEvents.has(eventKey)) {
        socket.off(event, callback as any);
        subscribedEvents.delete(eventKey);
        console.log(`Unsubscribed from event: ${event} with specific callback`);
      }
    } else {
      // Remove all callbacks for this event
      socket.off(event);
      // Remove all subscribed events that start with this event name
      [...subscribedEvents].forEach(eventKey => {
        if (eventKey.startsWith(`${event}:`)) {
          subscribedEvents.delete(eventKey);
        }
      });
      console.log(`Unsubscribed from all callbacks for event: ${event}`);
    }
  }
}; 