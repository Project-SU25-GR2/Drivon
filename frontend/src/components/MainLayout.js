import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import './MainLayout.css';

const MainLayout = ({ user, handleLogout, children }) => {
  const [isLogin, setIsLogin] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const avatarUrl = user && user.avatarUrl ? user.avatarUrl : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.fullName || 'User') + '&background=FFD700&color=222&size=64';
  
  const showAuthForm = location.pathname === '/auth';

  const handleAuthSuccess = (userData) => {
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
      if (userData.token) {
        localStorage.setItem('token', userData.token);
      }
      window.location.href = '/'; // Force reload to update user state
    }
  };

  const handleCloseModal = () => {
    navigate('/'); // Go back to previous page when closing modal
  };

  return (
    <div className="HomeLayout">
      <header>
        <div className="logo">CAR<span>RENTAL</span></div>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/contracts">Contracts</Link>
          <a href="#">Rent</a>
          <a href="#">Locations</a>
          <a href="#">Gold Rewards</a>
          <a href="#">About</a>
          <a href="#">Pages</a>
          <a href="#">Contact</a>
          {user && user.role === 'ADMIN' && <Link to="/admin">Admin</Link>}
        </nav>
        <div className="auth-payment-buttons">
          {user ? (
            <>
              <Link to="/profile" className="user-info-header">
                <img src={avatarUrl} alt="avatar" className="user-avatar-header" />
                <span className="user-name-header">{user.fullName || user.email || 'User'}</span>
              </Link>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </>
          ) : (
            <Link to="/auth" className="auth-button">
              Login/Signup
            </Link>
          )}
          <Link to="/payment" className="payment-button">
            Payment
          </Link>
        </div>
      </header>

      {showAuthForm && (
        <div className="auth-modal">
          <div className="auth-modal-content">
            <div className="auth-tabs">
              <button 
                className={`auth-tab ${isLogin ? 'active' : ''}`}
                onClick={() => setIsLogin(true)}
              >
                Login
              </button>
              <button 
                className={`auth-tab ${!isLogin ? 'active' : ''}`}
                onClick={() => setIsLogin(false)}
              >
                Signup
              </button>
            </div>
            {isLogin ? (
              <Login onLoginSuccess={handleAuthSuccess} />
            ) : (
              <Signup onSignupSuccess={handleAuthSuccess} />
            )}
            <button 
              className="close-modal"
              onClick={handleCloseModal}
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="page-content">
        {children}
      </div>
    </div>
  );
};

export default MainLayout; 