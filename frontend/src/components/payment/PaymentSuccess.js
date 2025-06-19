import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Result, Button, Spin } from 'antd';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const savePaymentInfo = async () => {
      try {
        const searchParams = new URLSearchParams(location.search);
        const paymentId = searchParams.get('id');
        const orderCode = searchParams.get('orderCode');
        const status = searchParams.get('status');
        const code = searchParams.get('code');
        
        console.log('Payment parameters:', {
          paymentId,
          orderCode,
          status,
          code
        });

        if (!paymentId || !orderCode) {
          setError('Thông tin thanh toán không hợp lệ');
          setLoading(false);
          return;
        }

        if (status !== 'PAID' || code !== '00') {
          setError('Thanh toán chưa được xác nhận');
          setLoading(false);
          return;
        }

        // Get user info from localStorage
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
          setError('Không tìm thấy thông tin người dùng');
          setLoading(false);
          return;
        }

        // Get payment details from PayOS
        const paymentResponse = await axios.get(`http://localhost:8080/api/payments/${paymentId}`);
        
        if (!paymentResponse.data.success) {
          setError('Không thể xác thực thanh toán');
          setLoading(false);
          return;
        }

        const paymentData = paymentResponse.data.data;

        // Save payment information to database
        const saveResponse = await axios.post('http://localhost:8080/api/payments/save', {
          paymentId: paymentId,
          orderCode: orderCode,
          amount: paymentData.amount,
          status: status,
          paymentMethod: paymentData.paymentMethod,
          userId: user.userId,
          carId: paymentData.carId,
          additionalRequirements: paymentData.additionalRequirements,
          rentalStartDate: paymentData.rentalStartDate,
          rentalEndDate: paymentData.rentalEndDate
        });

        if (saveResponse.data.success) {
          setLoading(false);
        } else {
          setError(saveResponse.data.message || 'Không thể lưu thông tin thanh toán');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error saving payment:', error);
        setError(error.response?.data?.message || 'Có lỗi xảy ra khi xử lý thanh toán');
        setLoading(false);
      }
    };

    savePaymentInfo();
  }, [location]);

  if (loading) {
    return (
      <div className="payment-success-container">
        <Spin size="large" tip="Đang xử lý thanh toán..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-success-container">
        <Result
          status="error"
          title="Thanh toán không thành công"
          subTitle={error}
          extra={[
            <Button type="primary" key="home" onClick={() => navigate('/')}>
              Về trang chủ
            </Button>
          ]}
        />
      </div>
    );
  }

  return (
    <div className="payment-success-container">
      <Result
        status="success"
        title="Thanh toán thành công!"
        subTitle="Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi."
        extra={[
          <Button type="primary" key="home" onClick={() => navigate('/')}>
            Về trang chủ
          </Button>,
          <Button key="orders" onClick={() => navigate('/orders')}>
            Xem đơn hàng
          </Button>
        ]}
      />
    </div>
  );
};

export default PaymentSuccess; 