import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './RentCar.css';
import { Link, useLocation } from 'react-router-dom';
import { FaCog, FaGasPump, FaRoad, FaWrench, FaMapMarkerAlt, FaChair, FaStar, FaCarSide, FaBrain } from 'react-icons/fa';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const RentCar = () => {
  const location = useLocation();
  const [filters, setFilters] = useState({
    location: '',
    brand: '',
    type: '',
    minPrice: '',
    maxPrice: '',
  });

  // Thêm state cho price range slider
  const [priceRange, setPriceRange] = useState([0, 5000000]);
  const [search, setSearch] = useState("");
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [carContracts, setCarContracts] = useState({});

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const locationParam = params.get('location');
    const minPriceParam = params.get('minPrice');
    const maxPriceParam = params.get('maxPrice');

    if (locationParam || minPriceParam || maxPriceParam) {
      const newMinPrice = minPriceParam ? parseInt(minPriceParam) : 0;
      const newMaxPrice = maxPriceParam ? parseInt(maxPriceParam) : 5000000;
      
      setFilters(prevFilters => ({
        ...prevFilters,
        location: locationParam || '',
        minPrice: newMinPrice.toString(),
        maxPrice: newMaxPrice.toString(),
      }));
      
      // Cập nhật price range slider
      setPriceRange([newMinPrice, newMaxPrice]);
      
      if(locationParam) setSearch(locationParam);
    }
    fetchCars();
  }, [location.search]);

  const fetchCars = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/cars/active-lease');
      setCars(response.data);
      
      // Fetch contracts for each car
      const contracts = {};
      for (const car of response.data) {
        try {
          const contractResponse = await axios.get(`http://localhost:8080/api/contracts/by-car/${car.licensePlate}`);
          contracts[car.licensePlate] = contractResponse.data;
        } catch (err) {
          console.error(`Error fetching contract for car ${car.licensePlate}:`, err);
        }
      }
      setCarContracts(contracts);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch cars');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Thêm hàm xử lý thay đổi price range slider
  const handleSliderChange = (value) => {
    setPriceRange(value);
    setFilters({
      ...filters,
      minPrice: value[0].toString(),
      maxPrice: value[1].toString()
    });
  };

  // Thêm hàm chuyển đổi fuelType sang tiếng Việt
  function getFuelTypeVi(fuelType) {
    switch (fuelType) {
      case 'gasoline': return 'xăng';
      case 'diesel': return 'dầu';
      case 'electric': return 'điện';
      case 'hybrid': return 'hybrid';
      default: return fuelType;
    }
  }

  const filteredCars = cars.filter(car => {
    if (car.status !== 'available') return false;
    const matchesSearch = car.brand.toLowerCase().includes(search.toLowerCase()) ||
                         car.model.toLowerCase().includes(search.toLowerCase()) ||
                         car.location.toLowerCase().includes(search.toLowerCase())||
                         getFuelTypeVi(car.fuelType).includes(search.toLowerCase())||
                         car.fuelType.toLowerCase().includes(search.toLowerCase())||
                         car.transmission.toLowerCase().includes(search.toLowerCase())||
                         car.seats.toString().includes(search.toLowerCase())||
                         car.year.toString().includes(search.toLowerCase());
    const matchesBrand = !filters.brand || car.brand === filters.brand;
    const matchesSeat = !filters.seat || car.seats.toString() === filters.seat;
    const matchesFuel = !filters.fuel || car.fuelType === filters.fuel;
    const matchesType = !filters.type || (car.type && car.type.toLowerCase() === filters.type.toLowerCase());
    
    const price = carContracts[car.licensePlate]?.pricePerDay;
    const matchesPrice = price && price >= priceRange[0] && price <= priceRange[1];

    return matchesSearch && matchesBrand && matchesSeat && matchesFuel && matchesType && matchesPrice;
  });

  if (loading) return <div className="loading"><div className="loader"></div></div>;
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
        <div className="price-filter-container">
          <div className="price-range-display">
            <span>Giá: {priceRange[0].toLocaleString('vi-VN')} - {priceRange[1].toLocaleString('vi-VN')} VNĐ</span>
          </div>
          <Slider
            range
            min={0}
            max={5000000}
            step={100000}
            defaultValue={priceRange}
            onChange={handleSliderChange}
            handleStyle={[{ borderColor: '#1890ff' }, { borderColor: '#1890ff' }]}
            trackStyle={[{ backgroundColor: '#1890ff' }]}
            className="price-range-slider"
          />
        </div>
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
        <select name="seat" value={filters.seat} onChange={handleChange} className="filter-select">
          <option value="">Số chỗ</option>
          <option value="2">2</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="7">7</option>
        </select>
        <select name="fuel" value={filters.fuel} onChange={handleChange} className="filter-select">
          <option value="">Nhiên liệu</option>
          <option value="gasoline">Xăng</option>
          <option value="diesel">Dầu</option>
          <option value="electric">Điện</option>
          <option value="hybrid">Hybrid</option>
        </select>
      </div>
      
      <div className="quick-filters">
        <button className="btn-fast-search" onClick={() => setFilters({ ...filters, type: 'suv' })}>SUV</button>
        <button className="btn-fast-search" onClick={() => setFilters({ ...filters, type: 'hatchback' })}>Hatchback</button>
        <button className="btn-fast-search" onClick={() => setFilters({ ...filters, type: 'sedan' })}>Sedan</button>
        <button className="btn-fast-search" onClick={() => setFilters({ ...filters, type: 'mpv' })}>MPV</button>
        <button className="btn-fast-search" onClick={() => setFilters({ ...filters, type: 'pickup' })}>Pickup</button>
        <button className="btn-fast-search" onClick={() => setFilters({ ...filters, type: '' })}>Tất cả</button>
      </div>

      <div className="car-list">
        {filteredCars.length === 0 ? (
          <p>Không tìm thấy xe phù hợp.</p>
        ) : (
          <div className="car-grid">
            {filteredCars.map((car) => (
              <Link to={`/cars/${car.licensePlate}`} key={car.licensePlate} className="car-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="car-image-container">
                  {car.mainImage ? (
                    <img 
                      src={car.mainImage} 
                      alt={`${car.brand} ${car.model}`} 
                      className="car-image"
                    />
                  ) : (
                    <div className="no-image">No Image Available</div>
                  )}
                </div>

                <div className="car-info">
                  <h3 className="car-name">{car.brand} {car.model} {car.year}</h3>
                  <div className="car-specs-grid">
                      <p className="spec-item"><FaCog /> {car.transmission === 'automatic' ? 'Số tự động' : 'Số sàn'}</p>
                      <p className="spec-item"><FaGasPump /> {car.fuelType === 'gasoline' ? 'Xăng' : car.fuelType === 'diesel' ? 'Dầu diesel' : car.fuelType}</p>
                      <p className="spec-item"><FaRoad /> {car.fuelConsumption}l/100km</p>
                      <p className="spec-item"><FaWrench /> Sản xuất {car.year}</p>
                      <p className="spec-item"><FaMapMarkerAlt /> {car.location}</p>
                      <p className="spec-item"><FaChair /> {car.seats} chỗ</p>
                  </div>
                  
                  <div className="rating-trips">
                      <span className="rating-stars"><FaStar /> 5.0</span>
                      <span className="total-trips"><FaCarSide /> 100+ chuyến</span>
                  </div>
                      
                  <div className="car-price">
                      <span className="current-price">
                        {carContracts[car.licensePlate]?.pricePerDay 
                          ? carContracts[car.licensePlate].pricePerDay.toLocaleString('vi-VN') + ' VNĐ/ngày'
                          : 'Liên hệ'}
                      </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RentCar;