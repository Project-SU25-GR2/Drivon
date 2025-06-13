import React, { useState } from 'react';
import '../css/RentCar.css';
const RentCar = () => {
  const [filters, setFilters] = useState({
    location: '',
    brand: '',
  });

  const [search, setSearch] = useState("");

  // Placeholder: Replace with API call to fetch cars
  const cars = [];

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="rent-car-page" style={{ padding: '2rem' }}>
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Tìm xe theo tên, địa điểm..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="search-input"
        />
        <select name="price" className="filter-select">
          <option>Giá tiền</option>
          {/* Thêm các option giá nếu cần */}
        </select>
        <select name="brand" value={filters.brand} onChange={handleChange} className="filter-select">
          <option value="">Hãng xe</option>
          <option value="Toyota">Toyota</option>
          <option value="Honda">Honda</option>
          <option value="Mazda">Mazda</option>
          <option value="Kia">Kia</option>
          <option value="Hyundai">Hyundai</option>
          <option value="Ford">Ford</option>
          <option value="VinFast">VinFast</option>
        </select>
        <select name="seat" className="filter-select">
          <option>Số chỗ</option>
          <option>2</option>
          <option>4</option>
          <option>5</option>
          <option>7</option>
        </select>
        <select name="fuel" className="filter-select">
          <option>Nhiên liệu</option>
          {/* Thêm các option nhiên liệu nếu cần */}
        </select>
      </div>
      <div className="fast-search">
        <button className="btn-fast-search">SUV</button>
        <button className="btn-fast-search">Hatchback</button>
        <button className="btn-fast-search">Sedan</button>
        <button className="btn-fast-search">MPV</button>
        <button className="btn-fast-search">Pickup</button>
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