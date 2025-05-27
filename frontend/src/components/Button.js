import React from 'react';
import './Button.css';

const Button = ({ 
  children, 
  onClick, 
  isLoading = false, 
  disabled = false,
  className = '',
  type = 'button'
}) => {
  return (
    <button
      type={type}
      className={`custom-button ${className} ${isLoading ? 'loading' : ''}`}
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <div className="spinner"></div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button; 