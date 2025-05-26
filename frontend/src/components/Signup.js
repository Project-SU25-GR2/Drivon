import React, { useState } from 'react';
import axios from 'axios';

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
        }
    };

    return (
        <form onSubmit={handleSubmit} className="auth-form">
            {generalError && <div className="error-message">{generalError}</div>}
            
            <div>
                <label>Full Name:</label>
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
                <label>Email:</label>
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
                <label>Password:</label>
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
                <label>Phone:</label>
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
                <label>Address:</label>
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

            <button type="submit" className="auth-button">
                Sign Up
            </button>
        </form>
    );
};

export default Signup; 