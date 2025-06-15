import React, { useState } from 'react';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import SimpleButton from '../others/SimpleButton';

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
                // Format data same as Login
                const userDataWithToken = { ...response.data.user, token: response.data.token };
                onSignupSuccess(userDataWithToken);
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
        // Check if user has exceeded resend limit (3 times in 5 minutes)
        const now = new Date();
        if (lastResendTime && (now - lastResendTime) < 5 * 60 * 1000) {
            if (resendCount >= 3) {
                setGeneralError('Bạn đã gửi lại mã quá nhiều lần. Vui lòng thử lại sau 5 phút.');
                return;
            }
        } else {
            // Reset counter if 5 minutes have passed
            setResendCount(0);
        }

        setErrors({});
        setGeneralError('');
        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:8080/api/auth/resend-verification', {
                email: formData.email
            });
            setMessage('Mã xác thực mới đã được gửi đến email của bạn.');
            setResendCount(prev => prev + 1);
            setLastResendTime(now);
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
                // Format data same as Login
                const userDataWithToken = { ...response.data.user, token: response.data.token };
                onSignupSuccess(userDataWithToken);
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
                        Mã xác thực gồm 6 chữ số, có hiệu lực trong 5 phút
                    </small>
                </div>

                <SimpleButton
                    type="submit"
                    isLoading={isLoading}
                >
                    Xác thực
                </SimpleButton>

                <SimpleButton
                    type="button"
                    onClick={handleResendCode}
                    isLoading={isLoading}
                    style={{ marginTop: '10px', backgroundColor: '#6c757d' }}
                    disabled={resendCount >= 3 && lastResendTime && (new Date() - lastResendTime) < 5 * 60 * 1000}
                >
                    {resendCount >= 3 ? 'Đã gửi lại 3 lần' : 'Gửi lại mã'}
                </SimpleButton>
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