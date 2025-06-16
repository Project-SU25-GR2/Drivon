import React, { useState, useEffect, useRef } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';
import { useLocation, useNavigate } from 'react-router-dom';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import './RentalForm.css';

const RentalForm = ({ visible, onClose, car, user, dateRange: initialDateRange, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [showCalendar, setShowCalendar] = useState(false);
  const [dateRange, setDateRange] = useState(initialDateRange || [
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }
  ]);
  const calendarRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target) &&
        event.target.className !== 'bi bi-calendar-range'
      ) {
        setShowCalendar(false);
      }
    }
    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendar]);

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

      // Validate dates
      if (!dateRange[0].startDate || !dateRange[0].endDate) {
        message.error('Vui lòng chọn ngày bắt đầu và kết thúc.');
        return;
      }

      // Calculate total amount
      const startDate = new Date(dateRange[0].startDate);
      const endDate = new Date(dateRange[0].endDate);
      const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      const amount = Math.round(car.pricePerDay * (daysDiff + 1));
      
      console.log("Calculated amount:", amount);

      // Validate amount
      if (isNaN(amount) || amount <= 0) {
        message.error('Số tiền thanh toán không hợp lệ. Vui lòng kiểm tra lại thông tin xe và ngày thuê.');
        return;
      }

      // Create payment request
      const paymentRequest = {
        orderCode: Date.now(),
        amount: amount,
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
            <Input />
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
        </div>

        <div className="form-section">
          <h3>Thông tin thuê xe</h3>
          <div className="date-range-container">
            <div className="date-range-display" onClick={() => setShowCalendar(!showCalendar)}>
              <i className="bi bi-calendar-range"></i>
              <span>
                {dateRange[0].startDate.toLocaleDateString()} - {dateRange[0].endDate.toLocaleDateString()}
              </span>
            </div>
            {showCalendar && (
              <div ref={calendarRef} className="calendar-container">
                <DateRange
                  onChange={item => setDateRange([item.selection])}
                  moveRangeOnFirstSelection={false}
                  months={1}
                  ranges={dateRange}
                  direction="horizontal"
                  minDate={new Date()}
                />
              </div>
            )}
          </div>

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
            Thanh toán
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default RentalForm; 