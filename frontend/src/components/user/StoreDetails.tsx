import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getStoreById } from '../../services/store.service';
import { submitRating } from '../../services/rating.service';
import { useData } from '../../context/DataContext';
import { subscribeToEvent, unsubscribeFromEvent } from '../../services/socket.service';
import type { Store, Rating } from '../../types';
import RatingStars from '../common/RatingStars';

const StoreDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [store, setStore] = useState<Store & { ratings?: Rating[] }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRating, setUserRating] = useState(0);
  const { refreshStores } = useData();

  const fetchStore = async (storeId: number) => {
    try {
      setLoading(true);
      const data = await getStoreById(storeId);
      setStore(data);
      setUserRating(data.userRating || 0);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load store details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchStore(parseInt(id));
      
      // Subscribe to real-time updates for this specific store
      const storeUpdateHandler = () => {
        if (id) fetchStore(parseInt(id));
      };
      
      subscribeToEvent(`store:${id}:updated`, storeUpdateHandler);
      subscribeToEvent(`rating:store:${id}:updated`, storeUpdateHandler);
      
      return () => {
        unsubscribeFromEvent(`store:${id}:updated`);
        unsubscribeFromEvent(`rating:store:${id}:updated`);
      };
    }
  }, [id]);

  const handleRatingChange = async (value: number) => {
    if (!id) return;

    try {
      await submitRating(parseInt(id), value);
      setUserRating(value);

      // Refresh store data to get updated ratings
      fetchStore(parseInt(id));
      
      // Also refresh the stores list in the background
      refreshStores();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit rating');
    }
  };

  if (loading) {
    return <p>Loading store details...</p>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!store) {
    return <div className="alert alert-info">Store not found</div>;
  }

  return (
    <div className="store-details">
      <div className="store-header">
        <div className="store-info">
          <h2>{store.name}</h2>
          <p>{store.address}</p>
          <p>Email: {store.email}</p>
          <div className="flex items-center mt-4">
            <span>Overall Rating: </span>
            <RatingStars initialRating={Number(store.averageRating)} />
            <span className="ml-2">({store.ratingsCount} ratings)</span>
          </div>
        </div>

        <Link to="/user" className="btn btn-primary">
          Back to Stores
        </Link>
      </div>

      <div className="store-rating-section">
        <h3>Your Rating</h3>
        <div className="store-rating-form">
          <RatingStars
            initialRating={userRating}
            editable={true}
            onRatingChange={handleRatingChange}
          />
          <p>
            {userRating > 0
              ? 'Click on the stars to change your rating'
              : 'Click on the stars to rate this store'}
          </p>
        </div>
      </div>

      {store.ratings && store.ratings.length > 0 && (
        <div className="store-ratings-list card">
          <h3>All Ratings</h3>
          {store.ratings.map(rating => (
            <div key={rating.id} className="rating-item">
              <div>
                <strong>{rating.user?.name}</strong>
              </div>
              <RatingStars initialRating={rating.value} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StoreDetails;
