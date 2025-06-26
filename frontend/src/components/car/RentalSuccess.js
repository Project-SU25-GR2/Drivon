import React, { useEffect, useState } from 'react';
import { Result, Button, Card, Descriptions, Spin } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../api/configApi';
const MAX_RETRIES = 5;
const RETRY_DELAY = 1000; // 1 giây

const RentalSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [rentalData, setRentalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backendData, setBackendData] = useState(null);

  useEffect(() => {
    let retryCount = 0;
    let timeoutId;
    let cancelled = false;

    const fetchPayment = async (orderCode) => {
      try {
        const res = await axios.get(`${API_URL}/payments/order/${orderCode}`);
        if (res.data) {
          setBackendData(res.data);
          setLoading(false);
        } else {
          throw new Error('No data');
        }
      } catch (err) {
        if (axios.isAxiosError(err) && err.response && err.response.status === 404 && retryCount < MAX_RETRIES) {
          retryCount++;
          timeoutId = setTimeout(() => fetchPayment(orderCode), RETRY_DELAY);
        } else {
          console.error('Error fetching payment by orderCode:', err);
          setLoading(false);
          navigate('/', { replace: true });
        }
      }
    };

    if (location.state && location.state.rentalData) {
      setRentalData(location.state.rentalData);
      setLoading(false);
    } else {
      const searchParams = new URLSearchParams(location.search);
      const orderCode = searchParams.get('orderCode');
      if (orderCode) {
        setLoading(true);
        fetchPayment(orderCode);
      } else {
        navigate('/', { replace: true });
      }
    }
    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [location, navigate]);

  // Kết hợp dữ liệu từ rentalData (state) và backendData (API)
  const combinedData = rentalData || backendData;

  if (loading || !combinedData) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Spin size="large" tip="Đang tải thông tin đặt xe..."></Spin>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: 'auto' }}>
      <Result
        status="success"
        title="Đặt xe thành công!"
        subTitle={combinedData.paymentMethod === 'cash' ? "Cảm ơn bạn đã đặt xe. Vui lòng thanh toán tiền mặt khi nhận xe." : "Cảm ơn bạn đã đặt xe. Giao dịch chuyển khoản đã thành công."}
        extra={[
          <Button type="primary" key="console" onClick={() => navigate('/')}>Về trang chủ</Button>,
          <Button key="buy" onClick={() => navigate('/my-rentals')}>Xem đơn đặt xe của tôi</Button>,
        ]}
      />
      <Card title="Chi tiết đơn đặt xe" style={{ marginTop: '24px' }}>
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Mã đơn">{combinedData.orderCode || combinedData.paymentId || 'Không xác định'}</Descriptions.Item>
          <Descriptions.Item label="Xe">{combinedData.carLicensePlate || combinedData.carId || 'Không xác định'}</Descriptions.Item>
          <Descriptions.Item label="Ngày bắt đầu">{combinedData.rentalStartDate ? new Date(combinedData.rentalStartDate).toLocaleDateString() : 'Không xác định'}</Descriptions.Item>
          <Descriptions.Item label="Ngày kết thúc">{combinedData.rentalEndDate ? new Date(combinedData.rentalEndDate).toLocaleDateString() : 'Không xác định'}</Descriptions.Item>
          <Descriptions.Item label="Tổng tiền">{combinedData.amount ? combinedData.amount.toLocaleString() + ' VNĐ' : 'Không xác định'}</Descriptions.Item>
          {combinedData.promotionCode && (
            <Descriptions.Item label="Mã giảm giá">{combinedData.promotionCode} {combinedData.discountPercent ? `(Giảm ${combinedData.discountPercent}%)` : ''}</Descriptions.Item>
          )}
          <Descriptions.Item label="Yêu cầu thêm">{combinedData.additionalRequirements || 'Không có'}</Descriptions.Item>
          <Descriptions.Item label="Phương thức thanh toán">{combinedData.paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}</Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default RentalSuccess; 