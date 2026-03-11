import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/" data-testid="navbar-brand">
            AI Testing Demo
          </Link>
        </div>

        <div className="navbar-menu">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" data-testid="nav-dashboard">
                Dashboard
              </Link>
              <Link to="/users" data-testid="nav-users">
                Users
              </Link>
              <Link to="/forms" data-testid="nav-forms">
                Forms
              </Link>
              <Link to="/async" data-testid="nav-async">
                Async Demo
              </Link>
              <button
                onClick={handleLogout}
                className="btn-logout"
                data-testid="navbar-logout"
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" data-testid="nav-login">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
