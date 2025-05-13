import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import AdminDashboard from './components/admin/AdminDashboard';
import UserDashboard from './components/user/UserDashboard';
import StoreOwnerDashboard from './components/storeOwner/StoreOwnerDashboard';
import Navbar from './components/common/Navbar';
import LinkedInCredit from './components/common/LinkedInCredit';
import ProtectedRoute from './components/common/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <DataProvider>
          <div className="app">
            <Navbar />
            <div className="container">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Admin Routes */}
                <Route 
                  path="/admin/*" 
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Normal User Routes */}
                <Route 
                  path="/user/*" 
                  element={
                    <ProtectedRoute allowedRoles={['user']}>
                      <UserDashboard />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Store Owner Routes */}
                <Route 
                  path="/store-owner/*" 
                  element={
                    <ProtectedRoute allowedRoles={['store_owner']}>
                      <StoreOwnerDashboard />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Redirect to login by default */}
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="*" element={<Navigate to="/login" />} />
              </Routes>
            </div>
            <LinkedInCredit />
          </div>
        </DataProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
