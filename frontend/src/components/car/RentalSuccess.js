import React, { useState, useEffect } from 'react';
import { Result, Button, Card, Descriptions, Spin } from 'antd';
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
  const handleConfirmOrder = async (redirectTo = null) => {
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
        setTimeout(() => {
          if (redirectTo) {
            navigate(redirectTo);
          } else {
            navigate('/my-rentals');
          }
        }, 1000);
      }
    } catch (err) {
      console.error('Order confirmation error:', err);
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Spin size="large" tip="Loading order information..."></Spin>
      </div>
    );
  }

  if (!rentalData || !rentalData.orderCode) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Spin size="large" tip="Order information not found..."></Spin>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: 'auto' }}>
      <Result
        status="success"
        title="Car Booking Successful!"
        subTitle={rentalData.paymentMethod === 'cash' ? "Thank you for booking. Please pay cash when receiving the car." : "Thank you for booking. Bank transfer transaction was successful."}
        extra={[
          // <Button
          //   type="primary"
          //   key="confirm"
          //   loading={confirming}
          //   onClick={() => handleConfirmOrder()}>
          //   Confirm Order
          // </Button>,
          <Button
            key="console"
            loading={confirming}
            onClick={() => handleConfirmOrder('/')}>
            Go to Homepage
          </Button>,
          <Button
            key="buy"
            loading={confirming}
            onClick={() => handleConfirmOrder('/my-rentals')}>
            View My Bookings
          </Button>
        ]}
      />
      <Card style={{ marginTop: 24 }}>
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Order Code">{rentalData.orderCode || rentalData.paymentId || 'Not specified'}</Descriptions.Item>
          <Descriptions.Item label="Car">{rentalData.carLicensePlate || rentalData.carId || 'Not specified'}</Descriptions.Item>
          <Descriptions.Item label="Start Date">{rentalData.rentalStartDate ? new Date(rentalData.rentalStartDate).toLocaleDateString('en-US') : 'Not specified'}</Descriptions.Item>
          <Descriptions.Item label="End Date">{rentalData.rentalEndDate ? new Date(rentalData.rentalEndDate).toLocaleDateString('en-US') : 'Not specified'}</Descriptions.Item>
          <Descriptions.Item label="Total Amount">{rentalData.amount ? Number(rentalData.amount).toLocaleString() + ' VND' : 'Not specified'}</Descriptions.Item>
          {rentalData.promotionCode && (
            <Descriptions.Item label="Discount Code">{rentalData.promotionCode} {rentalData.discountPercent ? `(${rentalData.discountPercent}% off)` : ''}</Descriptions.Item>
          )}
          <Descriptions.Item label="Additional Requirements">{rentalData.additionalRequirements || 'None'}</Descriptions.Item>
          <Descriptions.Item label="Payment Method">{rentalData.paymentMethod === 'cash' ? 'Cash' : 'Bank Transfer'}</Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default RentalSuccess; 