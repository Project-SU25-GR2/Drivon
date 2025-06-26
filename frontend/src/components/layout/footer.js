import React, { useState } from 'react';
import '../css/footer.css';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const isMobile = () => typeof window !== 'undefined' && window.innerWidth <= 768;

const Footer = () => {
  const [openSection, setOpenSection] = useState({
    quickLinks: !isMobile(),
    contactInfo: !isMobile(),
  });

  // Đảm bảo cập nhật khi resize (nếu muốn realtime responsive)
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setOpenSection({ quickLinks: true, contactInfo: true });
      } else {
        setOpenSection({ quickLinks: false, contactInfo: false });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSection = (section) => {
    if (!isMobile()) return;
    setOpenSection((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Drivon</h3>
          <p>Your trusted partner in driving education and excellence.</p>
          <div className="social-links">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebook /></a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
          </div>
        </div>

        <div className="footer-section">
          <h4
            className="footer-accordion-title"
            onClick={() => toggleSection('quickLinks')}
            style={{ cursor: isMobile() ? 'pointer' : 'default' }}
          >
            Quick Links
          </h4>
          {(openSection.quickLinks || !isMobile()) && (
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/courses">Courses</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          )}
        </div>

        <div className="footer-section">
          <h4
            className="footer-accordion-title"
            onClick={() => toggleSection('contactInfo')}
            style={{ cursor: isMobile() ? 'pointer' : 'default' }}
          >
            Contact Info
          </h4>
          {(openSection.contactInfo || !isMobile()) && (
            <ul>
              <li>Email: info@drivon.com</li>
              <li>Phone: +84 123 456 789</li>
              <li>Address: FPT University, District 9, Ho Chi Minh City</li>
            </ul>
          )}
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Drivon. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
