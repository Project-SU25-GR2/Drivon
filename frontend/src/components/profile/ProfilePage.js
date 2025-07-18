import React, { useState, useEffect, useRef } from 'react';
import { Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import '../css/ProfilePage.css';
import { API_URL } from '../../api/configApi';
import { showErrorToast, showSuccessToast } from '../notification/notification';
import cloudinaryConfig from '../../config/cloudinary';
import { FiUpload, FiTrash2 } from 'react-icons/fi';
import { Table } from "antd";
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

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
  const [withdrawRequests, setWithdrawRequests] = useState([]);

  useEffect(() => {
    setEditedUser({ ...user });
    checkPasswordStatus();
    if (user && user.userId) {
      fetchUserImages();
    }
    setLoading(false);
    setError(null);
  }, [user]);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData) return;
    axios.get(`${API_URL}/owner-withdraw/${userData.userId}`)
      .then(res => setWithdrawRequests(res.data))
      .catch(() => setWithdrawRequests([]));
  }, []);

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
      showErrorToast('Cannot load document list');
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
      errors.fullName = 'Full name is required';
    }
    if (!editedUser.phone?.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(editedUser.phone.trim())) {
      errors.phone = 'Invalid phone number (must be 10 digits)';
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
        setSuccessMessage('Profile updated successfully!');
        showSuccessToast('Profile updated successfully!');
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      const errorMessage = err.response?.data?.error || 'An error occurred while updating profile.';
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
        setDocUploadError('File size must not exceed 5MB');
        setDocFile(null);
        setDocPreview(null);
        return;
      }
      if (!file.type.startsWith('image/')) {
        setDocUploadError('Please select an image file');
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
      setDocUploadError('Only images allowed, each file max 5MB!');
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
        setDocUploadError('Please select at least 1 document image');
        setDocUploading(false);
        return;
      }
      // Upload all images to Cloudinary
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
      // Send each image to backend
      for (const imageUrl of imageUrls) {
        await axios.post(`${API_URL}/user/image`, {
          userId: user.userId,
          imageUrl,
          documentType: pendingDocType,
          description: pendingDocDesc
        });
      }
      showSuccessToast('Document uploaded successfully!');
      setPendingDocFiles([]);
      setPendingDocPreviews([]);
      setDocDesc('');
      fetchUserImages();
      setDocEditMode(false);
    } catch (err) {
      setDocUploadError('Document upload failed!');
      showErrorToast('Document upload failed!');
    }
    setDocUploading(false);
  };

  const handleDeleteUserImage = async (imageId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await axios.delete(`${API_URL}/user/image/${imageId}`);
      showSuccessToast('Document deleted!');
      fetchUserImages();
    } catch (err) {
      showErrorToast('Failed to delete document!');
    }
  };

  const handleSign = async (requestId) => {
    if (!window.confirm('Are you sure you have received the money? This action cannot be undone!')) return;
    try {
      await axios.patch(`${API_URL}/owner-withdraw/${requestId}/sign`, { sign: true });
      setWithdrawRequests(his => his.map(w => w.requestId === requestId ? { ...w, sign: true } : w));
      showSuccessToast('Confirmed money receipt!');
    } catch {
      showErrorToast('Confirmation failed!');
    }
  };

  // Group userImages by documentType
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
          <span className="visually-hidden">Loading...</span>
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
          <h2 className="profile-name">{user.fullName || 'Not updated yet'}</h2>
          <p className="profile-email">{user.email}</p>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <div className="section-header">
            <h3>
              <i className="bi bi-person-lines-fill me-2"></i>
              Personal Information
            </h3>
            {!isEditing && (
              <button onClick={handleEditToggle} className="btn btn-outline-primary btn-sm">
                <i className="bi bi-pencil-square me-2"></i>
                Edit
              </button>
            )}
          </div>

          {!isEditing ? (
            <div>
            <div className="info-grid">
              <div className="info-item">
                <label>Full Name</label>
                <p>{user.fullName || 'Not updated yet'}</p>
              </div>
              <div className="info-item">
                <label>Email</label>
                <p>{user.email}</p>
              </div>
              </div>
              <div className="info-grid">
              <div className="info-item">
                <label>Phone Number</label>
                <p>{user.phone || 'Not updated yet'}</p>
              </div>
              <div className="info-item">
                <label>Address</label>
                <p>{user.address || 'Not updated yet'}</p>
                </div>
              </div>
            </div>
          ) : (
            <form className="edit-form" onSubmit={(e) => e.preventDefault()}>
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  type="text"
                  className={`form-control ${error?.fullName ? 'is-invalid' : ''}`}
                  id="fullName"
                  name="fullName"
                  value={editedUser.fullName || ''}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
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
                  title="Email cannot be changed"
                />
                <small className="form-text text-muted">
                  <i className="bi bi-info-circle me-1"></i>
                  Email cannot be changed
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  className={`form-control ${error?.phone ? 'is-invalid' : ''}`}
                  id="phone"
                  name="phone"
                  value={editedUser.phone || ''}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                />
                {error?.phone && <div className="invalid-feedback">{error.phone}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="address">Address</label>
                <textarea
                  className="form-control"
                  id="address"
                  name="address"
                  rows="3"
                  value={editedUser.address || ''}
                  onChange={handleInputChange}
                  placeholder="Enter address"
                ></textarea>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-primary" onClick={handleSave}>
                  <i className="bi bi-check-lg me-2"></i>
                  Save changes
                </button>
                <button type="button" className="btn btn-light" onClick={handleCancel}>
                  <i className="bi bi-x-lg me-2"></i>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="profile-section">
          <div className="section-header">
            <h3>
              <i className="bi bi-shield-lock-fill me-2"></i>
              Security
            </h3>
          </div>
          <div className="security-actions">
            <Link to="/change-password" className="security-action-item">
              <i className="bi bi-key-fill"></i>
              <div>
                <h4>{hasPassword ? 'Change password' : 'Create password'}</h4>
                <p>{hasPassword ? 'Change your login password' : 'Create a password to protect your account'}</p>
              </div>
              <i className="bi bi-chevron-right"></i>
            </Link>
            <Link to="/change-avatar" className="security-action-item">
              <i className="bi bi-person-circle"></i>
              <div>
                <h4>Change avatar</h4>
                <p>Update your avatar</p>
              </div>
              <i className="bi bi-chevron-right"></i>
            </Link>
          </div>
        </div>

        <div className="profile-section">
          <div className="section-header">
            <h3>
              <i className="bi bi-card-image me-2"></i>
              Identity Documents
            </h3>
            <button onClick={handleDocEditToggle} className="btn btn-outline-primary btn-sm">
              <i className="bi bi-pencil-square me-2"></i>
              {docEditMode ? 'Close' : 'Edit'}
            </button>
          </div>
          <form className="doc-upload-form" onSubmit={handleDocSave}>
            <div className="row g-2 align-items-end">
              <div className="col-md-6">
                <label>Image</label>
                <div
                  className="doc-dropzone"
                  onDrop={docEditMode ? handleDrop : undefined}
                  onDragOver={docEditMode ? handleDragOver : undefined}
                  onClick={docEditMode ? handleClickDropZone : undefined}
                  style={{ cursor: docEditMode ? 'pointer' : 'not-allowed', opacity: docEditMode ? 1 : 0.6 }}
                >
                  <div className="doc-dropzone-placeholder">
                    <FiUpload size={48} color="#4fc3f7" />
                    <p>Drag and drop images here or click to select</p>
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
                          title="Delete this image"
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
                {docUploading && <div className="text-info mt-2">Uploading...</div>}
              </div>
              <div className="col-md-6">
                <label>Document Type</label>
                <select className="form-select mb-2" value={pendingDocType} onChange={e => setPendingDocType(e.target.value)} disabled={!docEditMode || (userImages.some(img => (img.verified === true || img.verified === 1) && img.documentType === pendingDocType))}>
                  <option value="cccd">Citizen ID</option>
                  <option value="license">Driver's License</option>
                  <option value="passport">Passport</option>
                  <option value="other">Other</option>
                </select>
                <label>Description</label>
                <input type="text" className="form-control" value={pendingDocDesc} onChange={e => setPendingDocDesc(e.target.value)} placeholder="Document description" disabled={!docEditMode} />
              </div>
            </div>
            {docEditMode && (
              <div className="form-actions mt-3">
                <button type="submit" className="btn btn-primary me-2" disabled={docUploading}>Save changes</button>
                <button type="button" className="btn btn-light" onClick={handleDocCancel} disabled={docUploading}>Cancel</button>
              </div>
            )}
            {docUploadError && <div className="text-danger mt-2">{docUploadError}</div>}
          </form>
          <div className="doc-list mt-3">
            {userImages.length === 0 ? (
              <div className="text-muted">No documents yet.</div>
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
                              <img src={img.imageUrl} alt={img.documentType} 
                                style={{ 
                                  maxHeight: 240, 
                                  maxWidth: 320, 
                                  border: `2.5px solid ${img.verified === true || img.verified === 1 ? '#28a745' : '#dc3545'}`,
                                  borderRadius: 8 
                                }} 
                              />
                              {/* Chỉ hiển thị description nếu chưa verify */}
                              <div className="mt-3 text-center" style={{minWidth:180}}>
                                {(!img.verified || img.verified === 0) && img.description && <div className="text-muted small">{img.description}</div>}
                                <small className="text-muted">Uploaded: {img.uploadedAt ? new Date(img.uploadedAt).toLocaleString() : ''}</small>
                                <div className="mt-2">
                                  {typeof img.verified !== 'undefined' && (
                                    img.verified === true || img.verified === 1 ? (
                                      <span style={{ color: 'green', fontWeight: 500 }}><FaCheckCircle style={{marginRight:4}}/>Verified</span>
                                    ) : (
                                      <span style={{ color: 'red', fontWeight: 500 }}><FaTimesCircle style={{marginRight:4}}/>Not Verified</span>
                                    )
                                  )}
                                </div>
                              </div>
                              {/* Ẩn nút xóa nếu đã verify */}
                              {docEditMode && (!img.verified || img.verified === 0) && (
                                <button
                                  className="btn btn-sm btn-danger"
                                  style={{ position: 'absolute', top: 8, right: 8, padding: '4px 10px', borderRadius: '50%', zIndex: 2 }}
                                  title="Delete document"
                                  onClick={() => handleDeleteUserImage(img.imageId)}
                                >
                                  <FiTrash2 size={20} />
                                </button>
                              )}
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

        <div className="profile-section">
          <div className="section-header">
            <h3>
              <i className="bi bi-cash-coin me-2"></i>
              Withdrawal Requests
            </h3>
          </div>
          <Table
            dataSource={withdrawRequests}
            rowKey="requestId"
            columns={[
              { title: "Amount", dataIndex: "amount" },
              { title: "Status", dataIndex: "status" },
              { title: "Note", dataIndex: "note" },
              { title: "Request Date", dataIndex: "requestedAt" },
              {
                title: "Money Received",
                dataIndex: "sign",
                render: (sign, record) => {
                  if (sign) {
                    return <span style={{ color: 'green', fontWeight: 600 }}>Confirmed</span>;
                  }
                  if (record.status === 'completed') {
                    return <input type="checkbox" onChange={() => handleSign(record.requestId)} />;
                  }
                  return <span style={{ color: '#999' }}>Not completed</span>;
                }
              }
            ]}
            style={{ marginTop: 32 }}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 