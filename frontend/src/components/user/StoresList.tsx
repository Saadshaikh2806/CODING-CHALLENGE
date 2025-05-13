import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllStores } from '../../services/store.service';
import { submitRating } from '../../services/rating.service';
import { useData } from '../../context/DataContext';
import type { Store } from '../../types';
import RatingStars from '../common/RatingStars';

const StoresList = () => {
  const { stores, refreshStores } = useData();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState<'name' | 'address'>('name');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await refreshStores();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load stores');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshStores]);

  const handleRatingChange = async (storeId: number, value: number) => {
    try {
      await submitRating(storeId, value);
      // Refresh data to get the latest updates
      await refreshStores();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit rating');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Refresh stores when search is performed
    refreshStores();
  };

  const filteredStores = stores.filter(store => {
    if (!searchTerm) return true;

    const field = store[searchField].toLowerCase();
    return field.includes(searchTerm.toLowerCase());
  });

  return (
    <div>
      <h2>Stores</h2>

      <form className="search-form" onSubmit={handleSearch}>
        <div className="form-group search-input">
          <input
            type="text"
            placeholder="Search stores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
          />
        </div>

        <div className="form-group">
          <select
            value={searchField}
            onChange={(e) => setSearchField(e.target.value as 'name' | 'address')}
            className="form-control"
          >
            <option value="name">By Name</option>
            <option value="address">By Address</option>
          </select>
        </div>

        <button type="submit" className="btn btn-primary">
          Search
        </button>
      </form>

      {loading ? (
        <p>Loading stores...</p>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : filteredStores.length === 0 ? (
        <p>No stores found</p>
      ) : (
        <div className="stores-grid">
          {filteredStores.map(store => (
            <div key={store.id} className="store-card">
              <div className="store-card-header">
                <h3 className="store-card-title">{store.name}</h3>
                <div className="store-card-rating">
                  <RatingStars initialRating={Number(store.averageRating)} />
                  <span>({store.ratingsCount})</span>
                </div>
              </div>

              <div className="store-card-address">
                {store.address}
              </div>

              <div className="store-card-footer">
                <Link to={`/user/stores/${store.id}`} className="btn btn-primary">
                  View Details
                </Link>

                <div>
                  <p>Your Rating:</p>
                  <RatingStars
                    initialRating={store.userRating || 0}
                    editable={true}
                    onRatingChange={(value) => handleRatingChange(store.id, value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StoresList;
