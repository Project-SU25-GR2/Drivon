import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { Modal, Button, List, message } from 'antd';
import 'antd/dist/reset.css';

import './viewCarDetail.css';

const ViewCarDetail = () => {
  const { licensePlate } = useParams();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contract, setContract] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }
  ]);
  const calendarRef = useRef(null);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [couponList, setCouponList] = useState([]);
  const [allCars, setAllCars] = useState([]);
  const [carFilter, setCarFilter] = useState('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const carsPerPage = 3;

  useEffect(() => {
    axios.get(`http://localhost:8080/api/cars/${licensePlate}`)
      .then(res => {
        setCar(res.data);
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
    function handleClickOutside(event) {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target) &&
        event.target.className !== 'bi bi-calendar-range'
      ) {
        setShowCalendar(false);
      }
    }
    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendar]);

  useEffect(() => {
    if (showCouponModal) {
      axios.get('http://localhost:8080/api/promotions')
        .then(res => setCouponList(res.data))
        .catch(() => setCouponList([]));
    }
  }, [showCouponModal]);

  useEffect(() => {
    axios.get('http://localhost:8080/api/cars')
      .then(res => setAllCars(res.data))
      .catch(() => setAllCars([]));
  }, []);

  const handleApplyCoupon = (coupon) => {
    if (selectedCoupon && selectedCoupon.code === coupon.code) {
      setSelectedCoupon(null);
      message.info('Đã bỏ áp dụng mã khuyến mãi');
    } else {
      setSelectedCoupon(coupon);
      message.success(`Đã áp dụng mã: ${coupon.code}`);
    }
  };

  const filteredCars = allCars.filter(item => {
    if (!car) return false;
    if (item.licensePlate === car.licensePlate) return false;
    if (carFilter === 'brand') return item.brand === car.brand;
    if (carFilter === 'type') return item.type === car.type;
    return true;
  });

  const maxIndex = Math.max(0, filteredCars.length - carsPerPage);
  const translateX = -(currentIndex * (240 + 24)); // 240px width + 24px gap

  const handlePrev = () => setCurrentIndex(idx => Math.max(0, idx - 1));
  const handleNext = () => setCurrentIndex(idx => Math.min(maxIndex, idx + 1));

  useEffect(() => { setCurrentIndex(0); }, [carFilter, allCars, car]);

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>{error}</div>;
  if (!car) return <div>Không có dữ liệu xe</div>;

  return (
    <div className="car-detail-page ">
      <div className="row car-detail-main container-fluid">
        <div className="col-12 col-md-8 car-detail-images ">
          <div className="car-detail-main-image">
            <img src={car.images[0]} alt="car" />
          </div>
          {car.images && car.images.length > 1 && (
            <div className="car-detail-thumbnails">
              {car.images.slice(1, 4).map((img, idx) => (
                <img key={idx} src={img} alt={`car-thumb-${idx + 1}`} />
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
                  <div className="same-car-card" key={item.licensePlate}>
                    <div className="same-car-image-wrapper">
                      <img src={item.images && item.images[0]} alt={item.model} className="same-car-image" />
                      <div className="same-car-info-overlay">
                        <div className="same-car-title">{item.brand} {item.model}</div>
                        <div className="same-car-specs">
                          <span>{item.seats} chỗ</span> | <span>{item.transmission === 'manual' ? 'Số sàn' : 'Số tự động'}</span> | <span>{item.fuelType === 'gasoline' ? 'Xăng' : item.fuelType}</span>
                        </div>
                        <div className="same-car-price">{item.pricePerDay ? item.pricePerDay.toLocaleString() : '---'} VNĐ/ngày</div>
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
                <p>
                  <b>Ngày thuê & trả:</b>
                </p>
                <button
                  className='calendar-range-button'
                  onClick={() => setShowCalendar(!showCalendar)}
                  style={{ border: 'none', background: 'none' }}
                >
                  <i className="bi bi-calendar-range"></i>
                </button>
                {dateRange[0].startDate.toLocaleDateString()} - {dateRange[0].endDate.toLocaleDateString()}
                {showCalendar && (
                  <div ref={calendarRef} style={{ position: 'absolute', zIndex: 100 }}>
                    <DateRange
                      editableDateInputs={true}
                      onChange={item => setDateRange([item.selection])}
                      moveRangeOnFirstSelection={false}
                      ranges={dateRange}
                      minDate={new Date()}
                    />
                  </div>
                )}
                <p style={{ margin: '0.5rem 0' }}><b>Tổng tiền:</b> {contract.total ? contract.total.toLocaleString() : '---'} VNĐ</p>
              </>
            )}
            <button className="btn-discount" onClick={() => setShowCouponModal(true)}><i className="bi bi-ticket-perforated-fill"></i>  Mã giảm giá</button>
            <button className="btn-rent-car">Thuê xe</button>
            <div className="car-detail-rental-papers">
              <div className="car-rental-papers">
                <h3>Giấy tờ thuê xe</h3>
                <p>Giấy phép lái xe</p>
                <p>Căn cước công dân || Hộ chiếu</p>
              </div>
            </div>
            <Modal
              title="Chọn mã khuyến mãi"
              open={showCouponModal}
              onCancel={() => setShowCouponModal(false)}
              footer={null}
            >
              <List
                dataSource={couponList}
                renderItem={item => (
                  <List.Item
                    actions={[
                      <Button
                        type={selectedCoupon && selectedCoupon.code === item.code ? 'primary' : 'default'}
                        style={selectedCoupon && selectedCoupon.code === item.code ? { backgroundColor: '#52c41a', borderColor: '#52c41a', color: '#fff' } : {}}
                        disabled={selectedCoupon && selectedCoupon.code !== item.code}
                        onClick={() => handleApplyCoupon(item)}
                      >
                        {selectedCoupon && selectedCoupon.code === item.code ? 'Đã áp dụng' : 'Áp dụng'}
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      title={item.code}
                      description={`Giảm ${item.discount_percent}%`}
                    />
                  </List.Item>
                )}
              />
            </Modal>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ViewCarDetail;
