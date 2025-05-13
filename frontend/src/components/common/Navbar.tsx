import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Store Rating System
        </Link>
        
        <div className="navbar-menu">
          {user ? (
            <>
              <span className="navbar-user">
                Welcome, {user.name} ({user.role.replace('_', ' ')})
              </span>
              
              {user.role === 'admin' && (
                <Link to="/admin" className="navbar-link">
                  Dashboard
                </Link>
              )}
              
              {user.role === 'user' && (
                <Link to="/user" className="navbar-link">
                  Stores
                </Link>
              )}
              
              {user.role === 'store_owner' && (
                <Link to="/store-owner" className="navbar-link">
                  Dashboard
                </Link>
              )}
              
              <button onClick={handleLogout} className="navbar-button">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link">
                Login
              </Link>
              <Link to="/register" className="navbar-link">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
