import React, { useState } from 'react';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import Button from '../others/Button';

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
    const [verificationCode, setVerificationCode] = useState('');
    const [showVerification, setShowVerification] = useState(false);
    const [message, setMessage] = useState('');

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
                setMessage('Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.');
                setShowVerification(true);
            }
        } catch (err) {
            if (err.response?.data) {
                // Handle validation errors (object with field names as keys)
                if (typeof err.response.data === 'object' && !err.response.data.general) {
                    setErrors(err.response.data);
                    setGeneralError(''); // Clear general error if field errors are present
                } else if (typeof err.response.data === 'object' && err.response.data.general) {
                    // Handle general error from backend (object with 'general' key)
                     setGeneralError(err.response.data.general);
                     setErrors({}); // Clear field errors if a general error is present
                } 
                else if (typeof err.response.data === 'string'){
                     // Handle general error message (string)
                     setGeneralError(err.response.data);
                     setErrors({}); // Clear field errors if a general error is present
                }
                else {
                    // Fallback for unexpected error response format
                    setGeneralError('Đăng ký thất bại. Định dạng lỗi không xác định.');
                    setErrors({});
                }
            } else {
                // Handle network errors or no response
                setGeneralError('Đăng ký thất bại. Không nhận được phản hồi từ máy chủ.');
                setErrors({});
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyEmail = async (e) => {
        e.preventDefault();
        setErrors({});
        setGeneralError('');
        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:8080/api/auth/verify-email', {
                email: formData.email,
                code: verificationCode
            });
            if (response.data) {
                onSignupSuccess(response.data);
            }
        } catch (err) {
            if (err.response?.data) {
                setGeneralError(err.response.data);
            } else {
                setGeneralError('Verification failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        setErrors({});
        setGeneralError('');
        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:8080/api/auth/resend-verification', {
                email: formData.email
            });
            setMessage('Mã xác thực mới đã được gửi đến email của bạn.');
        } catch (err) {
            if (err.response?.data) {
                setGeneralError(err.response.data);
            } else {
                setGeneralError('Failed to resend verification code. Please try again.');
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

    if (showVerification) {
        return (
            <form onSubmit={handleVerifyEmail} className="auth-form">
                <h3>Xác thực email</h3>
                {message && <div className="success-message">{message}</div>}
                {generalError && <div className="error-message">{generalError}</div>}
                
                <div>
                    <input
                        type="text"
                        placeholder="Nhập mã xác thực"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="auth-input"
                        required
                        maxLength="6"
                    />
                </div>

                <Button
                    type="submit"
                    isLoading={isLoading}
                    className="auth-button"
                >
                    Xác thực
                </Button>

                <Button
                    type="button"
                    onClick={handleResendCode}
                    isLoading={isLoading}
                    className="auth-button secondary"
                    style={{ marginTop: '10px' }}
                >
                    Gửi lại mã
                </Button>
            </form>
        );
    }

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