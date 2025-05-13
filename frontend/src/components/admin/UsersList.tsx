import React, { useState, useEffect } from 'react';
import { getAllUsers, deleteUser } from '../../services/user.service';
import type { User } from '../../types';
import RatingStars from '../common/RatingStars';
import { FaSort, FaSortUp, FaSortDown, FaUser, FaEnvelope, FaMapMarkerAlt, FaTrash } from 'react-icons/fa';

const UsersList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    address: '',
    role: ''
  });
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers(filters);
      setUsers(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDeleteClick = (userId: number) => {
    setConfirmDelete(userId);
  };

  const handleConfirmDelete = async () => {
    if (confirmDelete) {
      try {
        await deleteUser(confirmDelete);
        // Refresh user list after deletion
        fetchUsers();
        setConfirmDelete(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    let aValue: any = a[sortField as keyof User];
    let bValue: any = b[sortField as keyof User];

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
    <div className="users-list-container">
      <h2>Users List</h2>

      <div className="card">
        <form className="filter-form" onSubmit={handleFilterSubmit}>
          <div className="filter-group">
            <label htmlFor="name">
              <FaUser /> Name
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
            <label htmlFor="email">
              <FaEnvelope /> Email
            </label>
            <input
              type="text"
              id="email"
              name="email"
              value={filters.email}
              onChange={handleFilterChange}
              className="form-control"
              placeholder="Search by email..."
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

          <div className="filter-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              name="role"
              value={filters.role}
              onChange={handleFilterChange}
              className="form-control"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
              <option value="store_owner">Store Owner</option>
            </select>
          </div>

          <div className="filter-actions">
            <button type="submit" className="btn btn-primary">
              Filter
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading users...</div>
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
                <th onClick={() => handleSort('role')}>
                  Role {getSortIcon('role')}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center">No users found</td>
                </tr>
              ) : (
                sortedUsers.map(user => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.address}</td>
                    <td>
                      <span className={`badge badge-${user.role}`}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      {user.role !== 'admin' && (
                        <button 
                          className="btn-icon delete-btn" 
                          onClick={() => handleDeleteClick(user.id)}
                          title="Delete User"
                        >
                          <FaTrash />
                        </button>
                      )}
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
            <h3>Confirm User Deletion</h3>
            <p>Are you sure you want to delete this user? This action cannot be undone.</p>
            {users.find(u => u.id === confirmDelete)?.role === 'store_owner' && (
              <p className="warning-text">
                <strong>Warning:</strong> This user is a Store Owner. Deleting this user will also delete their store and all its ratings.
              </p>
            )}
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

export default UsersList;
