import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Button, Spin, Empty, Tag, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MainLayout from '../home/MainLayout';
import '../../styles/MyRentals.css';

const { Title, Text } = Typography;

const MyRentals = () => {
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
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
                    <Button type="primary" onClick={() => navigate(`/rental-details/${rental.id}`)}>
                        Xem chi tiết
                    </Button>
                </div>
            </Card>
        </Col>
    );

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
        </MainLayout>
    );
};

export default MyRentals; 