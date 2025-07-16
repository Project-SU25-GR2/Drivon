import React, { useState, useEffect } from 'react';
import { Result, Button, Card, Descriptions, Spin, message } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../api/configApi';
const MAX_RETRIES = 5;
const RETRY_DELAY = 1000; // 1 giây

const RentalSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [rentalData, setRentalData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let data = null;
    if (location.state && location.state.rentalData) {
      data = location.state.rentalData;
      setRentalData(data);
      setLoading(false);
    } else {
      // Nếu không có state, lấy từ query params
      const searchParams = new URLSearchParams(location.search);
      const orderCode = searchParams.get('orderCode');
      if (orderCode) {
        // Fetch chi tiết payment từ backend
        axios.get(`${API_URL}/payments/order/${orderCode}`)
          .then(res => {
            setRentalData(res.data);
          })
          .catch(() => {
            setRentalData(null);
          })
          .finally(() => setLoading(false));
      } else {
        setRentalData(null);
        setLoading(false);
      }
    }
  }, [location]);

  // Hàm xác nhận đơn hàng
  const handleConfirmOrder = async () => {
    if (!rentalData) return;
    setConfirming(true);
    try {
      const payload = {
        orderCode: rentalData.orderCode,
        amount: rentalData.amount,
        userId: rentalData.userId,
        carId: rentalData.carLicensePlate || rentalData.carId,
        paymentMethod: rentalData.paymentMethod || 'bank',
        additionalRequirements: rentalData.additionalRequirements,
        rentalStartDate: rentalData.rentalStartDate,
        rentalEndDate: rentalData.rentalEndDate,
        promotionCode: rentalData.promotionCode,
        discountPercent: rentalData.discountPercent,
        bookingId: rentalData.bookingId,
      };
      const res = await axios.post(`${API_URL}/payments/confirm`, payload);
      if (res.data && res.data.success) {
        setConfirmed(true);
        message.success('Xác nhận đơn hàng thành công!');
        setTimeout(() => {
          navigate('/my-rentals');
        }, 1000);
      } else {
        message.error('Không thể xác nhận đơn hàng.');
      }
    } catch (err) {
      message.error('Lỗi xác nhận đơn hàng: ' + (err.response?.data?.error || err.message));
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Spin size="large" tip="Đang tải thông tin đơn hàng..."></Spin>
      </div>
    );
  }

  if (!rentalData || !rentalData.orderCode) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Spin size="large" tip="Không tìm thấy thông tin đơn hàng..."></Spin>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: 'auto' }}>
      <Result
        status="success"
        title="Đặt xe thành công!"
        subTitle={rentalData.paymentMethod === 'cash' ? "Cảm ơn bạn đã đặt xe. Vui lòng thanh toán tiền mặt khi nhận xe." : "Cảm ơn bạn đã đặt xe. Giao dịch chuyển khoản đã thành công."}
        extra={[
          !confirmed && (
            <Button type="primary" key="confirm" loading={confirming} onClick={handleConfirmOrder}>
              Xác nhận đơn hàng
            </Button>
          ),
          <Button key="console" onClick={() => navigate('/')}>Về trang chủ</Button>,
          <Button key="buy" onClick={() => navigate('/my-rentals')}>Xem đơn đặt xe của tôi</Button>,
        ].filter(Boolean)}
      />
      <Card style={{ marginTop: 24 }}>
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Mã đơn">{rentalData.orderCode || rentalData.paymentId || 'Không xác định'}</Descriptions.Item>
          <Descriptions.Item label="Xe">{rentalData.carLicensePlate || rentalData.carId || 'Không xác định'}</Descriptions.Item>
          <Descriptions.Item label="Ngày bắt đầu">{rentalData.rentalStartDate ? new Date(rentalData.rentalStartDate).toLocaleDateString() : 'Không xác định'}</Descriptions.Item>
          <Descriptions.Item label="Ngày kết thúc">{rentalData.rentalEndDate ? new Date(rentalData.rentalEndDate).toLocaleDateString() : 'Không xác định'}</Descriptions.Item>
          <Descriptions.Item label="Tổng tiền">{rentalData.amount ? Number(rentalData.amount).toLocaleString() + ' VNĐ' : 'Không xác định'}</Descriptions.Item>
          {rentalData.promotionCode && (
            <Descriptions.Item label="Mã giảm giá">{rentalData.promotionCode} {rentalData.discountPercent ? `(Giảm ${rentalData.discountPercent}%)` : ''}</Descriptions.Item>
          )}
          <Descriptions.Item label="Yêu cầu thêm">{rentalData.additionalRequirements || 'Không có'}</Descriptions.Item>
          <Descriptions.Item label="Phương thức thanh toán">{rentalData.paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}</Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default RentalSuccess; 