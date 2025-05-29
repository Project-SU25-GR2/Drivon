import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './css/ContractViewer.css';

const ContractViewer = ({ carData }) => {
  const [contractData, setContractData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const generateContract = async () => {
      try {
        setLoading(true);
        // Gọi API để tạo hợp đồng
        const response = await axios.post('http://localhost:8080/api/contracts/generate', {
          carData: carData,
          // Thêm các thông tin khác nếu cần
        });
        setContractData(response.data);
      } catch (err) {
        console.error('Error generating contract:', err);
        setError('Có lỗi xảy ra khi tạo hợp đồng. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    if (carData) {
      generateContract();
    }
  }, [carData]);

  if (loading) {
    return (
      <div className="contract-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tạo hợp đồng...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="contract-error">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="contract-viewer">
      <div className="contract-header">
        <h2>Hợp Đồng Cho Thuê Xe</h2>
        <div className="contract-info">
          <p>Số hợp đồng: {contractData?.contractNumber}</p>
          <p>Ngày tạo: {new Date().toLocaleDateString('vi-VN')}</p>
        </div>
      </div>

      <div className="contract-content">
        <section className="contract-section">
          <h3>Thông Tin Xe</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Hãng xe:</label>
              <span>{carData.brand}</span>
            </div>
            <div className="info-item">
              <label>Model:</label>
              <span>{carData.model}</span>
            </div>
            <div className="info-item">
              <label>Năm sản xuất:</label>
              <span>{carData.year}</span>
            </div>
            <div className="info-item">
              <label>Biển số xe:</label>
              <span>{carData.licensePlate}</span>
            </div>
          </div>
        </section>

        <section className="contract-section">
          <h3>Điều Khoản Cho Thuê</h3>
          <div className="terms-content">
            <p>1. Giá cho thuê: {carData.dailyRate.toLocaleString('vi-VN')} VND/ngày</p>
            <p>2. Địa điểm giao xe: {carData.location}</p>
            <p>3. Thời gian cho thuê: Theo thỏa thuận giữa hai bên</p>
            <p>4. Điều kiện thanh toán: Thanh toán trước 50% giá trị hợp đồng</p>
          </div>
        </section>

        <section className="contract-section">
          <h3>Quyền và Nghĩa Vụ</h3>
          <div className="terms-content">
            <h4>Bên cho thuê:</h4>
            <ul>
              <li>Giao xe đúng thời gian và địa điểm đã thỏa thuận</li>
              <li>Đảm bảo xe trong tình trạng tốt, đầy đủ giấy tờ</li>
              <li>Hỗ trợ kỹ thuật trong quá trình thuê</li>
            </ul>

            <h4>Bên thuê:</h4>
            <ul>
              <li>Thanh toán đầy đủ theo thỏa thuận</li>
              <li>Sử dụng xe đúng mục đích</li>
              <li>Bảo quản xe và tài sản trên xe</li>
              <li>Bồi thường thiệt hại nếu có</li>
            </ul>
          </div>
        </section>

        <div className="contract-signatures">
          <div className="signature-section">
            <h4>Bên cho thuê</h4>
            <div className="signature-box">
              <p>Chữ ký</p>
              <div className="signature-line"></div>
            </div>
          </div>
          <div className="signature-section">
            <h4>Bên thuê</h4>
            <div className="signature-box">
              <p>Chữ ký</p>
              <div className="signature-line"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="contract-actions">
        <button className="btn btn-primary" onClick={() => window.print()}>
          <i className="bi bi-printer me-2"></i>
          In hợp đồng
        </button>
        <button className="btn btn-success">
          <i className="bi bi-check-circle me-2"></i>
          Xác nhận hợp đồng
        </button>
      </div>
    </div>
  );
};

export default ContractViewer; 