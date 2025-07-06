import React, { useState, useEffect, useRef } from 'react';
import { Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import '../css/ProfilePage.css';
import { API_URL } from '../../api/configApi';
import { showErrorToast, showSuccessToast } from '../notification/notification';
import cloudinaryConfig from '../../config/cloudinary';
import { FiUpload, FiTrash2 } from 'react-icons/fi';

const ProfilePage = ({ user, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [hasPassword, setHasPassword] = useState(true);
  const [userImages, setUserImages] = useState([]);
  const [docType, setDocType] = useState('cccd');
  const [docDesc, setDocDesc] = useState('');
  const [docFile, setDocFile] = useState(null);
  const [docPreview, setDocPreview] = useState(null);
  const [docUploading, setDocUploading] = useState(false);
  const [docUploadError, setDocUploadError] = useState(null);
  const [docEditMode, setDocEditMode] = useState(false);
  const [pendingDocFiles, setPendingDocFiles] = useState([]);
  const [pendingDocPreviews, setPendingDocPreviews] = useState([]);
  const [pendingDocType, setPendingDocType] = useState('cccd');
  const [pendingDocDesc, setPendingDocDesc] = useState('');
  const docUrlInput = useRef();
  const fileInputRef = useRef();

  useEffect(() => {
    setEditedUser({ ...user });
    checkPasswordStatus();
    if (user && user.userId) {
      fetchUserImages();
    }
    setLoading(false);
    setError(null);
  }, [user]);

  const checkPasswordStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/profile/check-password-status/${user.email}`);
      setHasPassword(response.data.hasPassword);
    } catch (err) {
      console.error('Error checking password status:', err);
      showErrorToast('Failed to check password status');
    }
  };

  const fetchUserImages = async () => {
    try {
      const res = await axios.get(`${API_URL}/user/image`, { params: { userId: user.userId } });
      setUserImages(res.data);
    } catch (err) {
      showErrorToast('Không thể tải danh sách giấy tờ');
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

      const response = await axios.put(`${API_URL}/profile/update`, editedUser);
      
      if (response.data) {
        onUpdateUser(response.data);
        setSuccessMessage('Cập nhật thông tin thành công!');
        showSuccessToast('Profile updated successfully!');
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      const errorMessage = err.response?.data?.error || 'Có lỗi xảy ra khi cập nhật thông tin.';
      setError(errorMessage);
      showErrorToast(errorMessage);
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

  const handleDocFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setDocUploadError('Kích thước file không được vượt quá 5MB');
        setDocFile(null);
        setDocPreview(null);
        return;
      }
      if (!file.type.startsWith('image/')) {
        setDocUploadError('Vui lòng chọn file hình ảnh');
        setDocFile(null);
        setDocPreview(null);
        return;
      }
      setDocFile(file);
      setDocPreview(URL.createObjectURL(file));
      setDocUploadError(null);
    } else {
      setDocFile(null);
      setDocPreview(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleDocFileChange({ target: { files: e.dataTransfer.files } });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleClickDropZone = () => {
    fileInputRef.current.click();
  };

  const handleDocEditToggle = () => {
    if (!docEditMode) {
      setPendingDocFiles([]);
      setPendingDocPreviews([]);
      setPendingDocType(docType);
      setPendingDocDesc(docDesc);
    }
    setDocEditMode(!docEditMode);
  };

  const handleDocCancel = () => {
    setPendingDocFiles([]);
    setPendingDocPreviews([]);
    setPendingDocType(docType);
    setPendingDocDesc(docDesc);
    setDocEditMode(false);
  };

  const handleDocFilesChange = (e) => {
    if (!docEditMode) return;
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => file.size <= 5 * 1024 * 1024 && file.type.startsWith('image/'));
    if (validFiles.length !== files.length) {
      setDocUploadError('Chỉ chọn ảnh, mỗi file tối đa 5MB!');
      return;
    }
    setPendingDocFiles(prev => [...prev, ...validFiles]);
    setPendingDocPreviews(prev => [...prev, ...validFiles.map(file => URL.createObjectURL(file))]);
  };

  const handleDocSave = async (e) => {
    e.preventDefault();
    setDocUploading(true);
    setDocUploadError(null);
    try {
      if (pendingDocFiles.length === 0) {
        setDocUploadError('Vui lòng chọn ít nhất 1 ảnh giấy tờ');
        setDocUploading(false);
        return;
      }
      // Upload tất cả ảnh lên Cloudinary
      const uploadPromises = pendingDocFiles.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', cloudinaryConfig.uploadPreset);
        formData.append('api_key', cloudinaryConfig.apiKey);
        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/upload`;
        const cloudinaryResponse = await axios.post(cloudinaryUrl, formData);
        return cloudinaryResponse.data.secure_url;
      });
      const imageUrls = await Promise.all(uploadPromises);
      // Gửi từng ảnh lên backend
      for (const imageUrl of imageUrls) {
        await axios.post(`${API_URL}/user/image`, {
          userId: user.userId,
          imageUrl,
          documentType: pendingDocType,
          description: pendingDocDesc
        });
      }
      showSuccessToast('Tải lên giấy tờ thành công!');
      setPendingDocFiles([]);
      setPendingDocPreviews([]);
      setDocDesc('');
      fetchUserImages();
      setDocEditMode(false);
    } catch (err) {
      setDocUploadError('Tải lên giấy tờ thất bại!');
      showErrorToast('Tải lên giấy tờ thất bại!');
    }
    setDocUploading(false);
  };

  const handleDeleteUserImage = async (imageId) => {
    if (!window.confirm('Bạn có chắc muốn xoá giấy tờ này?')) return;
    try {
      await axios.delete(`${API_URL}/user/image/${imageId}`);
      showSuccessToast('Đã xoá giấy tờ!');
      fetchUserImages();
    } catch (err) {
      showErrorToast('Xoá giấy tờ thất bại!');
    }
  };

  // Group userImages theo documentType
  const groupedImages = userImages.reduce((acc, img) => {
    if (!acc[img.documentType]) acc[img.documentType] = [];
    acc[img.documentType].push(img);
    return acc;
  }, {});

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

        <div className="profile-section">
          <div className="section-header">
            <h3>
              <i className="bi bi-card-image me-2"></i>
              Giấy tờ tuỳ thân
            </h3>
            <button onClick={handleDocEditToggle} className="btn btn-outline-primary btn-sm">
              <i className="bi bi-pencil-square me-2"></i>
              {docEditMode ? 'Đóng' : 'Chỉnh sửa'}
            </button>
          </div>
          <form className="doc-upload-form" onSubmit={handleDocSave}>
            <div className="row g-2 align-items-end">
              <div className="col-md-6">
                <label>Hình ảnh</label>
                <div
                  className="doc-dropzone"
                  onDrop={docEditMode ? handleDrop : undefined}
                  onDragOver={docEditMode ? handleDragOver : undefined}
                  onClick={docEditMode ? handleClickDropZone : undefined}
                  style={{ cursor: docEditMode ? 'pointer' : 'not-allowed', opacity: docEditMode ? 1 : 0.6 }}
                >
                  <div className="doc-dropzone-placeholder">
                    <FiUpload size={48} color="#4fc3f7" />
                    <p>Kéo thả ảnh vào đây hoặc click để chọn</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                    ref={fileInputRef}
                    onChange={handleDocFilesChange}
                    disabled={!docEditMode || docUploading}
                  />
                </div>
                {pendingDocPreviews.length > 0 && (
                  <div className="d-flex flex-wrap justify-content-center gap-2 mt-2">
                    {pendingDocPreviews.map((url, idx) => (
                      <div key={idx} style={{ position: 'relative', display: 'inline-block' }}>
                        <img src={url} alt="Preview" style={{ maxHeight: 140, maxWidth: 140, border: '1px solid #eee', borderRadius: 4 }} />
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          style={{ position: 'absolute', top: 4, right: 4, padding: '2px 6px', borderRadius: '50%', zIndex: 2 }}
                          title="Xoá ảnh này"
                          onClick={() => {
                            setPendingDocFiles(files => files.filter((_, i) => i !== idx));
                            setPendingDocPreviews(previews => previews.filter((_, i) => i !== idx));
                          }}
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {docUploading && <div className="text-info mt-2">Đang tải lên...</div>}
              </div>
              <div className="col-md-6">
                <label>Loại giấy tờ</label>
                <select className="form-select mb-2" value={pendingDocType} onChange={e => setPendingDocType(e.target.value)} disabled={!docEditMode}>
                  <option value="cccd">CCCD</option>
                  <option value="license">Bằng lái</option>
                  <option value="passport">Hộ chiếu</option>
                  <option value="other">Khác</option>
                </select>
                <label>Mô tả</label>
                <input type="text" className="form-control" value={pendingDocDesc} onChange={e => setPendingDocDesc(e.target.value)} placeholder="Mô tả giấy tờ" disabled={!docEditMode} />
              </div>
            </div>
            {docEditMode && (
              <div className="form-actions mt-3">
                <button type="submit" className="btn btn-primary me-2" disabled={docUploading}>Lưu thay đổi</button>
                <button type="button" className="btn btn-light" onClick={handleDocCancel} disabled={docUploading}>Huỷ</button>
              </div>
            )}
            {docUploadError && <div className="text-danger mt-2">{docUploadError}</div>}
          </form>
          <div className="doc-list mt-3">
            {userImages.length === 0 ? (
              <div className="text-muted">Chưa có giấy tờ nào.</div>
            ) : (
              <div className="row g-3 justify-content-center">
                {Object.entries(groupedImages).map(([docType, images]) => (
                  <div className="col-md-12 d-flex justify-content-center" key={docType}>
                    <div className="card h-100 mx-auto position-relative" style={{maxWidth:1200, width:'100%'}}>
                      <div className="card-body text-center">
                        <h5 className="card-title mb-3 text-center">{docType.toUpperCase()}</h5>
                        <div className="d-flex flex-row flex-wrap justify-content-center align-items-start gap-4 mb-2">
                          {images.map((img, idx) => (
                            <div key={img.imageId} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 8px' }}>
                              <img src={img.imageUrl} alt={img.documentType} style={{ maxHeight: 240, maxWidth: 320, border: '1px solid #eee', borderRadius: 8 }} />
                              {docEditMode && (
                                <button
                                  className="btn btn-sm btn-danger"
                                  style={{ position: 'absolute', top: 8, right: 8, padding: '4px 10px', borderRadius: '50%', zIndex: 2 }}
                                  title="Xoá giấy tờ"
                                  onClick={() => handleDeleteUserImage(img.imageId)}
                                >
                                  <FiTrash2 size={20} />
                                </button>
                              )}
                              <div className="mt-3 text-center" style={{minWidth:180}}>
                                {img.description && <div className="text-muted small">{img.description}</div>}
                                <small className="text-muted">Tải lên: {img.uploadedAt ? new Date(img.uploadedAt).toLocaleString() : ''}</small>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 