import React, { useState } from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaCar, FaHeadphones, FaExclamationTriangle } from 'react-icons/fa';
import './ContactPage.css';

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
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      
      // Reset status after 3 seconds
      setTimeout(() => setSubmitStatus(null), 3000);
    }, 1500);
  };

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <div className="hero-content">
          <h1>Liên Hệ Với Chúng Tôi</h1>
          <p>Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7. Hãy liên hệ với chúng tôi nếu bạn cần bất kỳ sự trợ giúp nào.</p>
        </div>
      </div>

      <div className="contact-container">
        <div className="contact-info-section">
          <h2>Thông Tin Liên Hệ</h2>
          <div className="contact-info-grid">
            <div className="contact-info-item">
              <div className="contact-icon">
                <FaPhone />
              </div>
              <div className="contact-details">
                <h3>Điện thoại</h3>
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
                <h3>Địa chỉ</h3>
                <p>FPT University</p>
                <p>District 9, Ho Chi Minh City</p>
              </div>
            </div>

            <div className="contact-info-item">
              <div className="contact-icon">
                <FaClock />
              </div>
              <div className="contact-details">
                <h3>Giờ làm việc</h3>
                <p>Thứ 2 - Thứ 6: 8:00 - 18:00</p>
                <p>Thứ 7: 8:00 - 12:00</p>
              </div>
            </div>
          </div>

          <div className="social-links-section">
            <h3>Theo dõi chúng tôi</h3>
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
          <h2>Gửi Tin Nhắn Cho Chúng Tôi</h2>
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Họ và tên *</label>
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
                <label htmlFor="phone">Số điện thoại</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="subject">Chủ đề *</label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                >
                  <option value="">Chọn chủ đề</option>
                  <option value="general">Thông tin chung</option>
                  <option value="booking">Đặt xe</option>
                  <option value="partnership">Hợp tác</option>
                  <option value="support">Hỗ trợ kỹ thuật</option>
                  <option value="complaint">Khiếu nại</option>
                  <option value="other">Khác</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="message">Nội dung tin nhắn *</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="6"
                required
                placeholder="Hãy mô tả chi tiết vấn đề hoặc câu hỏi của bạn..."
              ></textarea>
            </div>

            <button 
              type="submit" 
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang gửi...' : 'Gửi tin nhắn'}
            </button>

            {submitStatus === 'success' && (
              <div className="success-message">
                <p>✅ Tin nhắn đã được gửi thành công! Chúng tôi sẽ phản hồi trong thời gian sớm nhất.</p>
              </div>
            )}
          </form>
        </div>
      </div>

      <div className="special-departments-section">
        <h2 className="special-departments-title">Các Phòng Ban Chuyên Biệt</h2>
        <div className="departments-grid">
          <div className="department-card">
            <FaCar className="department-icon" style={{ color: '#1976d2' }} size={48} />
            <h3>Phòng Đặt Xe</h3>
            <p>Tư vấn và đặt xe thuê</p>
            <div className="department-contact">
              <div>
                <span role="img" aria-label="phone">📞</span> 028 1234 5678
              </div>
              <div>
                <span role="img" aria-label="email">✉️</span> booking@carrental.vn
              </div>
            </div>
          </div>
          <div className="department-card">
            <FaHeadphones className="department-icon" style={{ color: '#43a047' }} size={48} />
            <h3>Chăm Sóc Khách Hàng</h3>
            <p>Hỗ trợ và giải đáp thắc mắc</p>
            <div className="department-contact">
              <div>
                <span role="img" aria-label="phone">📞</span> 028 1234 5679
              </div>
              <div>
                <span role="img" aria-label="email">✉️</span> support@carrental.vn
              </div>
            </div>
          </div>
          <div className="department-card">
            <FaExclamationTriangle className="department-icon" style={{ color: '#ff9800' }} size={48} />
            <h3>Bảo Hiểm & Khiếu Nại</h3>
            <p>Xử lý bảo hiểm và khiếu nại</p>
            <div className="department-contact">
              <div>
                <span role="img" aria-label="phone">📞</span> 028 1234 5680
              </div>
              <div>
                <span role="img" aria-label="email">✉️</span> claims@carrental.vn
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="map-section">
        <h2>Vị Trí Của Chúng Tôi</h2>
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