import api from './api';

// Get all users (admin only)
export const getAllUsers = async (filters = {}) => {
  const response = await api.get('/users', { params: filters });
  return response.data;
};

// Get user by ID (admin only)
export const getUserById = async (id: number) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

// Create a new user (admin only)
export const createUser = async (userData: any) => {
  const response = await api.post('/users', userData);
  return response.data;
};

// Delete a user (admin only)
export const deleteUser = async (id: number) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

// Get dashboard statistics (admin only)
export const getDashboardStats = async () => {
  const response = await api.get('/users/dashboard-stats');
  return response.data;
};
