import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { FaStore, FaUser } from 'react-icons/fa';
import StoresList from './StoresList';
import StoreDetails from './StoreDetails';
import UpdatePassword from '../auth/UpdatePassword';
import './User.css';

const UserDashboard = () => {
  return (
    <div className="user-dashboard">
      <div className="user-sidebar">
        <h3>User Dashboard</h3>
        <nav className="user-nav">
          <Link to="/user" className="user-nav-link">
            <FaStore /> Stores
          </Link>
          <Link to="/user/update-password" className="user-nav-link">
            <FaUser /> Update Password
          </Link>
        </nav>
      </div>
      
      <div className="user-content">
        <Routes>
          <Route path="/" element={<StoresList />} />
          <Route path="/stores/:id" element={<StoreDetails />} />
          <Route path="/update-password" element={<UpdatePassword />} />
        </Routes>
      </div>
    </div>
  );
};

export default UserDashboard;
