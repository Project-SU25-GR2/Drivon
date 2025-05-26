import React from 'react';
import { Link } from 'react-router-dom';

const MainLayout = ({ user, handleLogout, children }) => {
  const avatarUrl = user && user.avatarUrl ? user.avatarUrl : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.fullName || 'User') + '&background=FFD700&color=222&size=64';
  
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
            <Link to="/auth">Login/Signup</Link>
          )}
          <Link to="/payment" className="payment-button">
            Payment
          </Link>
        </div>
      </header>
      <div className="page-content">
        {children}
      </div>
    </div>
  );
};

export default MainLayout; 