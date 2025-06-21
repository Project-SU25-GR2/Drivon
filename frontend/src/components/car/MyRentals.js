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
} from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import MainLayout from "../home/MainLayout";
import "../../styles/MyRentals.css";
import { FrownOutlined, MehOutlined, SmileOutlined } from "@ant-design/icons";

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
    fetchRentals(userData.userId);
  }, [navigate]);

  const fetchRentals = async (userId) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/payments/user/${userId}`
      );
      setRentals(response.data);
    } catch (error) {
      console.error("Error fetching rentals:", error);
      message.error("Không thể tải lịch sử đặt xe");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "PAID":
        return "success";
      case "PENDING":
        return "warning";
      case "REFUNDED":
        return "error";
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
        `http://localhost:8080/api/reviews/car/${ratingRental.carId}`,
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

  const renderRentalCard = (rental) => {
    // A user can rate a car if the rental is paid.
    const canRate = rental.status?.toUpperCase() === "PAID";

    return (
      <Col xs={24} sm={24} md={12} lg={8} xl={8} key={rental.paymentId}>
        <Card className="rental-card">
          <div className="rental-header">
            <Title level={4}>Mã đơn: {rental.orderCode}</Title>
            <Tag color={getStatusColor(rental.status)}>{rental.status}</Tag>
          </div>
          <div className="rental-info">
            <Text>Biển số xe: {rental.carId}</Text>
            <Text>
              Thời gian thuê: {formatDate(rental.rentalStartDate)} -{" "}
              {formatDate(rental.rentalEndDate)}
            </Text>
            <Text>Phương thức thanh toán: {rental.paymentMethod}</Text>
            <Text>
              Yêu cầu thêm: {rental.additionalRequirements || "Không có"}
            </Text>
            <Text>Ngày đặt: {formatDate(rental.paymentDate)}</Text>
          </div>
          <div className="rental-actions">
            <Button type="primary" onClick={() => handleViewDetails(rental)}>
              Xem chi tiết
            </Button>
            {canRate && (
              <Button
                style={{ marginLeft: "8px" }}
                onClick={() => handleRateCar(rental)}
              >
                Đánh giá xe
              </Button>
            )}
          </div>
        </Card>
      </Col>
    );
  };

  const renderRentalDetails = () => {
    if (!selectedRental) return null;

    return (
      <Descriptions bordered column={1} className="rental-details">
        <Descriptions.Item label="Mã đơn hàng">
          <Text strong>{selectedRental.orderCode}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          <Tag color={getStatusColor(selectedRental.status)}>
            {selectedRental.status}
          </Tag>
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
    <MainLayout user={user}>
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
    </MainLayout>
  );
};

export default MyRentals;
