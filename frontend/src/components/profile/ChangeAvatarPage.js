import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import cloudinaryConfig  from '../../config/cloudinary';
import '../css/ChangeAvatarPage.css';
import { API_URL } from '../../api/configApi';
const ChangeAvatarPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('Kích thước file không được vượt quá 5MB');
        setSelectedFile(null);
        setPreviewUrl(null);
        return;
      }

      if (!file.type.startsWith('image/')) {
        setUploadError('Vui lòng chọn file hình ảnh');
        setSelectedFile(null);
        setPreviewUrl(null);
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(API_URL.createObjectURL(file));
      setUploadError(null);
      setUploadSuccess(false);
    } else {
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Vui lòng chọn ảnh để tải lên.');
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('upload_preset', cloudinaryConfig.uploadPreset);
      formData.append('api_key', cloudinaryConfig.apiKey);

      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/upload`;
      const cloudinaryResponse = await axios.post(cloudinaryUrl, formData);
      const imageUrl = cloudinaryResponse.data.secure_url;

      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.email) {
        throw new Error('User not found');
      }

        const response = await axios.put(`${API_URL}/profile/update-avatar`, {
        email: user.email,
        avatarUrl: imageUrl
      });

      const updatedUser = response.data;
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setUploadSuccess(true);
      setUploadError(null);
      
      setTimeout(() => {
        window.location.href = '/profile';
      }, 1500);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setUploadError(error.response?.data?.error || 'Có lỗi xảy ra khi tải ảnh lên.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="change-avatar-container">
      <div className="avatar-card">
        <div className="avatar-card-header">
          <h2>
            <i className="bi bi-person-circle me-2"></i>
            Đổi ảnh đại diện
          </h2>
          <p className="text-muted">Chọn ảnh đại diện mới cho tài khoản của bạn</p>
        </div>

        <div className="avatar-card-body">
          <div className="upload-section">
            <div className="preview-area">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="avatar-preview" />
              ) : (
                <div className="upload-placeholder">
                  <i className="bi bi-cloud-arrow-up"></i>
                  <p>Kéo thả ảnh vào đây hoặc click để chọn</p>
                </div>
              )}
            </div>

            <div className="upload-controls">
              <label className="upload-button" htmlFor="avatar-upload">
                <i className="bi bi-image me-2"></i>
                Chọn ảnh
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploading}
                  style={{ display: 'none' }}
                />
              </label>
              
              <div className="upload-info">
                <small className="text-muted">
                  <i className="bi bi-info-circle me-1"></i>
                  Hỗ trợ các định dạng: JPG, PNG, GIF. Kích thước tối đa: 5MB
                </small>
              </div>
            </div>
          </div>

          {uploadError && (
            <div className="alert alert-danger alert-dismissible fade show mt-3" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {uploadError}
              <button type="button" className="btn-close" onClick={() => setUploadError(null)}></button>
            </div>
          )}

          {uploadSuccess && (
            <div className="alert alert-success alert-dismissible fade show mt-3" role="alert">
              <i className="bi bi-check-circle-fill me-2"></i>
              Cập nhật ảnh đại diện thành công!
              <button type="button" className="btn-close" onClick={() => setUploadSuccess(false)}></button>
            </div>
          )}

          <div className="avatar-actions">
            <button
              className="btn btn-primary"
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
            >
              {uploading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Đang tải lên...
                </>
              ) : (
                <>
                  <i className="bi bi-cloud-upload me-2"></i>
                  Lưu ảnh đại diện
                </>
              )}
            </button>
            <button
              className="btn btn-light"
              onClick={() => navigate('/profile')}
              disabled={uploading}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Quay lại
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangeAvatarPage; 