import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import cloudinaryConfig  from '../../config/cloudinary';
import '../css/ChangeAvatarPage.css';
import { API_URL } from '../../api/configApi';
import { showErrorToast, showSuccessToast } from '../notification/notification';

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
        setUploadError('File size must not exceed 5MB');
        showErrorToast('File size must not exceed 5MB');
        setSelectedFile(null);
        setPreviewUrl(null);
        return;
      }

      if (!file.type.startsWith('image/')) {
        setUploadError('Please select an image file');
        showErrorToast('Please select an image file');
        setSelectedFile(null);
        setPreviewUrl(null);
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setUploadError(null);
      setUploadSuccess(false);
    } else {
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select an image to upload');
      showErrorToast('Please select an image to upload');
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
      showSuccessToast('Avatar updated successfully!');
      
      setTimeout(() => {
        window.location.href = '/profile';
      }, 1500);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      const errorMessage = error.response?.data?.error || 'An error occurred while uploading the image.';
      setUploadError(errorMessage);
      showErrorToast(errorMessage);
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
            Change Avatar
          </h2>
          <p className="text-muted">Choose a new avatar for your account</p>
        </div>

        <div className="avatar-card-body">
          <div className="upload-section">
            <div className="preview-area">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="avatar-preview" />
              ) : (
                <div className="upload-placeholder">
                  <i className="bi bi-cloud-arrow-up"></i>
                  <p>Drag and drop an image here or click to select</p>
                </div>
              )}
            </div>

            <div className="upload-controls">
              <label className="upload-button" htmlFor="avatar-upload">
                <i className="bi bi-image me-2"></i>
                Choose Image
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
                  Supported formats: JPG, PNG, GIF. Max size: 5MB
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
              Avatar updated successfully!
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
                  Uploading...
                </>
              ) : (
                <>
                  <i className="bi bi-cloud-upload me-2"></i>
                  Save Avatar
                </>
              )}
            </button>
            <button
              className="btn btn-light"
              onClick={() => navigate('/profile')}
              disabled={uploading}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangeAvatarPage; 