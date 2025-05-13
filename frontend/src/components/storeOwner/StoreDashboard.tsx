import React, { useState, useEffect } from 'react';
import { getStoreOwnerDashboard } from '../../services/store.service';
import { subscribeToEvent, unsubscribeFromEvent } from '../../services/socket.service';
import type { StoreOwnerDashboard as StoreOwnerDashboardType } from '../../types';
import RatingStars from '../common/RatingStars';
import { FaStar, FaUser } from 'react-icons/fa';

const StoreDashboard = () => {
  const [storeData, setStoreData] = useState<StoreOwnerDashboardType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortField, setSortField] = useState<'name' | 'value' | 'createdAt'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchStoreData();
    
    // Subscribe to real-time updates
    subscribeToEvent('rating:created', fetchStoreData);
    subscribeToEvent('rating:updated', fetchStoreData);
    
    return () => {
      unsubscribeFromEvent('rating:created');
      unsubscribeFromEvent('rating:updated');
    };
  }, []);

  const fetchStoreData = async () => {
    try {
      setLoading(true);
      const data = await getStoreOwnerDashboard();
      setStoreData(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load store dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: 'name' | 'value' | 'createdAt') => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!storeData) {
    return <div className="alert alert-info">No store found. Please contact an administrator.</div>;
  }

  // Sort ratings
  const sortedRatings = [...storeData.ratings].sort((a, b) => {
    if (sortField === 'name') {
      const aName = a.user?.name || '';
      const bName = b.user?.name || '';
      return sortDirection === 'asc'
        ? aName.localeCompare(bName)
        : bName.localeCompare(aName);
    } else if (sortField === 'value') {
      return sortDirection === 'asc'
        ? a.value - b.value
        : b.value - a.value;
    } else {
      const aDate = new Date(a.createdAt || '').getTime();
      const bDate = new Date(b.createdAt || '').getTime();
      return sortDirection === 'asc'
        ? aDate - bDate
        : bDate - aDate;
    }
  });

  return (
    <div>
      <h2>Store Dashboard</h2>

      <div className="store-info-card">
        <div className="store-info-header">
          <h3 className="store-info-title">{storeData.name}</h3>
          <RatingStars initialRating={Number(storeData.averageRating)} />
        </div>
        <div className="store-info-details">
          <p>{storeData.address}</p>
          <p>Email: {storeData.email}</p>
        </div>
      </div>

      <div className="store-summary">
        <div className="summary-card">
          <div className="summary-title">Average Rating</div>
          <div className="summary-value">
            {storeData.averageRating} <FaStar className="text-yellow-500" />
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-title">Total Ratings</div>
          <div className="summary-value">
            {storeData.ratingsCount}
          </div>
        </div>
      </div>

      <h3>Customer Ratings</h3>

      {storeData.ratings.length === 0 ? (
        <p>No ratings yet</p>
      ) : (
        <div className="table-responsive">
          <table className="ratings-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('name')}>
                  Customer {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('value')}>
                  Rating {sortField === 'value' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('createdAt')}>
                  Date {sortField === 'createdAt' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedRatings.map(rating => (
                <tr key={rating.id}>
                  <td>
                    <div className="flex items-center">
                      <FaUser className="mr-2" />
                      {rating.user?.name}
                    </div>
                  </td>
                  <td>
                    <RatingStars initialRating={rating.value} />
                  </td>
                  <td>
                    {rating.createdAt
                      ? new Date(rating.createdAt).toLocaleDateString()
                      : 'N/A'
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StoreDashboard;
