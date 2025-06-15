import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, DatePicker, Button, message } from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';
import './RentalForm.css';

const RentalForm = ({ visible, onClose, car, user, dateRange, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && user) {
      // Pre-fill form with user information
      form.setFieldsValue({
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        startDate: dayjs(dateRange[0].startDate),
        endDate: dayjs(dateRange[0].endDate),
      });
    }
  }, [visible, user, form, dateRange]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const rentalData = {
        userId: user.userId,
        carId: car.licensePlate,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        address: values.address,
        requirements: values.requirements,
        totalPrice: car.pricePerDay * values.endDate.diff(values.startDate, 'day'),
      };

      const response = await axios.post('http://localhost:8080/api/rentals', rentalData);
      
      if (response.data) {
        message.success('Đặt xe thành công!');
        onSuccess(response.data);
        onClose();
      }
    } catch (error) {
      console.error('Error creating rental:', error);
      message.error('Có lỗi xảy ra khi đặt xe. Vui lòng thử lại.');
    } finally {
      setLoading(false);
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
          <Form.Item
            name="startDate"
            label="Ngày bắt đầu"
            rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
          >
            <DatePicker 
              style={{ width: '100%' }}
              disabledDate={current => current && current < dayjs().startOf('day')}
            />
          </Form.Item>

          <Form.Item
            name="endDate"
            label="Ngày kết thúc"
            rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc' }]}
          >
            <DatePicker 
              style={{ width: '100%' }}
              disabledDate={current => {
                const startDate = form.getFieldValue('startDate');
                return current && startDate && current < startDate;
              }}
            />
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
            Thanh toán
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default RentalForm; 