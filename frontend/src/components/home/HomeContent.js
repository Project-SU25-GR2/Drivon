import React, { useState } from 'react';
import '../css/HomeContent.css';

const HomeContent = () => {
  const [form, setForm] = useState({
    location: '',
    pickupDate: '',
    pickupTime: '',
    returnDate: '',
    returnTime: '',
  });

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
      <div className="booking-form-container">
        <h2>Bạn muốn thuê xe?</h2>
        <form className="booking-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="location">Khu vực</label>
            <select
              id="location"
              name="location"
              value={form.location}
              onChange={handleChange}
              required
            >
              <option value="">Chọn khu vực</option>
              <option value="Hà Nội">Hà Nội</option>
              <option value="Hồ Chí Minh">Hồ Chí Minh</option>
              <option value="Đà Nẵng">Đà Nẵng</option>
              <option value="Cần Thơ">Cần Thơ</option>
              <option value="Hải Phòng">Hải Phòng</option>
              <option value="Nha Trang">Nha Trang</option>
              <option value="Huế">Huế</option>
              <option value="Khác">Khác</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="pickupDate">Thời gian nhận xe</label>
            <input
              type="date"
              id="pickupDate"
              name="pickupDate"
              value={form.pickupDate}
              onChange={handleChange}
              required
            />
            <input
              type="time"
              id="pickupTime"
              name="pickupTime"
              value={form.pickupTime}
              onChange={handleChange}
              required
              style={{ marginTop: '8px' }}
            />
          </div>
          <div className="form-group">
            <label htmlFor="returnDate">Thời gian trả xe</label>
            <input
              type="date"
              id="returnDate"
              name="returnDate"
              value={form.returnDate}
              onChange={handleChange}
              required
            />
            <input
              type="time"
              id="returnTime"
              name="returnTime"
              value={form.returnTime}
              onChange={handleChange}
              required
              style={{ marginTop: '8px' }}
            />
          </div>
          <button type="submit" className="submit-button">Tìm Xe giá tốt</button>
        </form>
      </div>
    </div>
  );
};

export default HomeContent;