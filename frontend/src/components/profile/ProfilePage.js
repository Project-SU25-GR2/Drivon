import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import '../css/ProfilePage.css';

const ProfilePage = ({ user, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [hasPassword, setHasPassword] = useState(true);

  useEffect(() => {
    setEditedUser({ ...user });
    checkPasswordStatus();
    setLoading(false);
    setError(null);
  }, [user]);

  const checkPasswordStatus = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/profile/check-password-status/${user.email}`);
      setHasPassword(response.data.hasPassword);
    } catch (err) {
      console.error('Error checking password status:', err);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditedUser({ ...user });
      setError(null);
      setSuccessMessage(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const validateForm = () => {
    const errors = {};
    if (!editedUser.fullName?.trim()) {
      errors.fullName = 'Họ và tên không được để trống';
    }
    if (!editedUser.phone?.trim()) {
      errors.phone = 'Số điện thoại không được để trống';
    } else if (!/^[0-9]{10}$/.test(editedUser.phone.trim())) {
      errors.phone = 'Số điện thoại không hợp lệ (phải có 10 chữ số)';
    }
    return errors;
  };

  const handleSave = async () => {
    try {
      setError(null);
      setSuccessMessage(null);
      
      const validationErrors = validateForm();
      if (Object.keys(validationErrors).length > 0) {
        setError(validationErrors);
        return;
      }

      const response = await axios.put('http://localhost:8080/api/profile/update', editedUser);
      
      if (response.data) {
        onUpdateUser(response.data);
        setSuccessMessage('Cập nhật thông tin thành công!');
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.error || 'Có lỗi xảy ra khi cập nhật thông tin.');
    }
  };

  const handleCancel = () => {
    setEditedUser({ ...user });
    setIsEditing(false);
    setError(null);
    setSuccessMessage(null);
  };

  const getDefaultAvatarUrl = (name) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff&size=128`;
  };

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {successMessage && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <i className="bi bi-check-circle-fill me-2"></i>
          {successMessage}
          <button type="button" className="btn-close" onClick={() => setSuccessMessage(null)}></button>
        </div>
      )}

      {error && typeof error === 'string' && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      <div className="profile-header">
        <div className="profile-avatar-section">
          <div className="profile-avatar-wrapper">
            <img
              src={user.avatarUrl || getDefaultAvatarUrl(user.fullName)}
              alt="Avatar"
              className="profile-avatar"
            />
            <Link to="/change-avatar" className="change-avatar-button">
              <i className="bi bi-camera-fill"></i>
            </Link>
          </div>
          <h2 className="profile-name">{user.fullName || 'Chưa cập nhật'}</h2>
          <p className="profile-email">{user.email}</p>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <div className="section-header">
            <h3>
              <i className="bi bi-person-lines-fill me-2"></i>
              Thông tin cá nhân
            </h3>
            {!isEditing && (
              <button onClick={handleEditToggle} className="btn btn-outline-primary btn-sm">
                <i className="bi bi-pencil-square me-2"></i>
                Chỉnh sửa
              </button>
            )}
          </div>

          {!isEditing ? (
            <div>
              <div className="info-grid">
                <div className="info-item">
                  <label>Họ và tên</label>
                  <p>{user.fullName || 'Chưa cập nhật'}</p>
                </div>
                <div className="info-item">
                  <label>Email</label>
                  <p>{user.email}</p>
                </div>
              </div>
              <div className="info-grid">
                <div className="info-item">
                  <label>Số điện thoại</label>
                  <p>{user.phone || 'Chưa cập nhật'}</p>
                </div>
                <div className="info-item">
                  <label>Địa chỉ</label>
                  <p>{user.address || 'Chưa cập nhật'}</p>
                </div>
              </div>
            </div>
          ) : (
            <form className="edit-form" onSubmit={(e) => e.preventDefault()}>
              <div className="form-group">
                <label htmlFor="fullName">Họ và tên</label>
                <input
                  type="text"
                  className={`form-control ${error?.fullName ? 'is-invalid' : ''}`}
                  id="fullName"
                  name="fullName"
                  value={editedUser.fullName || ''}
                  onChange={handleInputChange}
                  placeholder="Nhập họ và tên"
                />
                {error?.fullName && <div className="invalid-feedback">{error.fullName}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  value={user.email}
                  disabled
                  title="Email không thể thay đổi"
                />
                <small className="form-text text-muted">
                  <i className="bi bi-info-circle me-1"></i>
                  Email không thể thay đổi
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="phone">Số điện thoại</label>
                <input
                  type="tel"
                  className={`form-control ${error?.phone ? 'is-invalid' : ''}`}
                  id="phone"
                  name="phone"
                  value={editedUser.phone || ''}
                  onChange={handleInputChange}
                  placeholder="Nhập số điện thoại"
                />
                {error?.phone && <div className="invalid-feedback">{error.phone}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="address">Địa chỉ</label>
                <textarea
                  className="form-control"
                  id="address"
                  name="address"
                  rows="3"
                  value={editedUser.address || ''}
                  onChange={handleInputChange}
                  placeholder="Nhập địa chỉ"
                ></textarea>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-primary" onClick={handleSave}>
                  <i className="bi bi-check-lg me-2"></i>
                  Lưu thay đổi
                </button>
                <button type="button" className="btn btn-light" onClick={handleCancel}>
                  <i className="bi bi-x-lg me-2"></i>
                  Hủy
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="profile-section">
          <div className="section-header">
            <h3>
              <i className="bi bi-shield-lock-fill me-2"></i>
              Bảo mật
            </h3>
          </div>
          <div className="security-actions">
            <Link to="/change-password" className="security-action-item">
              <i className="bi bi-key-fill"></i>
              <div>
                <h4>{hasPassword ? 'Đổi mật khẩu' : 'Tạo mật khẩu'}</h4>
                <p>{hasPassword ? 'Thay đổi mật khẩu đăng nhập của bạn' : 'Tạo mật khẩu để bảo vệ tài khoản'}</p>
              </div>
              <i className="bi bi-chevron-right"></i>
            </Link>
            <Link to="/change-avatar" className="security-action-item">
              <i className="bi bi-person-circle"></i>
              <div>
                <h4>Đổi ảnh đại diện</h4>
                <p>Cập nhật ảnh đại diện của bạn</p>
              </div>
              <i className="bi bi-chevron-right"></i>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 