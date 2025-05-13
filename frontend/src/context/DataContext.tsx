import React, { createContext, useContext, useEffect, useState } from 'react';
import { subscribeToEvent, unsubscribeFromEvent, initSocket } from '../services/socket.service';
import { getAllStores } from '../services/store.service';
import { getAllRatings } from '../services/rating.service';
import { useAuth } from './AuthContext';
import type { Store, Rating } from '../types';

interface DataContextType {
  stores: Store[];
  ratings: Rating[];
  refreshStores: () => Promise<void>;
  refreshRatings: () => Promise<void>;
}

const DataContext = createContext<DataContextType>({
  stores: [],
  ratings: [],
  refreshStores: async () => {},
  refreshRatings: async () => {},
});

export const useData = () => useContext(DataContext);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);

  const refreshStores = async () => {
    try {
      const data = await getAllStores();
      setStores(data);
    } catch (error) {
      console.error('Failed to fetch stores:', error);
    }
  };

  const refreshRatings = async () => {
    try {
      const data = await getAllRatings();
      setRatings(data);
    } catch (error) {
      console.error('Failed to fetch ratings:', error);
    }
  };

  useEffect(() => {
    if (user) {
      // Initial data fetch
      refreshStores();
      refreshRatings();
      
      // Connect to socket for real-time updates
      initSocket();
      
      // Subscribe to real-time events
      subscribeToEvent('store:updated', refreshStores);
      subscribeToEvent('rating:created', refreshRatings);
      subscribeToEvent('rating:updated', refreshRatings);
    }
    
    return () => {
      // Cleanup subscriptions
      unsubscribeFromEvent('store:updated');
      unsubscribeFromEvent('rating:created');
      unsubscribeFromEvent('rating:updated');
    };
  }, [user]);

  return (
    <DataContext.Provider
      value={{
        stores,
        ratings,
        refreshStores,
        refreshRatings,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}; 