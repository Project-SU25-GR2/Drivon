import React, { useState } from 'react';

const RentCar = () => {
  const [filters, setFilters] = useState({
    location: '',
    brand: '',
  });

  // Placeholder: Replace with API call to fetch cars
  const cars = [];

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="rent-car-page" style={{ padding: '2rem' }}>
      <h2>Thuê xe</h2>
      <div className="filter-bar" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <select name="location" value={filters.location} onChange={handleChange}>
          <option value="">Tất cả khu vực</option>
          <option value="Hà Nội">Hà Nội</option>
          <option value="Hồ Chí Minh">Hồ Chí Minh</option>
          <option value="Đà Nẵng">Đà Nẵng</option>
          <option value="Cần Thơ">Cần Thơ</option>
          <option value="Hải Phòng">Hải Phòng</option>
          <option value="Nha Trang">Nha Trang</option>
          <option value="Huế">Huế</option>
          <option value="Khác">Khác</option>
        </select>
        <select name="brand" value={filters.brand} onChange={handleChange}>
          <option value="">Tất cả hãng xe</option>
          <option value="Toyota">Toyota</option>
          <option value="Honda">Honda</option>
          <option value="Mazda">Mazda</option>
          <option value="Kia">Kia</option>
          <option value="Hyundai">Hyundai</option>
          <option value="Ford">Ford</option>
          <option value="VinFast">VinFast</option>
        </select>
      </div>
      <div className="car-list">
        {/* Placeholder for car cards */}
        {cars.length === 0 ? (
          <p>Chưa có xe nào cho thuê.</p>
        ) : (
          <div className="car-grid">
            {/* Map car data here */}
          </div>
        )}
      </div>
    </div>
  );
};

export default RentCar; 