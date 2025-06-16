import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Modal, Button, List, message } from 'antd';
import 'antd/dist/reset.css';
import RentalForm from './RentalForm';
import { GiGearStickPattern } from "react-icons/gi";
import './viewCarDetail.css';
import { TbAutomaticGearboxFilled } from "react-icons/tb";
import { FaGasPump } from "react-icons/fa";
import { BsEvStationFill } from "react-icons/bs";
import { BsFillFuelPumpDieselFill } from "react-icons/bs";

const ViewCarDetail = () => {
  const { licensePlate } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contract, setContract] = useState(null);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }
  ]);
  const [allCars, setAllCars] = useState([]);
  const [carFilter, setCarFilter] = useState('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showRentalForm, setShowRentalForm] = useState(false);
  const carsPerPage = 3;
  const [mainImage, setMainImage] = useState('');
  const [otherImages, setOtherImages] = useState([]);
  const [carContracts, setCarContracts] = useState({});

  // Đặt filteredCars lên trên các useEffect để tránh lỗi ReferenceError
  const filteredCars = allCars.filter(item => {
    if (!car) return false;
    if (item.licensePlate === car.licensePlate) return false;
    if (carFilter === 'brand') return item.brand === car.brand;
    if (carFilter === 'type') return item.type === car.type;
    return true;
  });

  useEffect(() => {
    axios.get(`http://localhost:8080/api/cars/${licensePlate}`)
      .then(res => {
        setCar(res.data);
        setMainImage(res.data.mainImage);
        setOtherImages(res.data.otherImages || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Không tìm thấy xe');
        setLoading(false);
      });

    // Fetch hợp đồng gần nhất của xe
    axios.get(`http://localhost:8080/api/contracts/by-car/${licensePlate}`)
      .then(res => setContract(res.data))
      .catch(() => setContract(null));
  }, [licensePlate]);

  useEffect(() => {
    axios.get('http://localhost:8080/api/cars')
      .then(res => setAllCars(res.data))
      .catch(() => setAllCars([]));
  }, []);

  useEffect(() => {
    const fetchContracts = async () => {
      const newContracts = {};
      await Promise.all(filteredCars.map(async (item) => {
        try {
          const res = await axios.get(`http://localhost:8080/api/contracts/by-car/${item.licensePlate}`);
          newContracts[item.licensePlate] = res.data;
        } catch {
          newContracts[item.licensePlate] = null;
        }
      }));
      setCarContracts(newContracts);
    };
    if (filteredCars.length > 0) fetchContracts();
  }, [filteredCars]);

  const handleSelectCar = (selectedCar) => {
    navigate(`/cars/${selectedCar.licensePlate}`);
    setContract(null);
    setMainImage(selectedCar.mainImage);
    setOtherImages(selectedCar.otherImages || []);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleThumbnailClick = (img, idx) => {
    const newOtherImages = [...otherImages];
    newOtherImages[idx] = mainImage;
    setMainImage(img);
    setOtherImages(newOtherImages);
  };

  const maxIndex = Math.max(0, filteredCars.length - carsPerPage);
  const translateX = -(currentIndex * (240 + 24)); // 240px width + 24px gap

  const handlePrev = () => setCurrentIndex(idx => Math.max(0, idx - 1));
  const handleNext = () => setCurrentIndex(idx => Math.min(maxIndex, idx + 1));

  useEffect(() => { setCurrentIndex(0); }, [carFilter, allCars, car]);

  const handleRentClick = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      message.warning('Vui lòng đăng nhập để thuê xe');
      return;
    }
    setShowRentalForm(true);
  };

  const handleRentalSuccess = (rentalData) => {
    message.success('Đặt xe thành công!');
    setShowRentalForm(false);
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>{error}</div>;
  if (!car) return <div>Không có dữ liệu xe</div>;

  return (
    <div className="car-detail-page ">
      <div className="row car-detail-main container-fluid">
        <div className="col-12 col-md-8 car-detail-images ">
          <div className="car-detail-main-image">
            <img src={mainImage} alt="car" />
          </div>
          {otherImages && otherImages.length > 0 && (
            <div className="car-detail-thumbnails">
              {otherImages.slice(0, 3).map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`car-thumb-${idx + 1}`}
                  onClick={() => handleThumbnailClick(img, idx)}
                  style={{ cursor: 'pointer' }}
                />
              ))}
            </div>
          )}
          <div className="rental-rules">
            <h1>Quy định thuê xe</h1>
            <ol>
              <li>Người thuê xe phải có giấy phép lái xe hợp lệ và còn thời hạn.</li>
              <li>Xe chỉ được sử dụng cho mục đích cá nhân, không được sử dụng để vận chuyển hàng hóa hoặc cho thuê lại.</li>
              <li>Người thuê chịu trách nhiệm bảo quản xe và bồi thường nếu có hư hỏng do lỗi cá nhân.</li>
              <li>Thời gian thuê và trả xe phải đúng theo hợp đồng đã ký. Quá hạn sẽ bị tính thêm phí.</li>
            </ol>

          </div>
          <div className="same-car">
            <div className="same-car-filter">
              <button onClick={() => setCarFilter('all')} className={carFilter==='all' ? 'active' : ''}>Tất cả</button>
              <button onClick={() => setCarFilter('brand')} className={carFilter==='brand' ? 'active' : ''}>Cùng hãng</button>
              <button onClick={() => setCarFilter('type')} className={carFilter==='type' ? 'active' : ''}>Cùng loại</button>
            </div>
            <div className="same-car-slider-wrapper">
              {filteredCars.length > carsPerPage && (
                <button className="same-car-arrow left" onClick={handlePrev} disabled={currentIndex === 0}>&lt;</button>
              )}
              <div className="same-car-list slide" style={{ transform: `translateX(${translateX}px)` }}>
                {filteredCars.length === 0 && <div>Không có xe tương tự</div>}
                {filteredCars.map(item => (
                  <div className="same-car-card" key={item.licensePlate} onClick={() => handleSelectCar(item)} style={{ cursor: 'pointer' }}>
                    <div className="same-car-image-wrapper">
                      <img src={item.mainImage} alt={item.model} className="same-car-image" />
                      <div className="same-car-info-overlay">
                        <div className="same-car-title">{item.brand} {item.model}</div>
                        <div className="same-car-specs">
                          <span>{item.seats} chỗ</span>
                          <span style={{margin: '0 6px', color: '#fff'}}>|</span>
                          <span>
                            {item.transmission === 'manual' ? <GiGearStickPattern className="same-car-icon"/> : <TbAutomaticGearboxFilled className="same-car-icon"/>}
                          </span>
                          <span style={{margin: '0 6px', color: '#fff'}}>|</span>
                          <span>
                            {item.fuelType === 'gasoline' || item.fuelType === 'hybrid' ? <FaGasPump className="same-car-icon"/> :
                              item.fuelType === 'diesel' ? <BsFillFuelPumpDieselFill className="same-car-icon"/> :
                              item.fuelType === 'electric' ? <BsEvStationFill className="same-car-icon"/> : null}
                            {item.fuelType === 'electric' ? ` ${item.fuelConsumption}kWh` : ` ${item.fuelConsumption}L`}
                          </span>
                        </div>
                        <div className="same-car-specs">
                          <span style={{color: '#ffd700'}}>
                            {carContracts[item.licensePlate]?.pricePerDay
                              ? `${carContracts[item.licensePlate].pricePerDay.toLocaleString()} VNĐ/ngày`
                              : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {filteredCars.length > carsPerPage && (
                <button className="same-car-arrow right" onClick={handleNext} disabled={currentIndex >= maxIndex}>&gt;</button>
              )}
            </div>
          </div>
        </div>
        <div className="col-12 col-md-3 car-detail-info">
          <div className="car-detail-info-header">
            <h2>{car.brand} {car.model}</h2>
            <p><b>Năm:</b> {car.year}</p>
            <p><b>Số chỗ ngồi:</b> {car.seats}</p>
            <p><b>Hộp số:</b> {car.transmission === 'manual' ? 'Số sàn' : 'Số tự động'}</p>
            <p><b>Nhiên liệu:</b> {
              car.fuelType === 'gasoline' ? 'Xăng' :
                car.fuelType === 'diesel' ? 'Dầu' :
                  car.fuelType === 'electric' ? 'Điện' :
                    car.fuelType === 'hybrid' ? 'Hybrid' : car.fuelType
            }</p>
            <p><b>Mức tiêu thụ:</b> {car.fuelConsumption} lít/100km</p>
            <p><b>Địa điểm:</b> {car.location}</p>
            <p><b>Mô tả:</b> {car.description}</p>
          </div>
          <div className="car-detail-info-footer">
            {contract && (
              <>
                <p><b>Giá:</b> {contract.pricePerDay?.toLocaleString()} VNĐ/ngày</p>
                <p><b>Deposit:</b> {contract.deposit?.toLocaleString()} VNĐ</p>
                </>
            )}
            <button className="btn-rent-car" onClick={handleRentClick}>Thuê xe</button>
            <div className="car-detail-rental-papers">
              <div className="car-rental-papers">
                <h3>Ưu điểm khi thuê xe</h3>
                <p>Nhận xe thuận tiện</p>
                <p>Thanh toán nhanh chóng</p>
                <p>Thủ tục đơn giản</p>
                <p>Hỗ trợ 24/7</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {showRentalForm && (
        <RentalForm
          visible={showRentalForm}
          onClose={() => setShowRentalForm(false)}
          car={car}
          user={JSON.parse(localStorage.getItem('user'))}
          dateRange={dateRange}
          contract={contract}
          onSuccess={handleRentalSuccess}
        />
      )}
    </div>
  );
};

export default ViewCarDetail;
