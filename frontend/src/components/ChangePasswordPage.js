import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ChangePasswordPage = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasPassword, setHasPassword] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Kiểm tra xem người dùng đã có mật khẩu hay chưa
    const checkPasswordStatus = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.email) {
          navigate('/auth');
          return;
        }

        const response = await axios.get(`http://localhost:8080/api/profile/check-password-status/${user.email}`);
        setHasPassword(response.data.hasPassword);
      } catch (err) {
        console.error('Error checking password status:', err);
        setError('Không thể kiểm tra trạng thái mật khẩu');
      }
    };

    checkPasswordStatus();
  }, [navigate]);

  const validatePassword = (password) => {
    if (password.length < 8) {
      return 'Mật khẩu phải có ít nhất 8 ký tự';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Mật khẩu phải chứa ít nhất 1 chữ hoa';
    }
    if (!/[a-z]/.test(password)) {
      return 'Mật khẩu phải chứa ít nhất 1 chữ thường';
    }
    if (!/[0-9]/.test(password)) {
      return 'Mật khẩu phải chứa ít nhất 1 số';
    }
    if (!/[!@#$%^&*]/.test(password)) {
      return 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (!@#$%^&*)';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    // Validate mật khẩu mới
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      setLoading(false);
      return;
    }

    // Kiểm tra mật khẩu xác nhận
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      setLoading(false);
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.email) {
        throw new Error('User not found');
      }

      const endpoint = hasPassword ? '/api/profile/change-password' : '/api/profile/create-password';
      const payload = hasPassword 
        ? { email: user.email, currentPassword, newPassword }
        : { email: user.email, newPassword };

      const response = await axios.post(`http://localhost:8080${endpoint}`, payload);

      if (response.data.success) {
        setSuccess(true);
        setNewPassword('');
        setConfirmPassword('');
        setCurrentPassword('');
        
        // Redirect sau 2 giây
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      }
    } catch (err) {
      console.error('Error changing password:', err);
      setError(err.response?.data?.error || 'Có lỗi xảy ra khi thay đổi mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header bg-primary text-white">
          <h2 className="h5 mb-0">
            <i className="bi bi-key me-2"></i>
            {hasPassword ? 'Đổi mật khẩu' : 'Tạo mật khẩu mới'}
          </h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                {error}
                <button type="button" className="btn-close" onClick={() => setError(null)}></button>
              </div>
            )}

            {success && (
              <div className="alert alert-success alert-dismissible fade show" role="alert">
                {hasPassword ? 'Đổi mật khẩu thành công!' : 'Tạo mật khẩu thành công!'}
                <button type="button" className="btn-close" onClick={() => setSuccess(false)}></button>
              </div>
            )}

            {hasPassword && (
              <div className="mb-3">
                <label htmlFor="currentPassword" className="form-label">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  className="form-control"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="mb-3">
              <label htmlFor="newPassword" className="form-label">Mật khẩu mới</label>
              <input
                type="password"
                className="form-control"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <div className="form-text">
                Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="confirmPassword" className="form-label">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                className="form-control"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <button
                type="submit"
                className="btn btn-primary me-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    {hasPassword ? 'Đổi mật khẩu' : 'Tạo mật khẩu'}
                  </>
                )}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/profile')}
                disabled={loading}
              >
                <i className="bi bi-x-circle me-2"></i>
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage; 