import api from './api';

// Submit a rating
export const submitRating = async (storeId: number, value: number) => {
  const response = await api.post('/ratings', { storeId, value });
  return response.data;
};

// Get user's rating for a store
export const getUserRatingForStore = async (storeId: number) => {
  try {
    const response = await api.get(`/ratings/store/${storeId}`);
    return response.data;
  } catch (error) {
    // If rating not found, return null
    if (error.response && error.response.status === 404) {
      return null;
    }
    throw error;
  }
};

// Get all ratings (admin only)
export const getAllRatings = async () => {
  const response = await api.get('/ratings');
  return response.data;
};
