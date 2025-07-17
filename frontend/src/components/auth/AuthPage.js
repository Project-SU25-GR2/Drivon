import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';

const AuthPage = ({ handleLoginSuccess, handleSignupSuccess }) => {
  const [showLogin, setShowLogin] = useState(true);

  const toggleForm = (show) => {
    setShowLogin(show);
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-logo">CAR<span>RENTAL</span></div>
        <h1 className="auth-title">{showLogin ? 'Welcome Back!' : 'Create Account'}</h1>
        {showLogin ? (
          <>
            <Login onLoginSuccess={handleLoginSuccess} />
            <p className="auth-toggle">
              Don't have an account?{' '}
              <button onClick={() => toggleForm(false)}>
                Sign up
              </button>
            </p>
          </>
        ) : (
          <>
            <Signup onSignupSuccess={handleSignupSuccess} />
            <p className="auth-toggle">
              Already have an account?{' '}
              <button onClick={() => toggleForm(true)}>
                Login
              </button>
            </p>
          </>
        )}
        {showLogin && (
          <p style={{ marginTop: '10px' }}>
            <Link to="/forgot-password">Forgot password?</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthPage; 