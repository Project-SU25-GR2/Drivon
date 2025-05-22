import React, { useState } from 'react';
import './App.css';
import Login from './components/Login';
import Signup from './components/Signup';

function App() {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(true);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleSignupSuccess = (userData) => {
    setUser(userData);
  };

  const toggleForm = () => {
    setShowLogin(!showLogin);
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
        {showLogin ? (
          <>
            <Login onLoginSuccess={handleLoginSuccess} />
            <p>
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
            <p>
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
      </header>
    </div>
  );
}

export default App;
