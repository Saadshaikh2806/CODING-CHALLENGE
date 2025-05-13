import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { FaStore, FaUser } from 'react-icons/fa';
import StoreDashboard from './StoreDashboard';
import UpdatePassword from '../auth/UpdatePassword';
import './StoreOwner.css';

const StoreOwnerDashboard = () => {
  return (
    <div className="store-owner-dashboard">
      <div className="store-owner-sidebar">
        <h3>Store Owner Dashboard</h3>
        <nav className="store-owner-nav">
          <Link to="/store-owner" className="store-owner-nav-link">
            <FaStore /> Dashboard
          </Link>
          <Link to="/store-owner/update-password" className="store-owner-nav-link">
            <FaUser /> Update Password
          </Link>
        </nav>
      </div>
      
      <div className="store-owner-content">
        <Routes>
          <Route path="/" element={<StoreDashboard />} />
          <Route path="/update-password" element={<UpdatePassword />} />
        </Routes>
      </div>
    </div>
  );
};

export default StoreOwnerDashboard;
