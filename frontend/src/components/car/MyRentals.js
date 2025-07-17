import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Spin,
  Empty,
  Tag,
  message,
  Modal,
  Descriptions,
  Divider,
  Rate,
  Input,
  Result,
  Tooltip,
} from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/MyRentals.css";
import { FrownOutlined, MehOutlined, SmileOutlined, CarOutlined, EnvironmentOutlined, CalendarOutlined, CreditCardOutlined, DeleteOutlined } from "@ant-design/icons";
import { CgArrowsExchange } from "react-icons/cg";
import { API_URL } from '../../api/configApi';
const { Title, Text } = Typography;

const MyRentals = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedRental, setSelectedRental] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigate = useNavigate();
  const [isRatingModalVisible, setIsRatingModalVisible] = useState(false);
  const [ratingRental, setRatingRental] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoverValue, setHoverValue] = useState(undefined);
  const [reviewedRentals, setReviewedRentals] = useState([]);
  const [isReviewSubmitted, setIsReviewSubmitted] = useState(false);
  const [carsInfo, setCarsInfo] = useState({});
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [rentalToDelete, setRentalToDelete] = useState(null);
  const [isSwitchModalVisible, setIsSwitchModalVisible] = useState(false);
  const [rentalToSwitch, setRentalToSwitch] = useState(null);
  const [isSwitchToBankModalVisible, setIsSwitchToBankModalVisible] = useState(false);
  const [rentalToSwitchToBank, setRentalToSwitchToBank] = useState(null);
  // State cho modal hủy đặt xe
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  const [rentalToCancel, setRentalToCancel] = useState(null);
  const [refundBankAccount, setRefundBankAccount] = useState("");
  const [refundBankName, setRefundBankName] = useState("");

  const tooltips = ["Very Bad", "Bad", "Average", "Good", "Very Good"];

  const customIcons = {
    1: <FrownOutlined />,
    2: <FrownOutlined />,
    3: <MehOutlined />,
    4: <SmileOutlined />,
    5: <SmileOutlined />,
  };

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData) {
      message.error("Please log in to view rental history");
      navigate("/login");
      return;
    }
    setUser(userData);
    fetchRentalsWithCleanup(userData.userId);
  }, [navigate]);

  const fetchRentals = async (userId) => {
    try {
      const response = await axios.get(
        `${API_URL}/payments/user/${userId}`
      );
      const payments = response.data;

      // Lấy status booking cho từng payment
      const paymentsWithBookingStatus = await Promise.all(
        payments.map(async (payment) => {
          if (!payment.bookingId) return payment;
          try {
            const bookingRes = await axios.get(`${API_URL}/bookings/${payment.bookingId}`);
            console.log('Booking API trả về cho bookingId', payment.bookingId, ':', bookingRes.data);
            return { ...payment, bookingStatus: bookingRes.data.status };
          } catch (err) {
            return { ...payment, bookingStatus: "Không xác định" };
          }
        })
      );

      // Lọc bỏ đơn CANCELLED và đơn không có thời gian thuê/trả
      const filteredRentals = paymentsWithBookingStatus.filter(rental => {
        // Ẩn đơn không có thời gian thuê hoặc thời gian trả
        const hasRentalDates = rental.rentalStartDate && rental.rentalEndDate;
        // Debug log để kiểm tra dữ liệu
        if (!hasRentalDates) {
          console.log('Filtered out rental due to missing dates:', rental);
        }
        return hasRentalDates;
      });
      
      setRentals(filteredRentals);
    } catch (error) {
      console.error("Error fetching rentals:", error);
      message.error("Unable to load rental history");
    } finally {
      setLoading(false);
    }
  };

  // Cleanup function gọi sau fetchRentals để dọn dẹp dữ liệu cũ
  const fetchRentalsWithCleanup = async (userId) => {
    await fetchRentals(userId);
    await cleanupInvalidPayments();
  };

  // Fetch car info for all rentals
  useEffect(() => {
    if (rentals.length > 0) {
      const carIds = rentals.map(r => r.carId).filter(Boolean);
      const uniqueCarIds = [...new Set(carIds)];
      uniqueCarIds.forEach(carId => {
        if (!carsInfo[carId]) {
          axios.get(`${API_URL}/cars/${carId}`)
            .then(res => {
              setCarsInfo(prev => ({ ...prev, [carId]: res.data }));
            })
            .catch(() => {});
        }
      });
    }
    // eslint-disable-next-line
  }, [rentals]);

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "PAID":
        return "success";
      case "PENDING":
        return "warning";
      case "REFUNDED":
        return "error";
      case "CANCELLED":
        return "default"; // hoặc "error" nếu muốn nổi bật
      default:
        return "default";
    }
  };

  const getBookingStatusColor = (bookingStatus) => {
    switch (bookingStatus?.toLowerCase()) {
      case "pending":
        return "default";
      case "approved":
        return "processing";
      case "cancelled":
        return "error";
      case "ongoing":
        return "warning";
      case "completed":
        return "success";
      default:
        return "default";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewDetails = (rental) => {
    setSelectedRental(rental);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedRental(null);
  };

  const handleRateCar = (rental) => {
    setRatingRental(rental);
    setIsRatingModalVisible(true);
  };

  const handleRatingModalClose = () => {
    setIsRatingModalVisible(false);
    setRatingRental(null);
    setRating(0);
    setComment("");
    setIsReviewSubmitted(false);
  };

  const handleRatingSubmit = async () => {
    if (rating === 0) {
      message.error("Please select a star rating.");
      return;
    }
    try {
      await axios.post(
        `${API_URL}/reviews/car/${ratingRental.carId}`, //rate car     
        {
          rating: rating,
          comment: comment,
        },
        {
          params: {
            bookingId: ratingRental.bookingId,
            reviewerId: user.userId,
          },
        }
      );
      message.success("Review saved successfully!");
      setIsReviewSubmitted(true);
      setReviewedRentals((prev) => [...prev, ratingRental.bookingId]);
      setTimeout(() => {
        handleRatingModalClose();
      }, 2000);
    } catch (error) {
      message.error("Failed to submit review. Please try again!");
    }
  };

  const handlePayment = (rental) => {
    const bankPaymentRequest = {
      orderCode: Date.now(),
      amount: rental.amount,
      description: `Payment: ${rental.orderCode.toString().slice(-8)}`, // Shortened and no accents
      returnUrl: `${window.location.origin}/payment-success`,
      cancelUrl: `${window.location.origin}/my-rentals?cancel=true`,
      userId: user.userId,
      carId: rental.carId,
      bookingId: rental.bookingId,
    };

    axios.post(`${API_URL}/payments/create`, bankPaymentRequest)
      .then(response => {
        if (response.data.data && response.data.data.checkoutUrl) {
          window.location.href = response.data.data.checkoutUrl;
        } else {
          message.error('Unable to redirect to payment page. Please try again.');
        }
      })
      .catch(() => {
        message.error('An error occurred while creating payment link.');
      });
  };

  const handleDeleteRental = (rental) => {
    setRentalToDelete(rental);
    setIsDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!rentalToDelete) return;
    
    try {
      console.log('User confirmed deletion, proceeding...');
      const paymentId = rentalToDelete.paymentId || rentalToDelete.id || rentalToDelete.payment_id;
      console.log('Payment ID:', paymentId);
      console.log('Booking ID:', rentalToDelete.bookingId);
      
      if (!paymentId && !rentalToDelete.bookingId) {
        message.error('Unable to find ID to delete.');
        return;
      }

      // Try booking endpoint first since we just added it
      if (rentalToDelete.bookingId) {
        console.log('Trying to delete booking:', rentalToDelete.bookingId);
        const response = await axios.delete(`${API_URL}/bookings/${rentalToDelete.bookingId}`);
        console.log('Delete booking response:', response);
        message.success('Car booking deleted successfully!');
        fetchRentalsWithCleanup(user.userId);
        handleCloseDeleteModal();
        return;
      }

      // Try payment endpoint as fallback
      if (paymentId) {
        console.log('Trying to delete payment:', paymentId);
        const response = await axios.delete(`${API_URL}/payments/${paymentId}`);
        console.log('Delete payment response:', response);
        message.success('Payment deleted successfully!');
        fetchRentalsWithCleanup(user.userId);
        handleCloseDeleteModal();
        return;
      }

    } catch (error) {
      console.error('Delete error:', error);
      console.error('Error details:', error.response?.data);
      message.error(`Unable to delete: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalVisible(false);
    setRentalToDelete(null);
  };

  const handleSwitchToBank = (rental) => {
    setRentalToSwitchToBank(rental);
    setIsSwitchToBankModalVisible(true);
  };

  const handleConfirmSwitchToBank = async () => {
    if (!rentalToSwitchToBank) return;
    
    try {
      console.log('User confirmed switch to bank');
      console.log('Updating payment method for payment:', rentalToSwitchToBank.paymentId);
      
      // Cập nhật payment cũ từ cash sang bank
      const updateRequest = {
        paymentMethod: 'bank',
        status: 'PENDING', // Bank cần thanh toán sau
        paymentId: `PAYOS_${Date.now()}` // Tạo paymentId mới cho bank
      };

      console.log('Update payment request:', updateRequest);

      const response = await axios.put(`${API_URL}/payments/update/${rentalToSwitchToBank.paymentId}`, updateRequest);
      console.log('Update payment response:', response.data);
      
      if (response.data || response.status === 200) {
        message.success('Successfully switched to bank payment! You can pay later.');
        fetchRentalsWithCleanup(user.userId);
        handleCloseSwitchToBankModal();
      } else {
        console.error('No response data received');
        message.error('Unable to change payment method.');
      }
    } catch (error) {
      console.error('Error switching to bank:', error);
      console.error('Error details:', error.response?.data);
      message.error(`Có lỗi xảy ra: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleCloseSwitchToBankModal = () => {
    setIsSwitchToBankModalVisible(false);
    setRentalToSwitchToBank(null);
  };

  const cleanupInvalidPayments = async () => {
    try {
      console.log('Starting cleanup of invalid payments...');
      const response = await axios.get(`${API_URL}/payments/user/${user.userId}`);
      const payments = response.data;
      
      // Tìm các payments không có ngày thuê/trả
      const invalidPayments = payments.filter(payment => {
        const hasInvalidDates = !payment.rentalStartDate || !payment.rentalEndDate;
        if (hasInvalidDates) {
          console.log('Found invalid payment:', payment.paymentId || payment.orderCode, payment);
        }
        return hasInvalidDates;
      });

      // Xóa từng payment invalid
      for (const payment of invalidPayments) {
        try {
          const paymentId = payment.paymentId || payment.id;
          if (paymentId) {
            console.log('Deleting invalid payment:', paymentId);
            await axios.delete(`${API_URL}/payments/${paymentId}`);
          } else if (payment.orderCode) {
            console.log('Cancelling invalid payment by orderCode:', payment.orderCode);
            await axios.post(`${API_URL}/payments/cancel`, {
              orderCode: payment.orderCode
            });
          }
        } catch (deleteError) {
          console.warn('Could not delete invalid payment:', payment, deleteError);
        }
      }

      if (invalidPayments.length > 0) {
        console.log(`Cleaned up ${invalidPayments.length} invalid payments`);
      }
    } catch (error) {
      console.warn('Error during cleanup:', error);
    }
  };

  const handleSwitchToCash = (rental) => {
    setRentalToSwitch(rental);
    setIsSwitchModalVisible(true);
  };

  const handleConfirmSwitch = async () => {
    if (!rentalToSwitch) return;
    
    try {
      console.log('User confirmed switch to cash');
      console.log('Updating payment method for payment:', rentalToSwitch.paymentId);
      
      // Cập nhật payment cũ từ bank sang cash
      const updateRequest = {
        paymentMethod: 'cash',
        status: 'SUCCESS', // Cash được coi như đã thanh toán
        paymentId: `CASH_${Date.now()}` // Tạo paymentId mới cho cash
      };

      console.log('Update payment request:', updateRequest);

      const response = await axios.put(`${API_URL}/payments/update/${rentalToSwitch.paymentId}`, updateRequest);
      console.log('Update payment response:', response.data);
      
      if (response.data || response.status === 200) {
        message.success('Successfully switched to cash payment!');
        fetchRentalsWithCleanup(user.userId);
        handleCloseSwitchModal();
      } else {
        console.error('No response data received');
        message.error('Unable to change payment method.');
      }
    } catch (error) {
      console.error('Error switching to cash:', error);
      console.error('Error details:', error.response?.data);
      message.error(`Có lỗi xảy ra: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleCloseSwitchModal = () => {
    setIsSwitchModalVisible(false);
    setRentalToSwitch(null);
  };

  const handleCancelBooking = (rental) => {
    setRentalToCancel(rental);
    setIsCancelModalVisible(true);
  };

  const handleConfirmCancelBooking = async () => {
    if (!rentalToCancel || !rentalToCancel.bookingId) {
      message.error('Unable to find booking to cancel.');
      return;
    }
    try {
      let refundCreated = false;
      // Nếu là bank và status payment là PAID thì tạo request hoàn tiền
      if (rentalToCancel.paymentMethod?.toLowerCase() === "bank" && rentalToCancel.status?.toUpperCase() === "PAID") {
        if (!refundBankAccount || !refundBankName) {
          message.error("Please enter full bank account number and bank name for refund.");
          return;
        }
        let refundAmount = rentalToCancel.amount;
        if (["ongoing"].includes(rentalToCancel.bookingStatus?.toLowerCase())) {
          refundAmount = Math.round(refundAmount * 0.95);
        }
        await axios.post(`${API_URL}/owner-withdraw`, {
          ownerId: rentalToCancel.userId,
          amount: refundAmount,
          status: "pending",
          note: `STK: ${refundBankAccount}, Ngân hàng: ${refundBankName}`,
        });
        refundCreated = true;
      }
      // Hủy booking như cũ
      await axios.put(`${API_URL}/bookings/status/${rentalToCancel.bookingId}`, { status: 'cancelled' });
      if (refundCreated) {
        message.success('Refund request created and booking cancelled successfully!');
      } else {
        message.success('Car booking cancelled successfully!');
      }
      fetchRentalsWithCleanup(user.userId);
      setIsCancelModalVisible(false);
      setRentalToCancel(null);
      setRefundBankAccount("");
      setRefundBankName("");
    } catch (error) {
      message.error('Unable to cancel booking or create refund request.');
    }
  };
  const handleCloseCancelModal = () => {
    setIsCancelModalVisible(false);
    setRentalToCancel(null);
    setRefundBankAccount("");
    setRefundBankName("");
  };

  const renderRentalCard = (rental) => {
    // A user can rate a car if the booking is completed.
    const bookingStatus = rental.bookingStatus || rental.booking_status || rental.booking_status_text;
    const canRate = bookingStatus?.toLowerCase() === "completed";
    const isPending = rental.status?.toUpperCase() === "PENDING";
    const isCash = rental.paymentMethod?.toLowerCase() === "cash";
    const isBank = rental.paymentMethod?.toLowerCase() === "bank";
    const car = carsInfo[rental.carId];
    const isCancelled = bookingStatus?.toLowerCase() === "cancelled";
    return (
      <Col xs={24} sm={24} md={12} lg={8} xl={8} key={rental.paymentId}>
        <Card className="rental-card">
          <div className="rental-card-header">
            <div className="rental-card-title">
              <span className="rental-card-icon"><CarOutlined /></span>
              <span>Car Booking Successful</span>
            </div>
            <div className="rental-card-status">
              <Tag color={getStatusColor(rental.status)}>
                {rental.status}
              </Tag>
              {bookingStatus && (
                <Tag color={getBookingStatusColor(bookingStatus)} style={{ marginLeft: 4 }}>
                  {bookingStatus}
                </Tag>
              )}
            </div>
            <div className="rental-card-order">Order: #{rental.orderCode}</div>
          </div>
          <div className="rental-card-section">
            <span className="rental-card-section-icon"><EnvironmentOutlined /></span>
            <div className="rental-card-section-content">
              {car && (
                <span className="rental-card-carinfo">{car.brand} {car.model} {car.year}</span>
              )}
              <span className="rental-card-section-label">License Plate: {rental.carId}</span>
            </div>
          </div>
          <div className="rental-card-section rental-card-time-section">
            <span className="rental-card-section-icon rental-card-time-icon"><CalendarOutlined /></span>
            <div className="rental-card-time-content">
              <div className="rental-card-section-label">Rental Period</div>
              <div className="rental-card-time-value">{formatDate(rental.rentalStartDate).replace('at ', '')}</div>
              <div className="rental-card-time-between">to</div>
              <div className="rental-card-time-value">{formatDate(rental.rentalEndDate).replace('at ', '')}</div>
            </div>
          </div>
          <div className="rental-card-section">
            <span className="rental-card-section-icon"><CreditCardOutlined /></span>
            <span className="rental-card-section-label">Payment Method</span>
            <span className="rental-card-section-value">{rental.paymentMethod}</span>
          </div>
          <div className="rental-card-special">
            <div>
              <span className="special-label">Special Requirements</span>
              <span className="special-value">{rental.additionalRequirements || "None"}</span>
            </div>
            <div>
              <span className="voucher-label">Voucher:</span>
              <span className="voucher-value">{rental.discountPercent|| "0"}%</span>
            </div>
          </div>
          <div className="rental-card-footer">
            <div className="rental-card-date">
              Booked at: {formatDate(rental.paymentDate).replace('at ', '')}
            </div>
            <div className="rental-card-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {/* Nếu là cancelled chỉ hiển thị nút info */}
              {isCancelled ? (
                <Tooltip title="Details">
                  <Button className="detail-btn" type="primary" onClick={() => handleViewDetails(rental)}>
                    <i className="bi bi-info-circle"></i>
                  </Button>
                </Tooltip>
              ) : (
                <>
                  <Tooltip title="Details">
                    <Button className="detail-btn" type="primary" onClick={() => handleViewDetails(rental)}>
                      <i className="bi bi-info-circle"></i>
                    </Button>
                  </Tooltip>
                  {/* Buttons for PENDING payments */}
                  {isPending && (
                    <>
                      <Tooltip title="Payment">
                        <Button 
                          className="payment-btn" 
                          type="primary" 
                          style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                          onClick={() => handlePayment(rental)}
                        >
                          <i className="bi bi-credit-card"></i>
                        </Button>
                      </Tooltip>
                      {/* Button for bank payments with PENDING status to switch to cash */}
                      {isBank && (
                        <Tooltip title="Switch to cash payment">
                          <Button 
                            className="switch-payment-btn"
                            style={{ backgroundColor: '#fa8c16', borderColor: '#fa8c16', color: 'white', border: 'none', boxShadow: 'none' }}
                            icon={<CgArrowsExchange />}
                            onClick={() => handleSwitchToCash(rental)}
                          />
                        </Tooltip>
                      )}
                    </>
                  )}
                  {/* Button for cash payments with pending booking to switch to bank */}
                  {isCash && bookingStatus?.toLowerCase() === "pending" && (
                    <Tooltip title="Switch to bank payment">
                      <Button 
                        className="switch-payment-btn"
                        style={{ backgroundColor: '#fa8c16', borderColor: '#fa8c16', color: 'white', border: 'none', boxShadow: 'none' }}
                        icon={<CgArrowsExchange />}
                        onClick={() => handleSwitchToBank(rental)}
                      />
                    </Tooltip>
                  )}
                  {/* Nút hủy đặt xe luôn hiển thị nếu bookingStatus là ongoing hoặc pending */}
                  {(bookingStatus?.toLowerCase() === 'ongoing' || bookingStatus?.toLowerCase() === 'pending') && (
                    <Tooltip title="Cancel booking">
                      <Button 
                        className="cancel-booking-btn" 
                        danger
                        style={{ backgroundColor: '#ff4d4f', borderColor: '#ff4d4f', color: 'white', border: 'none', boxShadow: 'none' }}
                        onClick={() => handleCancelBooking(rental)}
                      >
                        <i className="bi bi-x-octagon"></i>
                      </Button>
                    </Tooltip>
                  )}
                  {/* Rating button for completed bookings */}
                  {canRate && (
                    <Tooltip title="Rate car">
                      <Button className="rate-btn" onClick={() => handleRateCar(rental)}>
                        <i className="bi bi-star"></i>
                      </Button>
                    </Tooltip>
                  )}
                </>
              )}
            </div>
          </div>
        </Card>
      </Col>
    );
  };

  const renderRentalDetails = () => {
    if (!selectedRental) return null;
    const bookingStatus = selectedRental.bookingStatus || selectedRental.booking_status || selectedRental.booking_status_text;
    return (
      <Descriptions bordered column={1} className="rental-details">
        <Descriptions.Item label="Order Code">
          <Text strong>{selectedRental.orderCode}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="Payment & Booking Status">
          <Tag color={getStatusColor(selectedRental.status)}>
            {selectedRental.status}
          </Tag>
          {bookingStatus && (
            <Tag color={getBookingStatusColor(bookingStatus)} style={{ marginLeft: 4 }}>
              {bookingStatus}
            </Tag>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="License Plate">
          {selectedRental.carId}
        </Descriptions.Item>
        <Descriptions.Item label="Rental Period">
          {formatDate(selectedRental.rentalStartDate)} -{" "}
          {formatDate(selectedRental.rentalEndDate)}
        </Descriptions.Item>
        <Descriptions.Item label="Payment Method">
          {selectedRental.paymentMethod}
        </Descriptions.Item>
        <Descriptions.Item label="Amount">
          {selectedRental.amount?.toLocaleString("vi-VN")} VND
        </Descriptions.Item>
        <Descriptions.Item label="Additional Requirements">
          {selectedRental.additionalRequirements || "None"}
        </Descriptions.Item>
        <Descriptions.Item label="Booking Date">
          {formatDate(selectedRental.paymentDate)}
        </Descriptions.Item>
        <Descriptions.Item label="Last Updated">
          {formatDate(selectedRental.updatedAt)}
        </Descriptions.Item>
      </Descriptions>
    );
  };

  if (!user) {
    return null;
  }

  return (
    <div className="my-rentals-container">
      <div className="my-rentals-content">
        <Title level={2} className="page-title">
          My Rental History
        </Title>
        {loading ? (
          <div className="loading-container">
            <Spin size="large" />
          </div>
        ) : rentals.length === 0 ? (
          <Empty
            description="You don't have any rental history yet"
            className="empty-state"
          />
        ) : (
          <Row gutter={[24, 24]} className="rentals-grid">
            {rentals.map(renderRentalCard)}
          </Row>
        )}
      </div>

      <Modal
        title="Order Details"
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={[
          <Button key="close" onClick={handleCloseModal}>
            Close
          </Button>,
        ]}
        width={800}
      >
        {renderRentalDetails()}
      </Modal>

      <Modal
        title={
          isReviewSubmitted
            ? "Review Submitted Successfully"
            : `Rate Car ${ratingRental?.carId}`
        }
        open={isRatingModalVisible}
        onCancel={handleRatingModalClose}
        wrapClassName="rating-modal"
        footer={
          isReviewSubmitted
            ? null
            : [
                <Button key="back" onClick={handleRatingModalClose}>
                  Cancel
                </Button>,
                <Button
                  key="submit"
                  type="primary"
                  onClick={handleRatingSubmit}
                  disabled={rating === 0}
                >
                  Submit Review
                </Button>,
              ]
        }
      >
        {isReviewSubmitted ? (
          <Result status="success" title="Thank you for your review!" />
        ) : (
          <>
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <Text>How many stars would you rate this car?</Text>
            </div>
            <div style={{ textAlign: "center" }}>
              <Rate
                tooltips={tooltips}
                onChange={setRating}
                onHoverChange={setHoverValue}
                value={rating}
                character={customIcons[hoverValue || rating]}
                style={{ fontSize: 36 }}
              />
            </div>
            <Input.TextArea
              rows={4}
              onChange={(e) => setComment(e.target.value)}
              value={comment}
              placeholder="Share your experience with this car (optional)..."
              style={{ marginTop: "24px" }}
            />
          </>
        )}
      </Modal>

      <Modal
        title="Confirm Delete Booking"
        open={isDeleteModalVisible}
        onCancel={handleCloseDeleteModal}
        footer={[
          <Button key="cancel" onClick={handleCloseDeleteModal}>
            Cancel
          </Button>,
          <Button key="delete" type="primary" danger onClick={handleConfirmDelete}>
            Delete
          </Button>,
        ]}
        width={500}
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: '16px', marginBottom: '16px' }}>
            Are you sure you want to delete this booking?
          </div>
          {rentalToDelete && (
            <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '6px', marginBottom: '16px' }}>
              <Text strong>Order: #{rentalToDelete.orderCode}</Text>
              <br />
              <Text>License Plate: {rentalToDelete.carId}</Text>
              <br />
              <Text>Amount: {rentalToDelete.amount?.toLocaleString("vi-VN")} VND</Text>
            </div>
          )}
          <div style={{ color: '#ff4d4f', fontSize: '14px' }}>
            ⚠️ This action cannot be undone
          </div>
        </div>
      </Modal>

      <Modal
        title="Switch to Cash Payment"
        open={isSwitchModalVisible}
        onCancel={handleCloseSwitchModal}
        footer={[
          <Button key="cancel" onClick={handleCloseSwitchModal}>
            Cancel
          </Button>,
          <Button key="switch" type="primary" style={{ backgroundColor: '#fa8c16', borderColor: '#fa8c16' }} onClick={handleConfirmSwitch}>
            Switch
          </Button>,
        ]}
        width={500}
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: '16px', marginBottom: '16px' }}>
            Do you want to switch to cash payment when receiving the car?
          </div>
          {rentalToSwitch && (
            <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '6px', marginBottom: '16px' }}>
              <Text strong>Order: #{rentalToSwitch.orderCode}</Text>
              <br />
              <Text>License Plate: {rentalToSwitch.carId}</Text>
              <br />
              <Text>Amount: {rentalToSwitch.amount?.toLocaleString("vi-VN")} VND</Text>
              <br />
              <Text>From: <strong>Bank Transfer</strong> → <strong>Cash</strong></Text>
            </div>
          )}
          <div style={{ color: '#fa8c16', fontSize: '14px' }}>
            💡 You will pay cash when receiving the car
          </div>
        </div>
      </Modal>

      <Modal
        title="Switch to Bank Payment"
        open={isSwitchToBankModalVisible}
        onCancel={handleCloseSwitchToBankModal}
        footer={[
          <Button key="cancel" onClick={handleCloseSwitchToBankModal}>
            Cancel
          </Button>,
          <Button key="switch" type="primary" style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }} onClick={handleConfirmSwitchToBank}>
            Switch
          </Button>,
        ]}
        width={500}
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: '16px', marginBottom: '16px' }}>
            Do you want to switch to bank transfer payment?
          </div>
          {rentalToSwitchToBank && (
            <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '6px', marginBottom: '16px' }}>
              <Text strong>Order: #{rentalToSwitchToBank.orderCode}</Text>
              <br />
              <Text>License Plate: {rentalToSwitchToBank.carId}</Text>
              <br />
              <Text>Amount: {rentalToSwitchToBank.amount?.toLocaleString("vi-VN")} VND</Text>
              <br />
              <Text>From: <strong>Cash</strong> → <strong>Bank Transfer</strong></Text>
            </div>
          )}
          <div style={{ color: '#1890ff', fontSize: '14px' }}>
            🏦 You need to pay early to secure your booking
          </div>
        </div>
      </Modal>

      <Modal
        title="Confirm Cancel Booking"
        open={isCancelModalVisible}
        onCancel={handleCloseCancelModal}
        footer={[
          <Button key="cancel" onClick={handleCloseCancelModal}>
            Cancel
          </Button>,
          <Button key="delete" type="primary" danger onClick={handleConfirmCancelBooking}>
            Confirm Cancellation
          </Button>,
        ]}
        width={500}
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          {/* Display refund percentage if bank payment */}
          {rentalToCancel && rentalToCancel.paymentMethod?.toLowerCase() === "bank" && (
            <>
              <div style={{ color: '#1890ff', fontWeight: 500, marginBottom: 8 }}>
                {rentalToCancel.status?.toUpperCase() === "PAID" ? (
                  rentalToCancel.bookingStatus?.toLowerCase() === "pending"
                    ? "You will receive 100% refund of the amount paid."
                    : rentalToCancel.bookingStatus?.toLowerCase() === "ongoing"
                      ? "You will receive 95% refund of the amount paid."
                      : null
                ) : (
                  "You haven't paid yet, no refund will be processed."
                )}
              </div>
              {/* Input for bank account and bank name if bank + PAID */}
              {rentalToCancel.status?.toUpperCase() === "PAID" && (
                <div style={{ marginBottom: 12 }}>
                  <Input
                    placeholder="Bank account number for refund"
                    value={refundBankAccount}
                    onChange={e => setRefundBankAccount(e.target.value)}
                    style={{ marginBottom: 8 }}
                  />
                  <Input
                    placeholder="Bank name for refund"
                    value={refundBankName}
                    onChange={e => setRefundBankName(e.target.value)}
                  />
                </div>
              )}
            </>
          )}
          <div style={{ fontSize: '16px', marginBottom: '16px' }}>
            Are you sure you want to cancel this booking? This action cannot be undone.
          </div>
          {rentalToCancel && (
            <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '6px', marginBottom: '16px' }}>
              <Text strong>Order: #{rentalToCancel.orderCode}</Text>
              <br />
              <Text>License Plate: {rentalToCancel.carId}</Text>
              <br />
              <Text>Amount: {rentalToCancel.amount?.toLocaleString("vi-VN")} VND</Text>
            </div>
          )}
          <div style={{ color: '#ff4d4f', fontSize: '14px' }}>
            ⚠️ This action cannot be undone
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MyRentals;
