import React, { useState } from 'react';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const Login = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await axios.post('http://localhost:8080/api/auth/login', {
                email,
                password
            });

            if (response.data) {
                onLoginSuccess(response.data.user || response.data);
                if (response.data.token) {
                    localStorage.setItem('token', response.data.token);
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const decoded = jwtDecode(credentialResponse.credential);
            const response = await axios.post('http://localhost:8080/api/auth/google', {
                email: decoded.email,
                name: decoded.name,
                googleId: decoded.sub
            });
            
            if (response.data) {
                onLoginSuccess(response.data.user || response.data);
                if (response.data.token) {
                    localStorage.setItem('token', response.data.token);
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Google login failed. Please try again.');
        }
    };

    const handleGoogleError = () => {
        setError('Google login failed. Please try again.');
    };

    return (
        <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
            <h2>Login</h2>
            <form onSubmit={handleSubmit} className="auth-form">
                {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="auth-input"
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="auth-input"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="auth-button"
                >
                    Login
                </button>
                
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <p>Or login with:</p>
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        useOneTap
                        popup_type="popup"
                        popup_properties={{
                            width: 500,
                            height: 600,
                            left: window.screenX + (window.outerWidth - 500) / 2,
                            top: window.screenY + (window.outerHeight - 600) / 2
                        }}
                    />
                </div>
            </form>
        </div>
    );
};

export default Login; 