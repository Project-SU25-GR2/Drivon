import React, { useState } from 'react';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import SimpleButton from '../others/SimpleButton';
import { API_URL } from '../../api/configApi';
import { showErrorToast, showSuccessToast } from '../notification/notification';
const Signup = ({ onSignupSuccess }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        phone: '',
        address: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [showVerification, setShowVerification] = useState(false);
    const [resendCount, setResendCount] = useState(0);
    const [lastResendTime, setLastResendTime] = useState(null);

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
        setIsLoading(true);

        try {
            const response = await axios.post(`${API_URL}/auth/signup`, formData);
            if (response.data) {
                showSuccessToast('Registration successful. Please check your email to verify your account.');
                setShowVerification(true);
            }
        } catch (err) {
            if (err.response?.data) {
                // Handle validation errors (object with field names as keys)
                if (typeof err.response.data === 'object' && !err.response.data.general) {
                    // Show toast for each field error
                    Object.values(err.response.data).forEach(errorMsg => {
                        if (errorMsg) {
                            showErrorToast(errorMsg);
                        }
                    });
                    setErrors(err.response.data);
                } else if (typeof err.response.data === 'object' && err.response.data.general) {
                    // Handle general error from backend (object with 'general' key)
                     showErrorToast(err.response.data.general);
                     setErrors({}); // Clear field errors if a general error is present
                } 
                else if (typeof err.response.data === 'string'){
                     // Handle general error message (string)
                     showErrorToast(err.response.data);
                     setErrors({}); // Clear field errors if a general error is present
                }
                else {
                    // Fallback for unexpected error response format
                    showErrorToast('Registration failed. Unknown error format.');
                    setErrors({});
                }
            } else {
                // Handle network errors or no response
                showErrorToast('Registration failed. No response from server.');
                setErrors({});
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyEmail = async (e) => {
        e.preventDefault();
        setErrors({});
        setIsLoading(true);

        try {
            const response = await axios.post(`${API_URL}/auth/verify-email`, {
                email: formData.email,
                code: verificationCode
            });
            if (response.data) {
                // Format data same as Login
                const userDataWithToken = { ...response.data.user, token: response.data.token };
                showSuccessToast('Email verification successful!');
                onSignupSuccess(userDataWithToken);
            }
        } catch (err) {
            if (err.response?.data) {
                showErrorToast(err.response.data);
            } else {
                showErrorToast('Verification failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        // Check if user has exceeded resend limit (3 times in 5 minutes)
        const now = new Date();
        if (lastResendTime && (now - lastResendTime) < 5 * 60 * 1000) {
            if (resendCount >= 3) {
                showErrorToast('You have sent the code too many times. Please try again in 5 minutes.');
                return;
            }
        } else {
            // Reset counter if 5 minutes have passed
            setResendCount(0);
        }

        setErrors({});
        setIsLoading(true);

        try {
            const response = await axios.post(`${API_URL}/auth/resend-verification`, {
                email: formData.email
            });
            showSuccessToast('New verification code has been sent to your email.');
            setResendCount(prev => prev + 1);
            setLastResendTime(now);
        } catch (err) {
            if (err.response?.data) {
                showErrorToast(err.response.data);
            } else {
                showErrorToast('Failed to resend verification code. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setIsLoading(true);
        try {
            const decoded = jwtDecode(credentialResponse.credential);
            const response = await axios.post(`${API_URL}/auth/google`, {
                email: decoded.email,
                name: decoded.name,
                googleId: decoded.sub
            });
            
            if (response.data) {
                // Format data same as Login
                const userDataWithToken = { ...response.data.user, token: response.data.token };
                showSuccessToast('Google signup successful!');
                onSignupSuccess(userDataWithToken);
            }
        } catch (err) {
            showErrorToast(err.response?.data?.message || 'Google signup failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleError = () => {
        showErrorToast('Google signup failed. Please try again.');
    };

    if (showVerification) {
        return (
            <form onSubmit={handleVerifyEmail} className="auth-form">
                <h3>Email Verification</h3>
                
                <div>
                    <input
                        type="text"
                        placeholder="Enter verification code"
                        value={verificationCode}
                        onChange={(e) => {
                            // Only allow numbers
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            setVerificationCode(value);
                        }}
                        className="auth-input"
                        required
                        maxLength="6"
                        pattern="[0-9]*"
                    />
                    <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                        6-digit verification code, valid for 5 minutes
                    </small>
                </div>

                <SimpleButton
                    type="submit"
                    isLoading={isLoading}
                >
                    Verify
                </SimpleButton>

                <SimpleButton
                    type="button"
                    onClick={handleResendCode}
                    isLoading={isLoading}
                    style={{ marginTop: '10px', backgroundColor: '#6c757d' }}
                    disabled={resendCount >= 3 && lastResendTime && (new Date() - lastResendTime) < 5 * 60 * 1000}
                >
                    {resendCount >= 3 ? 'Sent 3 times' : 'Resend code'}
                </SimpleButton>
            </form>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="auth-form">
            
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
            </div>

            <SimpleButton
                type="submit"
                isLoading={isLoading}
            >
                Sign Up
            </SimpleButton>

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