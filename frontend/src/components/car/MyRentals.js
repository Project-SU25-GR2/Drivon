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

  const tooltips = ["Rất tệ", "Tệ", "Bình thường", "Tốt", "Rất tốt"];

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
      message.error("Vui lòng đăng nhập để xem lịch sử đặt xe");
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
      message.error("Không thể tải lịch sử đặt xe");
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
      message.error("Vui lòng chọn số sao đánh giá.");
      return;
    }
    try {
      await axios.post(
        `${API_URL}/reviews/car/${ratingRental.carId}`, //đánh giá xe     
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
      message.success("Đánh giá đã được lưu thành công!");
      setIsReviewSubmitted(true);
      setReviewedRentals((prev) => [...prev, ratingRental.bookingId]);
      setTimeout(() => {
        handleRatingModalClose();
      }, 2000);
    } catch (error) {
      message.error("Gửi đánh giá thất bại. Vui lòng thử lại!");
    }
  };

  const handlePayment = (rental) => {
    const bankPaymentRequest = {
      orderCode: Date.now(),
      amount: rental.amount,
      description: `Thanh toan: ${rental.orderCode.toString().slice(-8)}`, // Rút ngắn và bỏ dấu
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
          message.error('Không thể chuyển hướng đến trang thanh toán. Vui lòng thử lại.');
        }
      })
      .catch(() => {
        message.error('Có lỗi xảy ra khi tạo link thanh toán.');
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
        message.error('Không tìm thấy ID để xóa.');
        return;
      }

      // Try booking endpoint first since we just added it
      if (rentalToDelete.bookingId) {
        console.log('Trying to delete booking:', rentalToDelete.bookingId);
        const response = await axios.delete(`${API_URL}/bookings/${rentalToDelete.bookingId}`);
        console.log('Delete booking response:', response);
        message.success('Đã xóa đơn đặt xe thành công!');
        fetchRentalsWithCleanup(user.userId);
        handleCloseDeleteModal();
        return;
      }

      // Try payment endpoint as fallback
      if (paymentId) {
        console.log('Trying to delete payment:', paymentId);
        const response = await axios.delete(`${API_URL}/payments/${paymentId}`);
        console.log('Delete payment response:', response);
        message.success('Đã xóa đơn thanh toán thành công!');
        fetchRentalsWithCleanup(user.userId);
        handleCloseDeleteModal();
        return;
      }

    } catch (error) {
      console.error('Delete error:', error);
      console.error('Error details:', error.response?.data);
      message.error(`Không thể xóa: ${error.response?.data?.message || error.message}`);
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
        message.success('Đã chuyển sang thanh toán ngân hàng thành công! Bạn có thể thanh toán sau.');
        fetchRentalsWithCleanup(user.userId);
        handleCloseSwitchToBankModal();
      } else {
        console.error('No response data received');
        message.error('Không thể chuyển phương thức thanh toán.');
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
        message.success('Đã chuyển sang thanh toán tiền mặt thành công!');
        fetchRentalsWithCleanup(user.userId);
        handleCloseSwitchModal();
      } else {
        console.error('No response data received');
        message.error('Không thể chuyển phương thức thanh toán.');
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
      message.error('Không tìm thấy booking để hủy.');
      return;
    }
    try {
      let refundCreated = false;
      // Nếu là bank và status payment là PAID thì tạo request hoàn tiền
      if (rentalToCancel.paymentMethod?.toLowerCase() === "bank" && rentalToCancel.status?.toUpperCase() === "PAID") {
        if (!refundBankAccount || !refundBankName) {
          message.error("Vui lòng nhập đầy đủ số tài khoản và tên ngân hàng để nhận hoàn tiền.");
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
        message.success('Đã tạo yêu cầu hoàn tiền và hủy đơn thành công!');
      } else {
        message.success('Đã hủy đơn đặt xe thành công!');
      }
      fetchRentalsWithCleanup(user.userId);
      setIsCancelModalVisible(false);
      setRentalToCancel(null);
      setRefundBankAccount("");
      setRefundBankName("");
    } catch (error) {
      message.error('Không thể hủy đơn đặt xe hoặc tạo yêu cầu hoàn tiền.');
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
    return (
      <Col xs={24} sm={24} md={12} lg={8} xl={8} key={rental.paymentId}>
        <Card className="rental-card">
          <div className="rental-card-header">
            <div className="rental-card-title">
              <span className="rental-card-icon"><CarOutlined /></span>
              <span>Đặt xe thành công</span>
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
            <div className="rental-card-order">Mã đơn: #{rental.orderCode}</div>
          </div>
          <div className="rental-card-section">
            <span className="rental-card-section-icon"><EnvironmentOutlined /></span>
            <div className="rental-card-section-content">
              {car && (
                <span className="rental-card-carinfo">{car.brand} {car.model} {car.year}</span>
              )}
              <span className="rental-card-section-label">Biển số xe: {rental.carId}</span>
            </div>
          </div>
          <div className="rental-card-section rental-card-time-section">
            <span className="rental-card-section-icon rental-card-time-icon"><CalendarOutlined /></span>
            <div className="rental-card-time-content">
              <div className="rental-card-section-label">Thời gian thuê</div>
              <div className="rental-card-time-value">{formatDate(rental.rentalStartDate).replace('lúc ', '')}</div>
              <div className="rental-card-time-between">đến</div>
              <div className="rental-card-time-value">{formatDate(rental.rentalEndDate).replace('lúc ', '')}</div>
            </div>
          </div>
          <div className="rental-card-section">
            <span className="rental-card-section-icon"><CreditCardOutlined /></span>
            <span className="rental-card-section-label">Phương thức thanh toán</span>
            <span className="rental-card-section-value">{rental.paymentMethod}</span>
          </div>
          <div className="rental-card-special">
            <div>
              <span className="special-label">Yêu cầu đặc biệt</span>
              <span className="special-value">{rental.additionalRequirements || "Không có"}</span>
            </div>
            <div>
              <span className="voucher-label">Voucher:</span>
              <span className="voucher-value">{rental.discountPercent|| "0"}%</span>
            </div>
          </div>
          <div className="rental-card-footer">
            <div className="rental-card-date">
              Đặt lúc: {formatDate(rental.paymentDate).replace('lúc ', '')}
            </div>
            <div className="rental-card-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Tooltip title="Chi tiết">
                <Button className="detail-btn" type="primary" onClick={() => handleViewDetails(rental)}>
                  <i className="bi bi-info-circle"></i>
                </Button>
              </Tooltip>
              
              {/* Buttons for PENDING payments */}
              {isPending && (
                <>
                  <Tooltip title="Thanh toán">
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
                    <Tooltip title="Chuyển sang thanh toán tiền mặt">
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
                <Tooltip title="Chuyển sang thanh toán ngân hàng">
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
                <Tooltip title="Hủy đặt xe">
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
                <Tooltip title="Đánh giá xe">
                  <Button className="rate-btn" onClick={() => handleRateCar(rental)}>
                    <i className="bi bi-star"></i>
                  </Button>
                </Tooltip>
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
        <Descriptions.Item label="Mã đơn hàng">
          <Text strong>{selectedRental.orderCode}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái thanh toán & booking">
          <Tag color={getStatusColor(selectedRental.status)}>
            {selectedRental.status}
          </Tag>
          {bookingStatus && (
            <Tag color={getBookingStatusColor(bookingStatus)} style={{ marginLeft: 4 }}>
              {bookingStatus}
            </Tag>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Biển số xe">
          {selectedRental.carId}
        </Descriptions.Item>
        <Descriptions.Item label="Thời gian thuê">
          {formatDate(selectedRental.rentalStartDate)} -{" "}
          {formatDate(selectedRental.rentalEndDate)}
        </Descriptions.Item>
        <Descriptions.Item label="Phương thức thanh toán">
          {selectedRental.paymentMethod}
        </Descriptions.Item>
        <Descriptions.Item label="Số tiền">
          {selectedRental.amount?.toLocaleString("vi-VN")} VNĐ
        </Descriptions.Item>
        <Descriptions.Item label="Yêu cầu thêm">
          {selectedRental.additionalRequirements || "Không có"}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày đặt">
          {formatDate(selectedRental.paymentDate)}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày cập nhật">
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
          Lịch sử đặt xe của tôi
        </Title>
        {loading ? (
          <div className="loading-container">
            <Spin size="large" />
          </div>
        ) : rentals.length === 0 ? (
          <Empty
            description="Bạn chưa có lịch sử đặt xe nào"
            className="empty-state"
          />
        ) : (
          <Row gutter={[24, 24]} className="rentals-grid">
            {rentals.map(renderRentalCard)}
          </Row>
        )}
      </div>

      <Modal
        title="Chi tiết đơn hàng"
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={[
          <Button key="close" onClick={handleCloseModal}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {renderRentalDetails()}
      </Modal>

      <Modal
        title={
          isReviewSubmitted
            ? "Gửi đánh giá thành công"
            : `Đánh giá xe ${ratingRental?.carId}`
        }
        open={isRatingModalVisible}
        onCancel={handleRatingModalClose}
        wrapClassName="rating-modal"
        footer={
          isReviewSubmitted
            ? null
            : [
                <Button key="back" onClick={handleRatingModalClose}>
                  Hủy
                </Button>,
                <Button
                  key="submit"
                  type="primary"
                  onClick={handleRatingSubmit}
                  disabled={rating === 0}
                >
                  Gửi đánh giá
                </Button>,
              ]
        }
      >
        {isReviewSubmitted ? (
          <Result status="success" title="Cảm ơn bạn đã đánh giá!" />
        ) : (
          <>
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <Text>Bạn đánh giá chiếc xe này bao nhiêu sao?</Text>
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
              placeholder="Chia sẻ cảm nhận của bạn về chiếc xe này (không bắt buộc)..."
              style={{ marginTop: "24px" }}
            />
          </>
        )}
      </Modal>

      <Modal
        title="Xác nhận xóa đơn đặt xe"
        open={isDeleteModalVisible}
        onCancel={handleCloseDeleteModal}
        footer={[
          <Button key="cancel" onClick={handleCloseDeleteModal}>
            Hủy
          </Button>,
          <Button key="delete" type="primary" danger onClick={handleConfirmDelete}>
            Xóa
          </Button>,
        ]}
        width={500}
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: '16px', marginBottom: '16px' }}>
            Bạn có chắc chắn muốn xóa đơn đặt xe này không?
          </div>
          {rentalToDelete && (
            <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '6px', marginBottom: '16px' }}>
              <Text strong>Mã đơn: #{rentalToDelete.orderCode}</Text>
              <br />
              <Text>Biển số xe: {rentalToDelete.carId}</Text>
              <br />
              <Text>Số tiền: {rentalToDelete.amount?.toLocaleString("vi-VN")} VNĐ</Text>
            </div>
          )}
          <div style={{ color: '#ff4d4f', fontSize: '14px' }}>
            ⚠️ Hành động này không thể hoàn tác
          </div>
        </div>
      </Modal>

      <Modal
        title="Chuyển sang thanh toán tiền mặt"
        open={isSwitchModalVisible}
        onCancel={handleCloseSwitchModal}
        footer={[
          <Button key="cancel" onClick={handleCloseSwitchModal}>
            Hủy
          </Button>,
          <Button key="switch" type="primary" style={{ backgroundColor: '#fa8c16', borderColor: '#fa8c16' }} onClick={handleConfirmSwitch}>
            Chuyển đổi
          </Button>,
        ]}
        width={500}
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: '16px', marginBottom: '16px' }}>
            Bạn có muốn chuyển sang thanh toán bằng tiền mặt khi nhận xe?
          </div>
          {rentalToSwitch && (
            <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '6px', marginBottom: '16px' }}>
              <Text strong>Mã đơn: #{rentalToSwitch.orderCode}</Text>
              <br />
              <Text>Biển số xe: {rentalToSwitch.carId}</Text>
              <br />
              <Text>Số tiền: {rentalToSwitch.amount?.toLocaleString("vi-VN")} VNĐ</Text>
              <br />
              <Text>Từ: <strong>Chuyển khoản</strong> → <strong>Tiền mặt</strong></Text>
            </div>
          )}
          <div style={{ color: '#fa8c16', fontSize: '14px' }}>
            💡 Bạn sẽ thanh toán tiền mặt khi nhận xe
          </div>
        </div>
      </Modal>

      <Modal
        title="Chuyển sang thanh toán ngân hàng"
        open={isSwitchToBankModalVisible}
        onCancel={handleCloseSwitchToBankModal}
        footer={[
          <Button key="cancel" onClick={handleCloseSwitchToBankModal}>
            Hủy
          </Button>,
          <Button key="switch" type="primary" style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }} onClick={handleConfirmSwitchToBank}>
            Chuyển đổi
          </Button>,
        ]}
        width={500}
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: '16px', marginBottom: '16px' }}>
            Bạn có muốn chuyển sang thanh toán bằng chuyển khoản ngân hàng?
          </div>
          {rentalToSwitchToBank && (
            <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '6px', marginBottom: '16px' }}>
              <Text strong>Mã đơn: #{rentalToSwitchToBank.orderCode}</Text>
              <br />
              <Text>Biển số xe: {rentalToSwitchToBank.carId}</Text>
              <br />
              <Text>Số tiền: {rentalToSwitchToBank.amount?.toLocaleString("vi-VN")} VNĐ</Text>
              <br />
              <Text>Từ: <strong>Tiền mặt</strong> → <strong>Chuyển khoản</strong></Text>
            </div>
          )}
          <div style={{ color: '#1890ff', fontSize: '14px' }}>
            🏦 Bạn cần thanh toán sớm để được đặt xe
          </div>
        </div>
      </Modal>

      <Modal
        title="Xác nhận hủy đặt xe"
        open={isCancelModalVisible}
        onCancel={handleCloseCancelModal}
        footer={[
          <Button key="cancel" onClick={handleCloseCancelModal}>
            Hủy
          </Button>,
          <Button key="delete" type="primary" danger onClick={handleConfirmCancelBooking}>
            Xác nhận hủy
          </Button>,
        ]}
        width={500}
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          {/* Hiển thị phần trăm hoàn tiền nếu là bank */}
          {rentalToCancel && rentalToCancel.paymentMethod?.toLowerCase() === "bank" && (
            <>
              <div style={{ color: '#1890ff', fontWeight: 500, marginBottom: 8 }}>
                {rentalToCancel.status?.toUpperCase() === "PAID" ? (
                  rentalToCancel.bookingStatus?.toLowerCase() === "pending"
                    ? "Bạn sẽ được hoàn 100% số tiền đã thanh toán."
                    : rentalToCancel.bookingStatus?.toLowerCase() === "ongoing"
                      ? "Bạn sẽ được hoàn 95% số tiền đã thanh toán."
                      : null
                ) : (
                  "Bạn chưa thanh toán, sẽ không hoàn tiền."
                )}
              </div>
              {/* Input nhập số tài khoản và tên ngân hàng nếu là bank + PAID */}
              {rentalToCancel.status?.toUpperCase() === "PAID" && (
                <div style={{ marginBottom: 12 }}>
                  <Input
                    placeholder="Số tài khoản ngân hàng nhận hoàn"
                    value={refundBankAccount}
                    onChange={e => setRefundBankAccount(e.target.value)}
                    style={{ marginBottom: 8 }}
                  />
                  <Input
                    placeholder="Tên ngân hàng nhận hoàn"
                    value={refundBankName}
                    onChange={e => setRefundBankName(e.target.value)}
                  />
                </div>
              )}
            </>
          )}
          <div style={{ fontSize: '16px', marginBottom: '16px' }}>
            Bạn có chắc chắn muốn hủy đơn đặt xe này không? Hành động này không thể hoàn tác.
          </div>
          {rentalToCancel && (
            <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '6px', marginBottom: '16px' }}>
              <Text strong>Mã đơn: #{rentalToCancel.orderCode}</Text>
              <br />
              <Text>Biển số xe: {rentalToCancel.carId}</Text>
              <br />
              <Text>Số tiền: {rentalToCancel.amount?.toLocaleString("vi-VN")} VNĐ</Text>
            </div>
          )}
          <div style={{ color: '#ff4d4f', fontSize: '14px' }}>
            ⚠️ Hành động này không thể hoàn tác
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MyRentals;
