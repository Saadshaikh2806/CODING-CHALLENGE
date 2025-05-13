import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { FaUsers, FaStore, FaStar, FaPlus, FaUserCog, FaChartBar } from 'react-icons/fa';
import { getDashboardStats } from '../../services/user.service';
import type { DashboardStats } from '../../types';
import UsersList from './UsersList';
import StoresList from './StoresList';
import AddUser from './AddUser';
import AddStore from './AddStore';
import UpdatePassword from '../auth/UpdatePassword';
import './Admin.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <h3>Admin Dashboard</h3>
        <nav className="admin-nav">
          <Link to="/admin" className="admin-nav-link">
            <FaChartBar /> Dashboard
          </Link>
          <Link to="/admin/users" className="admin-nav-link">
            <FaUsers /> Users
          </Link>
          <Link to="/admin/stores" className="admin-nav-link">
            <FaStore /> Stores
          </Link>
          <Link to="/admin/add-user" className="admin-nav-link">
            <FaPlus /> Add User
          </Link>
          <Link to="/admin/add-store" className="admin-nav-link">
            <FaPlus /> Add Store
          </Link>
          <Link to="/admin/update-password" className="admin-nav-link">
            <FaUserCog /> Update Password
          </Link>
        </nav>
      </div>

      <div className="admin-content">
        <Routes>
          <Route path="/" element={
            <div>
              <h2>Dashboard Overview</h2>

              {loading ? (
                <div className="loading-spinner">Loading statistics...</div>
              ) : error ? (
                <div className="alert alert-danger">{error}</div>
              ) : (
                <div className="dashboard-summary">
                  <div className="dashboard-card">
                    <div className="dashboard-card-header">
                      <h3 className="dashboard-card-title">Total Users</h3>
                      <div className="dashboard-card-icon" style={{ backgroundColor: 'rgba(220, 53, 69, 0.1)', color: '#dc3545' }}>
                        <FaUsers />
                      </div>
                    </div>
                    <div className="dashboard-card-value">{stats.totalUsers}</div>
                    <div className="dashboard-card-label">Registered users in the system</div>
                  </div>

                  <div className="dashboard-card">
                    <div className="dashboard-card-header">
                      <h3 className="dashboard-card-title">Total Stores</h3>
                      <div className="dashboard-card-icon" style={{ backgroundColor: 'rgba(23, 162, 184, 0.1)', color: '#17a2b8' }}>
                        <FaStore />
                      </div>
                    </div>
                    <div className="dashboard-card-value">{stats.totalStores}</div>
                    <div className="dashboard-card-label">Stores available for rating</div>
                  </div>

                  <div className="dashboard-card">
                    <div className="dashboard-card-header">
                      <h3 className="dashboard-card-title">Total Ratings</h3>
                      <div className="dashboard-card-icon" style={{ backgroundColor: 'rgba(40, 167, 69, 0.1)', color: '#28a745' }}>
                        <FaStar />
                      </div>
                    </div>
                    <div className="dashboard-card-value">{stats.totalRatings}</div>
                    <div className="dashboard-card-label">User ratings submitted</div>
                  </div>
                </div>
              )}
            </div>
          } />
          <Route path="/users" element={<UsersList />} />
          <Route path="/stores" element={<StoresList />} />
          <Route path="/add-user" element={<AddUser />} />
          <Route path="/add-store" element={<AddStore />} />
          <Route path="/update-password" element={<UpdatePassword />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;
