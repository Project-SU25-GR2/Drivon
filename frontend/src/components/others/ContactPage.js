import React, { useState } from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaCar, FaHeadphones, FaExclamationTriangle } from 'react-icons/fa';
import './ContactPage.css';
import emailjs from '@emailjs/browser';

const SERVICE_ID = 'service_4kxo9bc';
const TEMPLATE_ID = 'template_ke3xtdn';
const PUBLIC_KEY = 'GEk6xcGUMXH9SDK18';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const templateParams = {
      from_name: formData.name,
      from_email: formData.email,
      phone: formData.phone,
      subject: formData.subject,
      message: formData.message,
    };

    try {
      await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      setTimeout(() => setSubmitStatus(null), 3000);
    } catch (error) {
      setSubmitStatus('error');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <div className="hero-content">
          <h1>Contact Us</h1>
          <p>We're always ready to support you 24/7. Contact us if you need any assistance.</p>
        </div>
      </div>

      <div className="contact-container">
        <div className="contact-info-section">
          <h2>Contact Information</h2>
          <div className="contact-info-grid">
            <div className="contact-info-item">
              <div className="contact-icon">
                <FaPhone />
              </div>
              <div className="contact-details">
                <h3>Phone</h3>
                <p>+84 123 456 789</p>
                <p>+84 987 654 321</p>
              </div>
            </div>

            <div className="contact-info-item">
              <div className="contact-icon">
                <FaEnvelope />
              </div>
              <div className="contact-details">
                <h3>Email</h3>
                <p>info@drivon.com</p>
                <p>support@drivon.com</p>
              </div>
            </div>

            <div className="contact-info-item">
              <div className="contact-icon">
                <FaMapMarkerAlt />
              </div>
              <div className="contact-details">
                <h3>Address</h3>
                <p>FPT University</p>
                <p>District 9, Ho Chi Minh City</p>
              </div>
            </div>

            <div className="contact-info-item">
              <div className="contact-icon">
                <FaClock />
              </div>
              <div className="contact-details">
                <h3>Business Hours</h3>
                <p>Monday - Friday: 8:00 - 18:00</p>
                <p>Saturday: 8:00 - 12:00</p>
              </div>
            </div>
          </div>

          <div className="social-links-section">
            <h3>Follow Us</h3>
            <div className="social-links">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link facebook">
                <FaFacebook />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link twitter">
                <FaTwitter />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link instagram">
                <FaInstagram />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-link linkedin">
                <FaLinkedin />
              </a>
            </div>
          </div>
        </div>

        <div className="contact-form-section">
          <h2>Send Us A Message</h2>
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="subject">Subject *</label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select subject</option>
                  <option value="general">General Information</option>
                  <option value="booking">Car Booking</option>
                  <option value="partnership">Partnership</option>
                  <option value="support">Technical Support</option>
                  <option value="complaint">Complaint</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="message">Message Content *</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="6"
                required
                placeholder="Please describe your issue or question in detail..."
              ></textarea>
            </div>

            <button 
              type="submit" 
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>

            {submitStatus === 'success' && (
              <div className="success-message">
                <p>✅ Message sent successfully! We will respond as soon as possible.</p>
              </div>
            )}
            {submitStatus === 'error' && (
              <div className="error-message">
                <p>❌ Failed to send message. Please try again later.</p>
              </div>
            )}
          </form>
        </div>
      </div>

      <div className="special-departments-section">
        <h2 className="special-departments-title">Specialized Departments</h2>
        <div className="departments-grid">
          <div className="department-card">
            <FaCar className="department-icon" style={{ color: '#1976d2' }} size={48} />
            <h3>Car Booking Department</h3>
            <p>Car rental consultation and booking</p>
            <div className="department-contact">
              <div>
                <span role="img" aria-label="phone">📞</span> 039 467 2210
              </div>
              <div>
                <span role="img" aria-label="email">✉️</span> booking@carrental.vn
              </div>
            </div>
          </div>
          <div className="department-card">
            <FaHeadphones className="department-icon" style={{ color: '#43a047' }} size={48} />
            <h3>Customer Care</h3>
            <p>Support and answer questions</p>
            <div className="department-contact">
              <div>
                <span role="img" aria-label="phone">📞</span> 039 467 2210
              </div>
              <div>
                <span role="img" aria-label="email">✉️</span> support@carrental.vn
              </div>
            </div>
          </div>
          <div className="department-card">
            <FaExclamationTriangle className="department-icon" style={{ color: '#ff9800' }} size={48} />
            <h3>Insurance & Claims</h3>
            <p>Handle insurance and complaints</p>
            <div className="department-contact">
              <div>
                <span role="img" aria-label="phone">📞</span> 039 467 2210
              </div>
              <div>
                <span role="img" aria-label="email">✉️</span> claims@carrental.vn
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="map-section">
        <h2>Our Location</h2>
        <div className="map-container">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.484123456789!2d106.8064!3d10.8417!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDUwJzMwLjEiTiAxMDbCsDQ4JzIzLjAiRQ!5e0!3m2!1sen!2s!4v1234567890"
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="FPT University Location"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default ContactPage; 