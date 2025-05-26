import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import Signup from './components/Signup';

function App() {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  useEffect(() => {
    if (showAuthModal) {
      requestAnimationFrame(() => {
        setIsOpening(true);
        setTimeout(() => {
          setIsOpening(false);
        }, 500);
      });
    }
  }, [showAuthModal]);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    closeModal();
  };

  const handleSignupSuccess = (userData) => {
    setUser(userData);
    closeModal();
  };

  const toggleForm = () => {
    setShowLogin(!showLogin);
  };

  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowAuthModal(false);
      setIsClosing(false);
    }, 500);
  };

  const openModal = (isLogin) => {
    setShowLogin(isLogin);
    setShowAuthModal(true);
  };

  if (user) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Welcome, {user.fullName}!</h1>
          <button
            onClick={() => setUser(null)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </header>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to Drivon</h1>
        <div style={{ marginTop: '20px' }}>
          <button
            onClick={() => openModal(true)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            Login
          </button>
          <button
            onClick={() => openModal(false)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Sign Up
          </button>
        </div>
      </header>

      {showAuthModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            opacity: isClosing ? 0 : 1,
            transition: 'opacity 0.5s ease-in-out'
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
              position: 'relative',
              maxWidth: '500px',
              width: '90%',
              transform: isClosing ? 'scale(0.95)' : isOpening ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 0.5s ease-in-out',
              willChange: 'transform'
            }}
          >
            <button
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#666'
              }}
            >
              ×
            </button>
            {showLogin ? (
              <>
                <Login onLoginSuccess={handleLoginSuccess} />
                <p style={{ textAlign: 'center', marginTop: '15px' }}>
                  Don't have an account?{' '}
                  <button
                    onClick={toggleForm}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#007bff',
                      cursor: 'pointer',
                      padding: 0,
                      font: 'inherit'
                    }}
                  >
                    Sign up
                  </button>
                </p>
              </>
            ) : (
              <>
                <Signup onSignupSuccess={handleSignupSuccess} />
                <p style={{ textAlign: 'center', marginTop: '15px' }}>
                  Already have an account?{' '}
                  <button
                    onClick={toggleForm}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#007bff',
                      cursor: 'pointer',
                      padding: 0,
                      font: 'inherit'
                    }}
                  >
                    Login
                  </button>
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
