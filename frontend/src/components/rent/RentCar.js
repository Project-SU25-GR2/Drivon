import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/RentCar.css';

const RentCar = () => {
  const [filters, setFilters] = useState({
    location: '',
    brand: '',
  });

  const [search, setSearch] = useState("");
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/cars');
      setCars(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch cars');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const filteredCars = cars.filter(car => {
    const matchesSearch = car.brand.toLowerCase().includes(search.toLowerCase()) ||
                         car.model.toLowerCase().includes(search.toLowerCase()) ||
                         car.location.toLowerCase().includes(search.toLowerCase());
    const matchesBrand = !filters.brand || car.brand === filters.brand;
    return matchesSearch && matchesBrand;
  });

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

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
      
      <div className="quick-filters">
        <button className="btn-fast-search">SUV</button>
        <button className="btn-fast-search">Hatchback</button>
        <button className="btn-fast-search">Sedan</button>
        <button className="btn-fast-search">MPV</button>
        <button className="btn-fast-search">Pickup</button>
      </div>

      <div className="car-list">
        {filteredCars.length === 0 ? (
          <p>Không tìm thấy xe phù hợp.</p>
        ) : (
          <div className="car-grid">
            {filteredCars.map((car) => (
              <div key={car.licensePlate} className="car-card">
                <div className="car-image-container">
                  {car.images && car.images.length > 0 ? (
                    <img 
                      src={car.images[0]} 
                      alt={`${car.brand} ${car.model}`} 
                      className="car-image"
                    />
                  ) : (
                    <div className="no-image">No Image Available</div>
                  )}
                </div>
                <div className="car-info">
                  <h3>{car.brand} {car.model}</h3>
                  <p className="car-year">{car.year}</p>
                  <p className="car-location">{car.location}</p>
                  <p className="car-description">{car.description}</p>
                  <div className="car-type">{car.type}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RentCar;