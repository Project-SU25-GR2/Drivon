import React, { useState, useEffect, useRef } from 'react';
import { Modal, Form, Input, Button, message, List, Radio } from 'antd';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import './RentalForm.css';
import { API_URL } from '../../api/configApi';
import ContractModal from '../contract/ContractModal';

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
  
  // State cho contract modal
  const [showContractModal, setShowContractModal] = useState(false);
  const [contractData, setContractData] = useState(null);

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
    if (searchParams.get('status') === 'CANCELLED' && searchParams.get('orderCode')) {
      axios.post(`${API_URL}/payments/cancel`, { orderCode: searchParams.get('orderCode') })
        .then(() => {
          message.info('Order has been cancelled.');
        })
        .catch(() => {
          message.error('Unable to cancel order.');
        })
        .finally(() => {
          navigate(location.pathname, { replace: true });
        });
      return;
    }
    if (searchParams.get('cancel') === 'true') {
      message.info('Payment was cancelled');
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  useEffect(() => {
    if (visible && user) {
      // Chỉ set giá trị mặc định khi form mở lần đầu hoặc user thay đổi
      if (!form.getFieldValue('phone') && !form.getFieldValue('address')) {
        form.setFieldsValue({
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          address: user.address,
        });
      }
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
      message.info('Coupon removed');
    } else {
      setSelectedCoupon(coupon);
      message.success(`Applied coupon: ${coupon.code}`);
    }
    setShowCouponModal(false);
  };

  const handleSubmit = async (values) => {
    setLoading(true);

    if (!car || !contract || !contract.pricePerDay || !dateRange[0].startDate || !dateRange[0].endDate || isNaN(amount) || amount <= 0) {
      message.error('Car information, contract, rental dates or amount is invalid. Please try again.');
      setLoading(false);
      return;
    }

    // Chuẩn bị dữ liệu cho contract
    const contractData = {
      renterInfo: values,
      pickupLocation: values.pickupLocation,
      dropoffLocation: values.dropoffLocation,
      additionalRequirements: values.requirements,
      paymentMethod: paymentMethod,
      promotionCode: selectedCoupon ? selectedCoupon.code : null,
      discountPercent: selectedCoupon ? selectedCoupon.discount_percent : null
    };

    setContractData(contractData);
    setShowContractModal(true);
    setLoading(false);
  };

  const handleContractContinue = async () => {
    setLoading(true);
    setShowContractModal(false);

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
      pickupLocation: contractData.pickupLocation,
      dropoffLocation: contractData.dropoffLocation,
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
          additionalRequirements: contractData.additionalRequirements,
          rentalStartDate: startDate.toISOString(),
          rentalEndDate: endDate.toISOString(),
          promotionCode: contractData.promotionCode,
          discountPercent: contractData.discountPercent
        };
        
        await axios.post(`${API_URL}/payments/cash`, cashPaymentData);
        
        const rentalData = {
          orderCode: cashPaymentData.orderCode,
          carLicensePlate: car.licensePlate,
          rentalStartDate: startDate.toISOString(),
          rentalEndDate: endDate.toISOString(),
          amount: amount,
          promotionCode: contractData.promotionCode,
          discountPercent: contractData.discountPercent || 0,
          additionalRequirements: contractData.additionalRequirements,
        };
        
        onClose();
        navigate('/rental-success', { state: { rentalData } });

      } else { // Bank transfer
        const bankPaymentRequest = {
          orderCode: Date.now(),
          amount: amount,
          description: `Car rental ${car.licensePlate}`,
          returnUrl: `${window.location.origin}/payment-success`,
          cancelUrl: `${window.location.origin}/rent-car?cancel=true`,
          userId: user.userId,
          carId: car.licensePlate,
          bookingId: newBooking.id,
          additionalRequirements: contractData.additionalRequirements,
          rentalStartDate: startDate.toISOString(),
          rentalEndDate: endDate.toISOString(),
          promotionCode: contractData.promotionCode,
          discountPercent: contractData.discountPercent || 0,
        };

        const paymentResponse = await axios.post(`${API_URL}/payments/create`, bankPaymentRequest);
        if (paymentResponse.data.data && paymentResponse.data.data.checkoutUrl) {
          window.location.href = paymentResponse.data.data.checkoutUrl;
        } else {
          message.error('Unable to redirect to payment page. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error occurred:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'An error occurred. Please try again.';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        title="Confirm Car Rental"
        open={visible}
        onCancel={onClose}
        footer={[
          <Button key="back" onClick={onClose}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" loading={loading} onClick={() => form.submit()}>
            Confirm and Pay
          </Button>,
        ]}
        width={800}
        className="rental-form-modal"
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <div className="form-sections-container">
            <div className="form-section">
              <h3>Renter Information</h3>
              <Form.Item label="Full Name" name="fullName" rules={[{ required: true, message: 'Please enter full name' }]}>
                <Input />
              </Form.Item>
              <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Please enter email' }]}>
                <Input />
              </Form.Item>
              <Form.Item label="Phone Number" name="phone" rules={[{ required: true, message: 'Please enter phone number' }]}>
                <Input />
              </Form.Item>
              <Form.Item label="Address" name="address">
                <Input />
              </Form.Item>
              <Form.Item label="Pickup Location" name="pickupLocation" rules={[{ required: true, message: 'Please enter pickup location!' }]}>
                <Input />
              </Form.Item>
              <Form.Item label="Drop-off Location" name="dropoffLocation" rules={[{ required: true, message: 'Please enter drop-off location!' }]}>
                <Input />
              </Form.Item>
              <Form.Item name="requirements" label="Additional Requirements">
                <Input.TextArea rows={2} placeholder="Enter your additional requirements (if any)" />
              </Form.Item>
            </div>

            <div className="form-section">
              <h3>Rental Details</h3>
              <div className="date-range-container">
                <label>Rental and Return Dates</label>
                <div className="date-range-display" onClick={() => setShowCalendar(!showCalendar)}>
                  <i className="bi bi-calendar-range"></i>
                  <span>
                    {dateRange[0].startDate.toLocaleDateString('en-US')} - {dateRange[0].endDate.toLocaleDateString('en-US')}
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
                <label>Promotion Code</label>
                <Button onClick={() => setShowCouponModal(true)}>Select or Enter Code</Button>
                {selectedCoupon && <p className="coupon-info">Selected: {selectedCoupon.code} (-{selectedCoupon.discount_percent}%)</p>}
              </div>

              <div className="total-amount-section">
                <h3>Total Amount</h3>
                <p>{amount.toLocaleString('en-US')} VND</p>
                {contract && contract.deposit > 0 && <p className="deposit-info">(Including {contract.deposit.toLocaleString('en-US')} VND deposit)</p>}
              </div>

              <h3>Payment Method</h3>
              <Form.Item name="paymentMethod" initialValue="bank">
                <Radio.Group onChange={(e) => setPaymentMethod(e.target.value)}>
                  <Radio value="bank">Bank Transfer</Radio>
                  <Radio value="cash">Cash Payment</Radio>
                </Radio.Group>
              </Form.Item>
            </div>
          </div>
        </Form>
      </Modal>

      <Modal
        title="Select Promotion Code"
        open={showCouponModal}
        onCancel={() => setShowCouponModal(false)}
        footer={null}
      >
        <List
          dataSource={couponList}
          renderItem={item => (
            <List.Item
              actions={[<Button onClick={() => handleApplyCoupon(item)}>{selectedCoupon && selectedCoupon.code === item.code ? 'Remove' : 'Apply'}</Button>]}
            >
              <List.Item.Meta
                title={item.code}
                description={`${item.discount_percent}% off - Expires: ${new Date(item.expiry_date).toLocaleDateString('en-US')}`}
              />
            </List.Item>
          )}
        />
      </Modal>

      <ContractModal
        visible={showContractModal}
        onClose={() => setShowContractModal(false)}
        onContinue={handleContractContinue}
        contractData={contractData}
        user={user}
        car={car}
        dateRange={dateRange}
        amount={amount}
      />
    </>
  );
};

export default RentalForm; 