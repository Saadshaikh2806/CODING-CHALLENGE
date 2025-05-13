import api from './api';

// Get all stores
export const getAllStores = async (filters = {}) => {
  const response = await api.get('/stores', { params: filters });
  return response.data;
};

// Get store by ID
export const getStoreById = async (id: number) => {
  const response = await api.get(`/stores/${id}`);
  return response.data;
};

// Create a new store (admin only)
export const createStore = async (storeData: any) => {
  const response = await api.post('/stores', storeData);
  return response.data;
};

// Delete a store (admin only)
export const deleteStore = async (id: number) => {
  const response = await api.delete(`/stores/${id}`);
  return response.data;
};

// Get store owner dashboard data
export const getStoreOwnerDashboard = async () => {
  const response = await api.get('/stores/owner/dashboard');
  return response.data;
};
