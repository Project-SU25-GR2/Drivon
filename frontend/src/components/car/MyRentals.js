import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Button, Spin, Empty, Tag, message, Modal, Descriptions, Divider } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MainLayout from '../home/MainLayout';
import '../../styles/MyRentals.css';

const { Title, Text } = Typography;

const MyRentals = () => {
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [selectedRental, setSelectedRental] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!userData) {
            message.error('Vui lòng đăng nhập để xem lịch sử đặt xe');
            navigate('/login');
            return;
        }
        setUser(userData);
        fetchRentals(userData.userId);
    }, [navigate]);

    const fetchRentals = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/payments/user/${userId}`);
            setRentals(response.data);
        } catch (error) {
            console.error('Error fetching rentals:', error);
            message.error('Không thể tải lịch sử đặt xe');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toUpperCase()) {
            case 'PAID':
                return 'success';
            case 'PENDING':
                return 'warning';
            case 'REFUNDED':
                return 'error';
            default:
                return 'default';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
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

    const renderRentalCard = (rental) => (
        <Col xs={24} sm={24} md={12} lg={8} xl={8} key={rental.id}>
            <Card className="rental-card">
                <div className="rental-header">
                    <Title level={4}>Mã đơn: {rental.orderCode}</Title>
                    <Tag color={getStatusColor(rental.status)}>
                        {rental.status}
                    </Tag>
                </div>
                <div className="rental-info">
                    <Text>Biển số xe: {rental.carId}</Text>
                    <Text>Thời gian thuê: {formatDate(rental.rentalStartDate)} - {formatDate(rental.rentalEndDate)}</Text>
                    <Text>Phương thức thanh toán: {rental.paymentMethod}</Text>
                    <Text>Yêu cầu thêm: {rental.additionalRequirements || 'Không có'}</Text>
                    <Text>Ngày đặt: {formatDate(rental.createdAt)}</Text>
                </div>
                <div className="rental-actions">
                    <Button type="primary" onClick={() => handleViewDetails(rental)}>
                        Xem chi tiết
                    </Button>
                </div>
            </Card>
        </Col>
    );

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
                    {formatDate(selectedRental.rentalStartDate)} - {formatDate(selectedRental.rentalEndDate)}
                </Descriptions.Item>
                <Descriptions.Item label="Phương thức thanh toán">
                    {selectedRental.paymentMethod}
                </Descriptions.Item>
                <Descriptions.Item label="Số tiền">
                    {selectedRental.amount?.toLocaleString('vi-VN')} VNĐ
                </Descriptions.Item>
                <Descriptions.Item label="Yêu cầu thêm">
                    {selectedRental.additionalRequirements || 'Không có'}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày đặt">
                    {formatDate(selectedRental.createdAt)}
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
                    <Title level={2} className="page-title">Lịch sử đặt xe của tôi</Title>
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
                    </Button>
                ]}
                width={800}
            >
                {renderRentalDetails()}
            </Modal>
        </MainLayout>
    );
};

export default MyRentals; 