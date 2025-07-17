import React, { useState, useEffect, useRef } from 'react';
import { Modal, Form, Input, Button, message, List, Radio } from 'antd';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import './RentalForm.css';
import { API_URL } from '../../api/configApi';
const RentalForm = ({ visible, onClose, car, user, dateRange: initialDateRange, contract }) => {
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

      if (selectedCoupon) {
        const discount = (calculatedAmount * selectedCoupon.discount_percent) / 100;
        calculatedAmount = calculatedAmount - discount;
      }
      
      calculatedAmount = calculatedAmount + (contract.deposit || 0);
      
      setAmount(Math.round(calculatedAmount));
    }
  }, [contract, dateRange, selectedCoupon]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const isCancelled = searchParams.get('status') === 'CANCELLED' && searchParams.get('orderCode');
    if (isCancelled) {
      axios.post(`${API_URL}/payments/cancel`, { orderCode: searchParams.get('orderCode') })
        .then(() => {
          message.info('Đơn hàng đã được huỷ.');
        })
        .catch(() => {
          message.error('Không thể huỷ đơn hàng.');
        })
        .finally(() => {
          navigate(location.pathname, { replace: true });
        });
      return;
    }
    if (searchParams.get('cancel') === 'true') {
      message.info('Thanh toán đã bị hủy');
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  useEffect(() => {
    if (visible && user) {
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
      axios.get(`${API_URL}/promotions`)
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
    setShowCouponModal(false);
  };

  const handleSubmit = async (values) => {
    setLoading(true);

    if (!car || !contract || !contract.pricePerDay || !dateRange[0].startDate || !dateRange[0].endDate || isNaN(amount) || amount <= 0) {
      message.error('Thông tin xe, hợp đồng, ngày thuê hoặc số tiền không hợp lệ. Vui lòng thử lại.');
      setLoading(false);
      return;
    }

    // Fix timezone issue by setting time to noon local time before converting to ISO
    const startDate = new Date(dateRange[0].startDate);
    startDate.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues
    
    const endDate = new Date(dateRange[0].endDate);
    endDate.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues

    const bookingData = {
      renterId: user.userId,
      carId: car.licensePlate,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      pickupLocation: values.pickupLocation,
      dropoffLocation: values.dropoffLocation,
      totalPrice: amount,
    };

    try {
      const bookingResponse = await axios.post(`${API_URL}/bookings`, bookingData);
      const newBooking = bookingResponse.data;

      if (paymentMethod === 'cash') {
        const cashPaymentData = {
          orderCode: Date.now().toString(),
          amount: amount,
          userId: parseInt(user.userId),
          carId: car.licensePlate,
          bookingId: newBooking.id,
          additionalRequirements: values.requirements,
          rentalStartDate: startDate.toISOString(),
          rentalEndDate: endDate.toISOString(),
          promotionCode: selectedCoupon ? selectedCoupon.code : null,
          discountPercent: selectedCoupon ? selectedCoupon.discount_percent : null
        };
        
        await axios.post(`${API_URL}/payments/cash`, cashPaymentData);
        
        const rentalData = {
          orderCode: cashPaymentData.orderCode,
          carLicensePlate: car.licensePlate,
          rentalStartDate: startDate.toISOString(),
          rentalEndDate: endDate.toISOString(),
          amount: amount,
          promotionCode: selectedCoupon ? selectedCoupon.code : null,
          discountPercent: selectedCoupon ? selectedCoupon.discount_percent : 0,
          additionalRequirements: values.requirements,
        };
        
        onClose();
        navigate('/rental-success', { state: { rentalData } });

      } else { // Bank transfer
        const bankPaymentRequest = {
          orderCode: Date.now(),
          amount: amount,
          description: `Thuê xe ${car.licensePlate}`,
          returnUrl: `${window.location.origin}/payment-success`,
          cancelUrl: `${window.location.origin}/rent-car?cancel=true`,
          userId: user.userId,
          carId: car.licensePlate,
          bookingId: newBooking.id,
          additionalRequirements: values.requirements,
          rentalStartDate: startDate.toISOString(),
          rentalEndDate: endDate.toISOString(),
          promotionCode: selectedCoupon ? selectedCoupon.code : null,
          discountPercent: selectedCoupon ? selectedCoupon.discount_percent : 0,
        };

        const paymentResponse = await axios.post(`${API_URL}/payments/create`, bankPaymentRequest);
        if (paymentResponse.data.data && paymentResponse.data.data.checkoutUrl) {
          window.location.href = paymentResponse.data.data.checkoutUrl;
        } else {
          message.error('Không thể chuyển hướng đến trang thanh toán. Vui lòng thử lại.');
        }
      }
    } catch (error) {
      console.error('Lỗi xảy ra:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Có lỗi xảy ra. Vui lòng thử lại.';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        title="Xác nhận thuê xe"
        open={visible}
        onCancel={onClose}
        footer={[
          <Button key="back" onClick={onClose}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" loading={loading} onClick={() => form.submit()}>
            Xác nhận và Thanh toán
          </Button>,
        ]}
        width={800}
        className="rental-form-modal"
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <div className="form-sections-container">
            <div className="form-section">
              <h3>Thông tin người thuê</h3>
              <Form.Item label="Họ và tên" name="fullName" rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}>
                <Input />
              </Form.Item>
              <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Vui lòng nhập email' }]}>
                <Input />
              </Form.Item>
              <Form.Item label="Số điện thoại" name="phone" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
                <Input />
              </Form.Item>
              <Form.Item label="Địa chỉ" name="address">
                <Input />
              </Form.Item>
              <Form.Item label="Địa điểm nhận xe" name="pickupLocation" rules={[{ required: true, message: 'Vui lòng nhập địa điểm nhận xe!' }]}>
                <Input />
              </Form.Item>
              <Form.Item label="Địa điểm trả xe" name="dropoffLocation" rules={[{ required: true, message: 'Vui lòng nhập địa điểm trả xe!' }]}>
                <Input />
              </Form.Item>
              <Form.Item name="requirements" label="Yêu cầu bổ sung">
                <Input.TextArea rows={2} placeholder="Nhập các yêu cầu bổ sung của bạn (nếu có)" />
              </Form.Item>
            </div>

            <div className="form-section">
              <h3>Chi tiết thuê</h3>
              <div className="date-range-container">
                <label>Ngày thuê và trả</label>
                <div className="date-range-display" onClick={() => setShowCalendar(!showCalendar)}>
                  <i className="bi bi-calendar-range"></i>
                  <span>
                    {dateRange[0].startDate.toLocaleDateString('vi-VN')} - {dateRange[0].endDate.toLocaleDateString('vi-VN')}
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
              
              <div className="coupon-section">
                <label>Mã khuyến mãi</label>
                <Button onClick={() => setShowCouponModal(true)}>Chọn hoặc nhập mã</Button>
                {selectedCoupon && <p className="coupon-info">Đã chọn: {selectedCoupon.code} (-{selectedCoupon.discount_percent}%)</p>}
              </div>

              <div className="total-amount-section">
                <h3>Tổng tiền</h3>
                <p>{amount.toLocaleString('vi-VN')} VNĐ</p>
                {contract && contract.deposit > 0 && <p className="deposit-info">(Đã bao gồm {contract.deposit.toLocaleString('vi-VN')} VNĐ tiền cọc)</p>}
              </div>

              <h3>Phương thức thanh toán</h3>
              <Form.Item name="paymentMethod" initialValue="bank">
                <Radio.Group onChange={(e) => setPaymentMethod(e.target.value)}>
                  <Radio value="bank">Chuyển khoản ngân hàng</Radio>
                  <Radio value="cash">Thanh toán tiền mặt</Radio>
                </Radio.Group>
              </Form.Item>
            </div>
          </div>
        </Form>
      </Modal>

      <Modal
        title="Chọn mã khuyến mãi"
        open={showCouponModal}
        onCancel={() => setShowCouponModal(false)}
        footer={null}
      >
        <List
          dataSource={couponList}
          renderItem={item => (
            <List.Item
              actions={[<Button onClick={() => handleApplyCoupon(item)}>{selectedCoupon && selectedCoupon.code === item.code ? 'Bỏ chọn' : 'Áp dụng'}</Button>]}
            >
              <List.Item.Meta
                title={item.code}
                description={`Giảm ${item.discount_percent}% - Hết hạn: ${new Date(item.expiry_date).toLocaleDateString('vi-VN')}`}
              />
            </List.Item>
          )}
        />
      </Modal>
    </>
  );
};

export default RentalForm; 