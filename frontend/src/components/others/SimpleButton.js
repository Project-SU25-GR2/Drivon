import React from 'react';

const SimpleButton = ({ 
  children, 
  onClick, 
  isLoading = false, 
  disabled = false,
  className = '',
  type = 'button',
  style = {}
}) => {
  const buttonStyle = {
    width: '100%',
    padding: '12px 20px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: isLoading || disabled ? '#cccccc' : '#007bff',
    color: 'white',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: isLoading || disabled ? 'not-allowed' : 'pointer',
    transition: 'background-color 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    minHeight: '48px',
    boxSizing: 'border-box',
    ...style
  };

  const spinnerStyle = {
    width: '16px',
    height: '16px',
    border: '2px solid #ffffff',
    borderTop: '2px solid transparent',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  };

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <button
        type={type}
        className={className}
        onClick={onClick}
        disabled={disabled || isLoading}
        style={buttonStyle}
      >
        {isLoading && <div style={spinnerStyle}></div>}
        <span>{children}</span>
      </button>
    </>
  );
};

export default SimpleButton; 