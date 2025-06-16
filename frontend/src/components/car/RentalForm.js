import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import './RentalForm.css';

const RentalForm = ({ visible, onClose, car, user, dateRange, onSuccess, totalAmount }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check for payment cancellation
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('cancel') === 'true') {
      message.info('Thanh toán đã bị hủy');
      // Clear the URL parameters
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  useEffect(() => {
    if (visible && user) {
      // Pre-fill form with user information
      form.setFieldsValue({
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        address: user.address,
      });
    }
  }, [visible, user, form]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      // Validate car data
      if (!car || !car.pricePerDay) {
        message.error('Thông tin xe không hợp lệ. Vui lòng thử lại.');
        return;
      }

      // Create payment request
      const paymentRequest = {
        orderCode: Date.now(),
        amount: totalAmount,
        description: `Thuê xe ${car.licensePlate}`,
        returnUrl: "http://localhost:3000/payment-success",
        cancelUrl: `http://localhost:3000/rent-car/`,
        userId: user.userId
      };

      console.log("Payment request data:", paymentRequest);

      try {
        const response = await axios.post('http://localhost:8080/api/payments/create', paymentRequest, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        console.log("Payment response:", response.data);
        
        if (response.data.error) {
          message.error(response.data.error);
          return;
        }

        // Redirect to PayOS payment page
        if (response.data.data && response.data.data.checkoutUrl) {
          console.log("Redirecting to PayOS payment page:", response.data.data.checkoutUrl);
          window.location.href = response.data.data.checkoutUrl;
        } else {
          console.error("No checkout URL in response:", response.data);
          message.error('Không thể chuyển hướng đến trang thanh toán. Vui lòng thử lại.');
        }

      } catch (error) {
        console.error('Error creating payment:', error);
        if (error.response) {
          console.error('Error response data:', error.response.data);
          console.error('Error response status:', error.response.status);
          console.error('Error response headers:', error.response.headers);
          message.error(error.response.data.error || 'Có lỗi xảy ra khi tạo thanh toán. Vui lòng thử lại.');
        } else if (error.request) {
          console.error('Error request:', error.request);
          message.error('Không thể kết nối đến server. Vui lòng thử lại sau.');
        } else {
          console.error('Error message:', error.message);
          message.error('Có lỗi xảy ra khi tạo thanh toán. Vui lòng thử lại.');
        }
      } finally {
        setLoading(false);
      }

    } catch (error) {
      console.error('Error creating rental:', error);
      message.error('Có lỗi xảy ra khi đặt xe. Vui lòng thử lại.');
    }
  };

  return (
    <Modal
      title="Đặt xe"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      className="rental-form-modal"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="rental-form"
      >
        <div className="form-section">
          <h3>Thông tin cá nhân</h3>
          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' }
            ]}
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại' },
              { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="address"
            label="Địa chỉ"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="requirements"
            label="Yêu cầu thêm"
          >
            <Input.TextArea rows={4} placeholder="Nhập các yêu cầu thêm của bạn (nếu có)" />
          </Form.Item>
        </div>

        <div className="form-actions">
          <Button onClick={onClose} className="cancel-button">
            Hủy
          </Button>
          <Button type="primary" htmlType="submit" loading={loading} className="submit-button">
            Thanh toán {totalAmount?.toLocaleString()} VNĐ
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default RentalForm; 