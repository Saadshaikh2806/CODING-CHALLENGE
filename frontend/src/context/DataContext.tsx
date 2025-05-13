import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { subscribeToEvent, unsubscribeFromEvent, initSocket } from '../services/socket.service';
import { getAllStores } from '../services/store.service';
import { getAllRatings } from '../services/rating.service';
import { useAuth } from './AuthContext';
import type { Store, Rating } from '../types';

// Debounce function to prevent rapid successive calls
const debounce = (func: Function, wait: number) => {
  let timeout: ReturnType<typeof setTimeout>;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

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
  const [lastRefreshTime, setLastRefreshTime] = useState(0);

  const refreshStores = useCallback(async () => {
    try {
      // Throttle refreshes to prevent excessive API calls
      const now = Date.now();
      if (now - lastRefreshTime < 2000) {
        return;
      }
      
      const data = await getAllStores();
      setStores(data);
      setLastRefreshTime(now);
    } catch (error) {
      console.error('Failed to fetch stores:', error);
    }
  }, [lastRefreshTime]);

  const refreshRatings = useCallback(async () => {
    try {
      const data = await getAllRatings();
      setRatings(data);
    } catch (error) {
      console.error('Failed to fetch ratings:', error);
    }
  }, []);

  // Create debounced versions of the refresh functions
  const debouncedRefreshStores = useCallback(
    debounce(refreshStores, 500),
    [refreshStores]
  );

  const debouncedRefreshRatings = useCallback(
    debounce(refreshRatings, 500),
    [refreshRatings]
  );

  useEffect(() => {
    if (user) {
      // Initial data fetch
      refreshStores();
      refreshRatings();
      
      // Connect to socket for real-time updates
      initSocket();
      
      // Subscribe to real-time events with debounced handlers
      subscribeToEvent('store:updated', debouncedRefreshStores);
      subscribeToEvent('rating:created', debouncedRefreshRatings);
      subscribeToEvent('rating:updated', debouncedRefreshRatings);
    }
    
    return () => {
      // Cleanup subscriptions
      unsubscribeFromEvent('store:updated');
      unsubscribeFromEvent('rating:created');
      unsubscribeFromEvent('rating:updated');
    };
  }, [user, debouncedRefreshStores, debouncedRefreshRatings, refreshStores, refreshRatings]);

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