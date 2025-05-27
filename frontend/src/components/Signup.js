import React, { useState } from 'react';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import Button from './Button';

const Signup = ({ onSignupSuccess }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        phone: '',
        address: ''
    });
    const [errors, setErrors] = useState({});
    const [generalError, setGeneralError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setGeneralError('');
        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:8080/api/auth/signup', formData);
            if (response.data) {
                onSignupSuccess(response.data);
            }
        } catch (err) {
            if (err.response?.data) {
                // Handle validation errors
                if (typeof err.response.data === 'object') {
                    setErrors(err.response.data);
                } else {
                    // Handle general error message
                    setGeneralError(err.response.data);
                }
            } else {
                setGeneralError('Registration failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setIsLoading(true);
        try {
            const decoded = jwtDecode(credentialResponse.credential);
            const response = await axios.post('http://localhost:8080/api/auth/google', {
                email: decoded.email,
                name: decoded.name,
                googleId: decoded.sub
            });
            
            if (response.data) {
                onSignupSuccess(response.data);
            }
        } catch (err) {
            setGeneralError(err.response?.data?.message || 'Google signup failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleError = () => {
        setGeneralError('Google signup failed. Please try again.');
    };

    return (
        <form onSubmit={handleSubmit} className="auth-form">
            {generalError && <div className="error-message">{generalError}</div>}
            
            <div>
                <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`auth-input ${errors.fullName ? 'error' : ''}`}
                    required
                />
                {errors.fullName && <div className="field-error">{errors.fullName}</div>}
            </div>

            <div>
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`auth-input ${errors.email ? 'error' : ''}`}
                    required
                />
                {errors.email && <div className="field-error">{errors.email}</div>}
            </div>

            <div>
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`auth-input ${errors.password ? 'error' : ''}`}
                    required
                />
                {errors.password && <div className="field-error">{errors.password}</div>}
            </div>

            <div>
                <input
                    type="tel"
                    name="phone"
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`auth-input ${errors.phone ? 'error' : ''}`}
                    required
                />
                {errors.phone && <div className="field-error">{errors.phone}</div>}
            </div>

            <div>
                <input
                    type="text"
                    name="address"
                    placeholder="Address"
                    value={formData.address}
                    onChange={handleChange}
                    className={`auth-input ${errors.address ? 'error' : ''}`}
                    required
                />
                {errors.address && <div className="field-error">{errors.address}</div>}
            </div>

            <Button
                type="submit"
                isLoading={isLoading}
                className="auth-button"
            >
                Sign Up
            </Button>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <p>Or sign up with:</p>
                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap
                />
            </div>
        </form>
    );
};

export default Signup; 