import React from 'react';
import { Link } from 'react-router-dom';
import './404.css';

const CarRental404 = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="error-code">
          <span className="error-number">4</span>
          <span className="error-zero">0</span>
          <span className="error-number">4</span>
        </div>
        
        <h1 className="error-title">Page Not Found</h1>
        
        <p className="error-description">
          Oops! The page you're looking for doesn't exist. 
          It might have been moved, deleted, or you entered the wrong URL.
        </p>
        
        <div className="error-actions">
          <Link to="/" className="back-home-btn">
            <i className="bi bi-house-door"></i>
            Back to Home
          </Link>
          
          <Link to="/rent-car" className="browse-cars-btn">
            <i className="bi bi-car-front"></i>
            Browse Cars
          </Link>
        </div>
        
        <div className="error-help">
          <p>Need help? Try these options:</p>
          <div className="help-links">
            <Link to="/rent-car">Rent a Car</Link>
            <Link to="/rent-your-car">Become a Partner</Link>
            <Link to="/contracts">View Contracts</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarRental404;
