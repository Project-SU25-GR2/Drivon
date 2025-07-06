import React, { useState, useEffect } from 'react';
import '../css/HomeContent.css';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { useCarData } from '../../contexts/CarDataContext';
import { API_URL } from '../../api/configApi';
import { showErrorToast } from '../toast/notification';

const HomeContent = () => {
  const [form, setForm] = useState({
    location: '',
    minPrice: 0,
    maxPrice: 5000000,
  });
  const [locations, setLocations] = useState([]);
  const navigate = useNavigate();
  const { carsData, fetchCarsData } = useCarData();

  useEffect(() => {
    // Fetch cars data using context
    const loadData = async () => {
      try {
        await fetchCarsData();
      } catch (error) {
        console.error('Error loading cars data:', error);
        showErrorToast('Failed to load cars data');
      }
    };
    loadData();
  }, [fetchCarsData]);

  useEffect(() => {
    // Extract unique locations from cars data
    if (carsData.length > 0) {
      const uniqueLocations = [...new Set(carsData.map(car => car.location).filter(Boolean))];
      setLocations(uniqueLocations);
    }
  }, [carsData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSliderChange = (value) => {
    setForm({
      ...form,
      minPrice: value[0],
      maxPrice: value[1],
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Build query params
    const params = new URLSearchParams();
    if (form.location) params.append('location', form.location);
    if (form.minPrice != null) params.append('minPrice', form.minPrice);
    if (form.maxPrice != null) params.append('maxPrice', form.maxPrice);
    navigate(`/rent-car?${params.toString()}`);
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
                    >
                      <option value="">Select location</option>
                      {locations.map((loc) => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Price Range (VND/day)</Form.Label>
                    <Slider
                      range
                      min={0}
                      max={5000000}
                      step={100000}
                      defaultValue={[form.minPrice, form.maxPrice]}
                      onChange={handleSliderChange}
                      handleStyle={[{ borderColor: '#0d6efd' }, { borderColor: '#0d6efd' }]}
                      trackStyle={[{ backgroundColor: '#0d6efd' }]}
                    />
                    <div className="d-flex justify-content-between mt-2">
                      <span>{form.minPrice.toLocaleString()} đ</span>
                      <span>{form.maxPrice.toLocaleString()} đ</span>
                    </div>
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