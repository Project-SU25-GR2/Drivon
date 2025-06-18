import React, { useState, useEffect, useRef } from 'react';
import { Modal, Form, Input, Button, message, List, Radio } from 'antd';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import './RentalForm.css';

const RentalForm = ({ visible, onClose, car, user, dateRange: initialDateRange, onSuccess, contract }) => {
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
  const [amount, setAmount] = useState(0);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [couponList, setCouponList] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('bank'); // 'bank' or 'cash'

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
    if (contract && contract.pricePerDay && dateRange[0].startDate && dateRange[0].endDate) {
      const startDate = new Date(dateRange[0].startDate);
      const endDate = new Date(dateRange[0].endDate);
      const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
      let calculatedAmount = contract.pricePerDay * daysDiff;

      // Apply coupon discount if selected
      if (selectedCoupon) {
        const discount = (calculatedAmount * selectedCoupon.discount_percent) / 100;
        calculatedAmount = calculatedAmount - discount;
      }
      
      // Add deposit to total amount, assuming contract has a deposit property
      calculatedAmount = calculatedAmount + (contract.deposit || 0);
      
      setAmount(Math.round(calculatedAmount));
    }
  }, [contract, dateRange, selectedCoupon]);

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

  useEffect(() => {
    if (showCouponModal) {
      axios.get('http://localhost:8080/api/promotions')
        .then(res => setCouponList(res.data))
        .catch(() => setCouponList([]));
    }
  }, [showCouponModal]);

  const handleApplyCoupon = (coupon) => {
    if (selectedCoupon && selectedCoupon.code === coupon.code) {
      setSelectedCoupon(null);
      message.info('Đã bỏ áp dụng mã khuyến mãi');
    } else {
      setSelectedCoupon(coupon);
      message.success(`Đã áp dụng mã: ${coupon.code}`);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      console.log('Form submitted with values:', values);
      console.log('Payment method:', paymentMethod);

      // Validate car data
      if (!car || !contract || !contract.pricePerDay) {
        message.error('Thông tin xe hoặc hợp đồng không hợp lệ. Vui lòng thử lại.');
        return;
      }

      // Validate dates
      if (!dateRange[0].startDate || !dateRange[0].endDate) {
        message.error('Vui lòng chọn ngày bắt đầu và kết thúc.');
        return;
      }

      // Validate amount
      if (isNaN(amount) || amount <= 0) {
        message.error('Số tiền thanh toán không hợp lệ. Vui lòng kiểm tra lại thông tin xe và ngày thuê.');
        return;
      }

      if (paymentMethod === 'cash') {
        console.log('Processing cash payment');
        try {
          const orderCode = Date.now().toString();
          const paymentData = {
            orderCode: orderCode,
            amount: amount,
            userId: parseInt(user.userId),
            carId: car.licensePlate,
            additionalRequirements: values.requirements,
            rentalStartDate: new Date(dateRange[0].startDate).toISOString(),
            rentalEndDate: new Date(dateRange[0].endDate).toISOString()
          };

          console.log('Sending payment data:', paymentData);

          // Call API to create cash payment
          const response = await axios.post('http://localhost:8080/api/payments/cash', paymentData, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
          console.log('Cash payment response:', response.data);

          if (response.data.error) {
            message.error(response.data.error);
            return;
          }

          // Prepare data to pass to RentalSuccess page
          const rentalData = {
            orderCode: paymentData.orderCode,
            carLicensePlate: car.licensePlate,
            rentalStartDate: dateRange[0].startDate.toISOString(),
            rentalEndDate: dateRange[0].endDate.toISOString(),
            amount: amount,
            promotionCode: selectedCoupon ? selectedCoupon.code : null,
            discountPercent: selectedCoupon ? selectedCoupon.discount_percent : 0,
            additionalRequirements: values.requirements,
          };
          
          // Close the current modal and navigate to success page
          onClose();
          navigate('/rental-success', { state: { rentalData } });
        } catch (error) {
          console.error('Error creating cash payment:', error);
          if (error.response) {
            console.error('Error response data:', error.response.data);
            console.error('Error response status:', error.response.status);
            message.error(error.response.data.error || 'Có lỗi xảy ra khi tạo thanh toán. Vui lòng thử lại.');
          } else {
            message.error('Có lỗi xảy ra khi tạo thanh toán. Vui lòng thử lại.');
          }
        } finally {
          setLoading(false);
        }
        return;
      }

      // Handle bank transfer payment (existing code)
      const paymentRequest = {
        orderCode: Date.now(),
        amount: amount,
        description: `Thuê xe ${car.licensePlate}`,
        returnUrl: "http://localhost:3000/payment-success",
        cancelUrl: `http://localhost:3000/rent-car/`,
        userId: user.userId,
        carId: car.licensePlate,
        additionalRequirements: values.requirements,
        rentalStartDate: dateRange[0].startDate.toISOString(),
        rentalEndDate: dateRange[0].endDate.toISOString(),
        promotionCode: selectedCoupon ? selectedCoupon.code : null,
        discountPercent: selectedCoupon ? selectedCoupon.discount_percent : 0,
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
      }

    } catch (error) {
      console.error('Error in handleSubmit:', error);
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
        </div>

        <div className="form-section">
          <h3>Phương thức thanh toán</h3>
          <Form.Item name="paymentMethod" initialValue="bank">
            <Radio.Group 
              onChange={(e) => {
                console.log('Payment method changed to:', e.target.value);
                setPaymentMethod(e.target.value);
              }}
            >
              <Radio value="bank">Chuyển khoản</Radio>
              <Radio value="cash">Tiền mặt</Radio>
            </Radio.Group>
          </Form.Item>
        </div>

        <div className="form-section">
          <h3>Ngày thuê và trả</h3>
          <div className="date-range-container">
            <div className="date-range-display" onClick={() => setShowCalendar(!showCalendar)}>
              <i className="bi bi-calendar-range"></i><span>
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

          <div className="form-item-row" style={{ marginBottom: '16px' }}>
            <Button className="btn-discount" onClick={() => setShowCouponModal(true)}>
              <i className="bi bi-ticket-perforated-fill"></i>
              <span>{selectedCoupon ? `Mã giảm giá: ${selectedCoupon.code}` : 'Mã giảm giá'}</span>
            </Button>
          </div>

          <div className="form-item-row" style={{ marginBottom: '24px' }}>
            <p style={{ margin: '0', fontWeight: 'bold' }}>
              Tổng tiền: {amount.toLocaleString()} VNĐ
              {contract && contract.deposit && (
                <span style={{ marginLeft: '8px', fontSize: '0.8em', color: '#666' }}>
                  (+{contract.deposit.toLocaleString()} VNĐ tiền cọc)
                </span>
              )}
              {selectedCoupon && (
                <span style={{ color: '#52c41a', marginLeft: '8px', fontSize: '0.8em' }}>
                  (Đã giảm {selectedCoupon.discount_percent}%) 
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="form-actions">
          <Button onClick={onClose} className="cancel-button">
            Hủy
          </Button>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading} 
            className="submit-button"
            onClick={() => console.log('Submit button clicked')}
          >
            {paymentMethod === 'cash' ? 'Đặt xe' : 'Thanh toán'}
          </Button>
        </div>
      </Form>

      <Modal
        title="Chọn mã khuyến mãi"
        open={showCouponModal}
        onCancel={() => setShowCouponModal(false)}
        footer={null}
      >
        <List
          dataSource={couponList}
          renderItem={coupon => (
            <List.Item
              actions={[
                <Button
                  type={selectedCoupon && selectedCoupon.code === coupon.code ? 'danger' : 'primary'}
                  onClick={() => handleApplyCoupon(coupon)}
                >
                  {selectedCoupon && selectedCoupon.code === coupon.code ? 'Bỏ áp dụng' : 'Áp dụng'}
                </Button>
              ]}
            >
              <List.Item.Meta
                title={coupon.code}
                description={coupon.description + ` (Giảm giá: ${coupon.discount_percent}%)`}
              />
            </List.Item>
          )}
        />
      </Modal>
    </Modal>
  );
};

export default RentalForm; 