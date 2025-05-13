import React, { useState, useEffect } from 'react';
import { getAllStores, deleteStore } from '../../services/store.service';
import type { Store } from '../../types';
import RatingStars from '../common/RatingStars';
import { FaSort, FaSortUp, FaSortDown, FaStore, FaEnvelope, FaMapMarkerAlt, FaTrash } from 'react-icons/fa';

const StoresList = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [filters, setFilters] = useState({
    name: '',
    address: ''
  });
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const data = await getAllStores(filters);
      setStores(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load stores');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStores();
  };

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDeleteClick = (storeId: number) => {
    setConfirmDelete(storeId);
  };

  const handleConfirmDelete = async () => {
    if (confirmDelete) {
      try {
        await deleteStore(confirmDelete);
        // Refresh store list after deletion
        fetchStores();
        setConfirmDelete(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete store');
      }
    }
  };

  const sortedStores = [...stores].sort((a, b) => {
    let aValue: any = a[sortField as keyof Store];
    let bValue: any = b[sortField as keyof Store];

    // Handle special case for averageRating
    if (sortField === 'averageRating') {
      aValue = Number(aValue);
      bValue = Number(bValue);
    }

    // Handle undefined values
    if (aValue === undefined) aValue = '';
    if (bValue === undefined) bValue = '';

    // Compare values
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const getSortIcon = (field: string) => {
    if (field !== sortField) return <FaSort className="sort-indicator" />;
    return sortDirection === 'asc' ? <FaSortUp className="sort-indicator" /> : <FaSortDown className="sort-indicator" />;
  };

  return (
    <div className="stores-list-container">
      <h2>Stores List</h2>

      <div className="card">
        <form className="filter-form" onSubmit={handleFilterSubmit}>
          <div className="filter-group">
            <label htmlFor="name">
              <FaStore /> Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={filters.name}
              onChange={handleFilterChange}
              className="form-control"
              placeholder="Search by name..."
            />
          </div>

          <div className="filter-group">
            <label htmlFor="address">
              <FaMapMarkerAlt /> Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={filters.address}
              onChange={handleFilterChange}
              className="form-control"
              placeholder="Search by address..."
            />
          </div>

          <div className="filter-actions">
            <button type="submit" className="btn btn-primary">
              Filter
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading stores...</div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th onClick={() => handleSort('name')}>
                  Name {getSortIcon('name')}
                </th>
                <th onClick={() => handleSort('email')}>
                  Email {getSortIcon('email')}
                </th>
                <th onClick={() => handleSort('address')}>
                  Address {getSortIcon('address')}
                </th>
                <th>Owner</th>
                <th onClick={() => handleSort('averageRating')}>
                  Rating {getSortIcon('averageRating')}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedStores.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center">No stores found</td>
                </tr>
              ) : (
                sortedStores.map(store => (
                  <tr key={store.id}>
                    <td><strong>{store.name}</strong></td>
                    <td>
                      <span className="email">
                        <FaEnvelope className="icon-small" /> {store.email}
                      </span>
                    </td>
                    <td>
                      <span className="address">
                        <FaMapMarkerAlt className="icon-small" /> {store.address}
                      </span>
                    </td>
                    <td>
                      {store.owner ? (
                        <span className="owner-name">{store.owner.name}</span>
                      ) : (
                        <span className="no-owner">No owner assigned</span>
                      )}
                    </td>
                    <td>
                      <div className="rating-display">
                        <RatingStars initialRating={Number(store.averageRating)} />
                        <span className="ratings-count">({store.ratingsCount} ratings)</span>
                      </div>
                    </td>
                    <td>
                      <button 
                        className="btn-icon delete-btn" 
                        onClick={() => handleDeleteClick(store.id)}
                        title="Delete Store"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmDelete && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this store? This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleConfirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoresList;
