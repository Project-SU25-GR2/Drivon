import React, { useEffect, useState } from 'react';
import { Result, Button, Card, Descriptions, Spin } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';

const RentalSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [rentalData, setRentalData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (location.state && location.state.rentalData) {
      setRentalData(location.state.rentalData);
      setLoading(false);
    } else {
      // Redirect to home or a safe page if no data is passed
      navigate('/', { replace: true });
    }
  }, [location, navigate]);

  if (loading) {
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
        subTitle="Cảm ơn bạn đã đặt xe. Vui lòng thanh toán tiền mặt khi nhận xe."
        extra={[
          <Button type="primary" key="console" onClick={() => navigate('/')}>
            Về trang chủ
          </Button>,
          <Button key="buy" onClick={() => navigate('/my-rentals')}>Xem đơn đặt xe của tôi</Button>,
        ]}
      />
      <Card title="Chi tiết đơn đặt xe" style={{ marginTop: '24px' }}>
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Mã đơn">{rentalData.orderCode}</Descriptions.Item>
          <Descriptions.Item label="Xe">{rentalData.carLicensePlate}</Descriptions.Item>
          <Descriptions.Item label="Ngày bắt đầu">{new Date(rentalData.rentalStartDate).toLocaleDateString()}</Descriptions.Item>
          <Descriptions.Item label="Ngày kết thúc">{new Date(rentalData.rentalEndDate).toLocaleDateString()}</Descriptions.Item>
          <Descriptions.Item label="Tổng tiền">{rentalData.amount.toLocaleString()} VNĐ</Descriptions.Item>
          {rentalData.promotionCode && (
            <Descriptions.Item label="Mã giảm giá">{rentalData.promotionCode} (Giảm {rentalData.discountPercent}%)</Descriptions.Item>
          )}
          <Descriptions.Item label="Yêu cầu thêm">{rentalData.additionalRequirements || 'Không có'}</Descriptions.Item>
          <Descriptions.Item label="Phương thức thanh toán">Tiền mặt</Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default RentalSuccess; 