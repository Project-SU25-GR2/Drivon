import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../../api/configApi';
import './ContractsPage.css';

const ContractsPage = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedContract, setExpandedContract] = useState(null);
  const [zoomImg, setZoomImg] = useState(null);
  
  // Get current user
  const currentUser = JSON.parse(localStorage.getItem('user'));

  const fetchUserContracts = useCallback(async () => {
    if (!currentUser?.userId) {
      setLoading(false);
      setError('Không tìm thấy thông tin người dùng');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await axios.get(`${API_URL}/contracts/user/${currentUser.userId}`, {
        signal: controller.signal,
        timeout: 10000
      });
      
      clearTimeout(timeoutId);
      setContracts(response.data || []);
    } catch (err) {
      if (err.code === 'ECONNABORTED' || err.name === 'AbortError') {
        setError('Yêu cầu bị timeout. Vui lòng thử lại.');
      } else if (err.response?.status === 404) {
        setError('Không tìm thấy hợp đồng nào cho người dùng này.');
      } else if (err.response?.status >= 500) {
        setError('Lỗi server. Vui lòng thử lại sau.');
      } else if (err.code === 'ERR_NETWORK') {
        setError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
      } else {
        setError(err.response?.data?.error || 'Không thể tải danh sách hợp đồng');
      }
      
      setContracts([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.userId]);

  useEffect(() => {
    if (currentUser?.userId) {
      fetchUserContracts();
    } else {
      setLoading(false);
      setError('Không tìm thấy thông tin người dùng');
    }
  }, [currentUser?.userId]);

  // 1. Sửa getStatusBadge để chỉ còn 4 trạng thái, đồng bộ với Partner Manager và chuyển text sang tiếng Anh
  const getStatusBadge = (status) => {
    const statusConfig = {
      'PENDING_LEASE': { class: 'status-pending', text: 'PENDING' },
      'ACTIVE_LEASE': { class: 'status-active', text: 'ACTIVE' },
      'CANCELLED_LEASE': { class: 'status-cancelled', text: 'CANCELLED' },
      'EXPIRED_LEASE': { class: 'status-expired', text: 'EXPIRED' },
    };
    const config = statusConfig[status] || { class: 'status-unknown', text: status };
    return (
      <span className={`status-badge ${config.class}`}>{config.text}</span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch (error) {
      return 'N/A';
    }
  };

  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) return '0 VND';
    try {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(amount);
    } catch (error) {
      return `${amount} VND`;
    }
  };

  const toggleContractExpansion = (contractId) => {
    setExpandedContract(expandedContract === contractId ? null : contractId);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="contracts-page">
        <div className="contracts-loading">
          <div className="spinner"></div>
          <p>Đang tải hợp đồng...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="contracts-page">
        <div className="contracts-error">
          <div className="error-message">
            <i className="bi bi-exclamation-triangle"></i>
            <p>{error}</p>
            <button onClick={fetchUserContracts} className="retry-btn">
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="contracts-page">
      <div className="contracts-header">
        <h1>My Contracts</h1>
        <p>Manage all your contracts and their statuses</p>
      </div>

      {!contracts || contracts.length === 0 ? (
        <div className="no-contracts">
          <div className="no-contracts-content">
            <i className="bi bi-file-earmark-text"></i>
            <h3>No contracts found</h3>
            <p>You have no contracts in the system.</p>
            <div className="no-contracts-actions">
              <button 
                className="btn-primary"
                onClick={() => window.location.href = '/rent-your-car'}
              >
                Register as a Partner
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="contracts-list">
          {contracts.map((contract) => (
            <div key={contract.id || contract.contractNumber} className="contract-card">
              <div className="contract-header">
                <div className="contract-info">
                  <h3>Contract #{contract.contractNumber || 'N/A'}</h3>
                  <p className="contract-date">Created at: {formatDate(contract.createdAt)}</p>
                </div>
                <div className="contract-header-actions">
                  {getStatusBadge(contract.status)}
                  <button 
                    className="expand-btn"
                    onClick={() => toggleContractExpansion(contract.id)}
                  >
                    <i className={`bi ${expandedContract === contract.id ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                    {expandedContract === contract.id ? 'Collapse' : 'View Details'}
                  </button>
                </div>
              </div>

              {/* Basic Contract Info */}
              <div className="contract-details">
                <div className="detail-row">
                  <div className="detail-group">
                    <label>Contract Number:</label>
                    <span>{contract.contractNumber || 'N/A'}</span>
                  </div>
                  <div className="detail-group">
                    <label>Status:</label>
                    {getStatusBadge(contract.status)}
                  </div>
                </div>

                <div className="detail-row">
                  <div className="detail-group">
                    <label>Price per day:</label>
                    <span>{formatCurrency(contract.pricePerDay)}</span>
                  </div>
                  <div className="detail-group">
                    <label>Deposit:</label>
                    <span>{formatCurrency(contract.deposit)}</span>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedContract === contract.id && (
                <div className="contract-expanded-details">
                  {/* Car Information lên đầu */}
                  <div className="detail-section">
                    <h4>🚗 Car Information</h4>
                    <div className="detail-grid">
                      <div className="detail-group">
                        <label>License Plate:</label>
                        <span>{contract.carId || 'N/A'}</span>
                      </div>
                      <div className="detail-group">
                        <label>Car Type:</label>
                        <span>{contract.carData?.brand || 'N/A'} {contract.carData?.model || ''}</span>
                      </div>
                      <div className="detail-group">
                        <label>Year:</label>
                        <span>{contract.carData?.year || 'N/A'}</span>
                      </div>
                      <div className="detail-group">
                        <label>Color:</label>
                        <span>{contract.carData?.color || 'N/A'}</span>
                      </div>
                      <div className="detail-group">
                        <label>Seats:</label>
                        <span>{contract.carData?.seats || 'N/A'} seats</span>
                      </div>
                      <div className="detail-group">
                        <label>Fuel Type:</label>
                        <span>{contract.carData?.fuelType || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  {/* Applicant Information sau */}
                  <div className="detail-section">
                    <h4>📋 Applicant Information</h4>
                    <div className="detail-grid">
                      <div className="detail-group">
                        <label>Full Name:</label>
                        <span>{contract.name || 'N/A'}</span>
                      </div>
                      <div className="detail-group">
                        <label>Phone:</label>
                        <span>{contract.phone || 'N/A'}</span>
                      </div>
                      <div className="detail-group">
                        <label>Email:</label>
                        <span>{contract.email || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  {/* CCCD Images */}
                  <div className="detail-section">
                    <h4>🆔 Citizen ID</h4>
                    <div className="cccd-images">
                      {contract.cccdImages && contract.cccdImages.length > 0 ? (
                        <div className="image-grid">
                          {contract.cccdImages.map((image, index) => (
                            <div key={index} className="image-item">
                              <img 
                                src={image} 
                                alt={`CCCD ${index + 1}`}
                                style={{ cursor: 'zoom-in' }}
                                onClick={() => setZoomImg(image)}
                              />
                              <p>CCCD {index + 1}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="no-images">No ID card images</p>
                      )}
                    </div>
                  </div>
                  {/* Car Images */}
                  <div className="detail-section">
                    <h4>📸 Car Images</h4>
                    <div className="car-images">
                      {contract.carData?.images && contract.carData.images.length > 0 ? (
                        <div className="image-grid">
                          {contract.carData.images.map((image, index) => (
                            <div key={index} className="image-item">
                              <img 
                                src={image} 
                                alt={`Ảnh xe ${index + 1}`}
                                onClick={() => setZoomImg(image)}
                                style={{ cursor: 'zoom-in' }}
                              />
                              <p>Ảnh xe {index + 1}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="no-images">No car images</p>
                      )}
                    </div>
                  </div>
                  {/* Cavet Images */}
                  <div className="detail-section">
                    <h4>📋 Cavet Images</h4>
                    <div className="cavet-images">
                      {contract.carData?.cavetImages && contract.carData.cavetImages.length > 0 ? (
                        <div className="image-grid">
                          {contract.carData.cavetImages.map((image, index) => (
                            <div key={index} className="image-item">
                              <img 
                                src={image} 
                                alt={`Cavet xe ${index + 1}`}
                                onClick={() => setZoomImg(image)}
                                style={{ cursor: 'zoom-in' }}
                              />
                              <p>Cavet xe {index + 1}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="no-images">No cavet images</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {/* Chỉ giữ lại nút Cancel contract nếu cần, bỏ nút View Details ở contract-actions */}
              <div className="contract-actions">
                {contract.status === 'PENDING_LEASE' && (
                  <button className="btn-danger" onClick={async () => {
                    try {
                      await axios.put(`${API_URL}/admin/partners/${contract.id}/status`, { status: 'CANCELLED_LEASE' });
                      fetchUserContracts();
                    } catch (e) {
                      alert('Failed to cancel contract!');
                    }
                  }}>
                    <i className="bi bi-x-circle"></i>
                    Cancel contract
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {zoomImg && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
          onClick={() => setZoomImg(null)}
        >
          <img
            src={zoomImg}
            alt="Zoom"
            style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 8, boxShadow: '0 2px 16px #0008' }}
            onClick={e => e.stopPropagation()}
          />
          <button
            style={{ position: 'fixed', top: 30, right: 40, fontSize: 32, color: '#fff', background: 'none', border: 'none', cursor: 'pointer', zIndex: 10000 }}
            onClick={() => setZoomImg(null)}
            aria-label="Close"
          >×</button>
        </div>
      )}
    </div>
  );
};

export default ContractsPage; 