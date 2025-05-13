import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Store Rating System
        </Link>
        
        <button className="navbar-toggle" onClick={toggleMenu} aria-label="Toggle menu">
          <span className="toggle-bar"></span>
          <span className="toggle-bar"></span>
          <span className="toggle-bar"></span>
        </button>
        
        <div className={`navbar-menu ${isMenuOpen ? 'is-open' : ''}`}>
          {user ? (
            <>
              <span className="navbar-user">
                Welcome, {user.name} ({user.role.replace('_', ' ')})
              </span>
              
              {user.role === 'admin' && (
                <Link to="/admin" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
                  Dashboard
                </Link>
              )}
              
              {user.role === 'user' && (
                <Link to="/user" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
                  Stores
                </Link>
              )}
              
              {user.role === 'store_owner' && (
                <Link to="/store-owner" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
                  Dashboard
                </Link>
              )}
              
              <button onClick={handleLogout} className="navbar-button">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
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
