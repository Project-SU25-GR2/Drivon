import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../../api/configApi';
import './ContractsPage.css';

const ContractsPage = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedContract, setExpandedContract] = useState(null);
  
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      'PENDING': { class: 'status-pending', text: 'Chờ duyệt' },
      'PENDING_LEASE': { class: 'status-pending', text: 'Chờ duyệt' },
      'APPROVED': { class: 'status-approved', text: 'Đã duyệt' },
      'REJECTED': { class: 'status-rejected', text: 'Từ chối' },
      'ACTIVE': { class: 'status-active', text: 'Đang hoạt động' },
      'COMPLETED': { class: 'status-completed', text: 'Hoàn thành' },
      'CANCELLED': { class: 'status-cancelled', text: 'Đã hủy' }
    };

    const config = statusConfig[status] || { class: 'status-unknown', text: status };
    
    return (
      <span className={`status-badge ${config.class}`}>
        {config.text}
      </span>
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
        <h1>Hợp đồng của tôi</h1>
        <p>Quản lý tất cả hợp đồng và trạng thái của bạn</p>
      </div>

      {!contracts || contracts.length === 0 ? (
        <div className="no-contracts">
          <div className="no-contracts-content">
            <i className="bi bi-file-earmark-text"></i>
            <h3>Chưa có hợp đồng nào</h3>
            <p>Bạn chưa có hợp đồng nào trong hệ thống.</p>
            <div className="no-contracts-actions">
              <button 
                className="btn-primary"
                onClick={() => window.location.href = '/rent-your-car'}
              >
                Đăng ký trở thành Partner
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
                  <h3>Hợp đồng #{contract.contractNumber || 'N/A'}</h3>
                  <p className="contract-date">
                    Tạo ngày: {formatDate(contract.createdAt)}
                  </p>
                </div>
                <div className="contract-header-actions">
                  {getStatusBadge(contract.status)}
                  <button 
                    className="expand-btn"
                    onClick={() => toggleContractExpansion(contract.id)}
                  >
                    <i className={`bi ${expandedContract === contract.id ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                    {expandedContract === contract.id ? 'Thu gọn' : 'Xem chi tiết'}
                  </button>
                </div>
              </div>

              {/* Basic Contract Info */}
              <div className="contract-details">
                <div className="detail-row">
                  <div className="detail-group">
                    <label>Mã hợp đồng:</label>
                    <span>{contract.contractNumber || 'N/A'}</span>
                  </div>
                  <div className="detail-group">
                    <label>Trạng thái:</label>
                    {getStatusBadge(contract.status)}
                  </div>
                </div>

                <div className="detail-row">
                  <div className="detail-group">
                    <label>Ngày bắt đầu:</label>
                    <span>{formatDate(contract.startDate)}</span>
                  </div>
                  <div className="detail-group">
                    <label>Ngày kết thúc:</label>
                    <span>{formatDate(contract.endDate)}</span>
                  </div>
                </div>

                <div className="detail-row">
                  <div className="detail-group">
                    <label>Giá thuê/ngày:</label>
                    <span>{formatCurrency(contract.pricePerDay)}</span>
                  </div>
                  <div className="detail-group">
                    <label>Tiền cọc:</label>
                    <span>{formatCurrency(contract.deposit)}</span>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedContract === contract.id && (
                <div className="contract-expanded-details">
                  <div className="detail-section">
                    <h4>📋 Thông tin người đăng ký</h4>
                    <div className="detail-grid">
                      <div className="detail-group">
                        <label>Họ và tên:</label>
                        <span>{contract.name || 'N/A'}</span>
                      </div>
                      <div className="detail-group">
                        <label>Số điện thoại:</label>
                        <span>{contract.phone || 'N/A'}</span>
                      </div>
                      <div className="detail-group">
                        <label>Email:</label>
                        <span>{contract.email || 'N/A'}</span>
                      </div>
                      <div className="detail-group">
                        <label>Số CCCD:</label>
                        <span>{contract.cccd || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>🚗 Thông tin xe đăng ký</h4>
                    <div className="detail-grid">
                      <div className="detail-group">
                        <label>Biển số xe:</label>
                        <span>{contract.carId || 'N/A'}</span>
                      </div>
                      <div className="detail-group">
                        <label>Loại xe:</label>
                        <span>{contract.carData?.brand || 'N/A'} {contract.carData?.model || ''}</span>
                      </div>
                      <div className="detail-group">
                        <label>Năm sản xuất:</label>
                        <span>{contract.carData?.year || 'N/A'}</span>
                      </div>
                      <div className="detail-group">
                        <label>Màu xe:</label>
                        <span>{contract.carData?.color || 'N/A'}</span>
                      </div>
                      <div className="detail-group">
                        <label>Số chỗ ngồi:</label>
                        <span>{contract.carData?.seats || 'N/A'} chỗ</span>
                      </div>
                      <div className="detail-group">
                        <label>Nhiên liệu:</label>
                        <span>{contract.carData?.fuelType || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* CCCD Images */}
                  <div className="detail-section">
                    <h4>🆔 Ảnh CCCD</h4>
                    <div className="cccd-images">
                      {contract.cccdImages && contract.cccdImages.length > 0 ? (
                        <div className="image-grid">
                          {contract.cccdImages.map((image, index) => (
                            <div key={index} className="image-item">
                              <img 
                                src={image} 
                                alt={`CCCD ${index + 1}`}
                                onClick={() => window.open(image, '_blank')}
                              />
                              <p>CCCD {index + 1}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="no-images">Chưa có ảnh CCCD</p>
                      )}
                    </div>
                  </div>

                  {/* Car Images */}
                  <div className="detail-section">
                    <h4>📸 Ảnh xe</h4>
                    <div className="car-images">
                      {contract.carData?.images && contract.carData.images.length > 0 ? (
                        <div className="image-grid">
                          {contract.carData.images.map((image, index) => (
                            <div key={index} className="image-item">
                              <img 
                                src={image} 
                                alt={`Ảnh xe ${index + 1}`}
                                onClick={() => window.open(image, '_blank')}
                              />
                              <p>Ảnh xe {index + 1}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="no-images">Chưa có ảnh xe</p>
                      )}
                    </div>
                  </div>

                  {/* Cavet Images */}
                  <div className="detail-section">
                    <h4>📋 Cavet xe</h4>
                    <div className="cavet-images">
                      {contract.carData?.cavetImages && contract.carData.cavetImages.length > 0 ? (
                        <div className="image-grid">
                          {contract.carData.cavetImages.map((image, index) => (
                            <div key={index} className="image-item">
                              <img 
                                src={image} 
                                alt={`Cavet xe ${index + 1}`}
                                onClick={() => window.open(image, '_blank')}
                              />
                              <p>Cavet xe {index + 1}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="no-images">Chưa có cavet xe</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="contract-actions">
                <button 
                  className="btn-secondary"
                  onClick={() => toggleContractExpansion(contract.id)}
                >
                  <i className="bi bi-eye"></i>
                  {expandedContract === contract.id ? 'Thu gọn' : 'Xem chi tiết'}
                </button>
                {contract.status === 'PENDING' || contract.status === 'PENDING_LEASE' ? (
                  <button className="btn-danger">
                    <i className="bi bi-x-circle"></i>
                    Hủy hợp đồng
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContractsPage; 