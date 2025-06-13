import React, { useState } from 'react';
import '../css/HomeContent.css';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';

const HomeContent = () => {
  const [form, setForm] = useState({
    location: '',
    pickupDate: '',
    pickupTime: '',
    returnDate: '',
    returnTime: '',
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // TODO: Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle booking logic here
  };

  return (
    <div className="home-bg-container">
      <div className="home-bg-overlay"></div>
      <Container className="py-5">
        <Row className="justify-content-center">
          {/* Introduction Section */}
          <Col lg={7} className="mb-4 mb-lg-0">
            <div className="intro-section">
              <div className="intro-header">
                <h1 className="display-4 mb-3">Welcome to Drivon</h1>
                <h2 className="h3 mb-4">Vietnam's Leading Car Rental Platform</h2>
                <p className="lead">Drivon brings you a simple, safe, and cost-effective car rental experience</p>
              </div>
              <div className="feature-grid">
                <div className="feature-item">
                  <div className="feature-icon">
                    <i className="bi bi-car-front-fill"></i>
                  </div>
                  <div className="feature-content">
                    <h3>Diverse Fleet</h3>
                    <p>From economy to luxury</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">
                    <i className="bi bi-shield-check"></i>
                  </div>
                  <div className="feature-content">
                    <h3>Comprehensive Insurance</h3>
                    <p>For every journey</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">
                    <i className="bi bi-credit-card"></i>
                  </div>
                  <div className="feature-content">
                    <h3>Flexible Payment</h3>
                    <p>Safe and convenient</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">
                    <i className="bi bi-headset"></i>
                  </div>
                  <div className="feature-content">
                    <h3>24/7 Support</h3>
                    <p>Always ready to serve</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="intro-buttons">
                  <Button 
                    variant="primary" 
                    size="lg" 
                    className="me-3"
                    onClick={() => navigate('/rent-car')}
                  >
                    Rent a Car
                  </Button>                
                </div>
          </Col>

          {/* Booking Form */}
          <Col lg={5}>
            <Card className="booking-card">
              <Card.Body className="p-4">
                <h2 className="text-center mb-4">Want to Rent a Car?</h2>
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Location</Form.Label>
                    <Form.Select
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select location</option>
                      <option value="Hà Nội">Hanoi</option>
                      <option value="Hồ Chí Minh">Ho Chi Minh City</option>
                      <option value="Đà Nẵng">Da Nang</option>
                      <option value="Cần Thơ">Can Tho</option>
                      <option value="Hải Phòng">Hai Phong</option>
                      <option value="Nha Trang">Nha Trang</option>
                      <option value="Huế">Hue</option>
                      <option value="Khác">Other</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Pickup Time</Form.Label>
                    <Row className="g-2">
                      <Col>
                        <Form.Control
                          type="date"
                          name="pickupDate"
                          value={form.pickupDate}
                          onChange={handleChange}
                          required
                        />
                      </Col>
                      <Col>
                        <Form.Control
                          type="time"
                          name="pickupTime"
                          value={form.pickupTime}
                          onChange={handleChange}
                          required
                        />
                      </Col>
                    </Row>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Return Time</Form.Label>
                    <Row className="g-2">
                      <Col>
                        <Form.Control
                          type="date"
                          name="returnDate"
                          value={form.returnDate}
                          onChange={handleChange}
                          required
                        />
                      </Col>
                      <Col>
                        <Form.Control
                          type="time"
                          name="returnTime"
                          value={form.returnTime}
                          onChange={handleChange}
                          required
                        />
                      </Col>
                    </Row>
                  </Form.Group>

                  <Button variant="primary" type="submit" className="w-100 py-2">
                    Find Best Price
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default HomeContent;