import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, loading } = useContext(AuthContext);

  // Show loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  // If user is not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // If user role is not allowed, redirect based on role
  if (!allowedRoles.includes(user.role)) {
    if (user.role === 'admin') {
      return <Navigate to="/admin" />;
    } else if (user.role === 'store_owner') {
      return <Navigate to="/store-owner" />;
    } else {
      return <Navigate to="/user" />;
    }
  }

  // If user is logged in and has allowed role, render children
  return <>{children}</>;
};

export default ProtectedRoute;
