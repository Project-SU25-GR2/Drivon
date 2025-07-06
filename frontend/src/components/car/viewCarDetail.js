import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { Modal, Button, List, message, Rate, Avatar, Divider, Pagination, Slider } from 'antd';
import 'antd/dist/reset.css';
import RentalForm from './RentalForm';
import { GiGearStickPattern } from "react-icons/gi";
import './viewCarDetail.css';
import { TbAutomaticGearboxFilled } from "react-icons/tb";
import { FaGasPump, FaCalendarAlt, FaUserFriends, FaCogs, FaRoad, FaMapMarkerAlt, FaInfoCircle } from "react-icons/fa";
import { BsEvStationFill } from "react-icons/bs";
import { BsFillFuelPumpDieselFill } from "react-icons/bs";
import Loader from '../others/loader';
import { useCarData } from '../../contexts/CarDataContext';
import { API_URL } from '../../api/configApi';
const ViewCarDetail = () => {
  const { licensePlate } = useParams();
  const navigate = useNavigate();
  const { carsData, getCarByLicensePlate, fetchCarsData } = useCarData();
  
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
  const [showRentalForm, setShowRentalForm] = useState(false);
  const carsPerPage = 3;
  const [mainImage, setMainImage] = useState('');
  const [otherImages, setOtherImages] = useState([]);
  const [carContracts, setCarContracts] = useState({});
  const [ownerInfo, setOwnerInfo] = useState(null);

  // State cho modal xem ảnh
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [lastTranslate, setLastTranslate] = useState({ x: 0, y: 0 });
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  // State cho dữ liệu đánh giá từ API
  const [reviewsData, setReviewsData] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingCounts: {},
    reviews: []
  });
  const [reviewsLoading, setReviewsLoading] = useState(true);

  // State cho modal xem tất cả đánh giá
  const [showAllReviewsModal, setShowAllReviewsModal] = useState(false);
  const [allReviewsFilter, setAllReviewsFilter] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;

  // Lấy 2 đánh giá nổi bật: ưu tiên 5 sao, nếu không có thì lấy 2 đánh giá sao bất kỳ (cao nhất trước)
  const topHighlightReviews = (() => {
    const fiveStars = reviewsData.reviews.filter(review => review.rating === 5);
    if (fiveStars.length > 0) {
      return fiveStars.slice(0, 2);
    }
    // Nếu không có 5 sao, lấy 2 đánh giá sao cao nhất còn lại
    const sorted = [...reviewsData.reviews].sort((a, b) => b.rating - a.rating);
    return sorted.slice(0, 2);
  })();

  // Lọc đánh giá cho modal
  const allReviewsFiltered = allReviewsFilter === 0 
    ? reviewsData.reviews 
    : reviewsData.reviews.filter(review => review.rating === allReviewsFilter);

  // Tính toán phân trang cho modal
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = allReviewsFiltered.slice(indexOfFirstReview, indexOfLastReview);

  // Đặt filteredCars lên trên các useEffect để tránh lỗi ReferenceError
  const filteredCars = allCars.filter(item => {
    if (!car) return false;
    if (item.licensePlate === car.licensePlate) return false;
    if (carFilter === 'brand') return item.brand === car.brand;
    if (carFilter === 'type') return item.type === car.type;
    return true;
  });

  useEffect(() => {
    // Fetch cars data using context first
    const loadCarData = async () => {
      try {
        await fetchCarsData();
      } catch (error) {
        console.error('Error loading cars data:', error);
      }
    };
    loadCarData();
  }, [fetchCarsData]);

  useEffect(() => {
    // Try to get car from context first
    const carFromContext = getCarByLicensePlate(licensePlate);
    
    if (carFromContext) {
      // Car found in context, use it
      setCar(carFromContext);
      setMainImage(carFromContext.mainImage);
      setOtherImages(carFromContext.otherImages || []);
      setContract(carFromContext.contract);
      setReviewsData(carFromContext.reviewStats);
      setReviewsLoading(false);
      setLoading(false);
      
      // Set owner info from contract data
      if (carFromContext.contract) {
        setOwnerInfo({
          userId: carFromContext.contract.customerId,
          fullName: carFromContext.contract.name,
          email: carFromContext.contract.email,
          phone: carFromContext.contract.phone
        });
      }
    } else {
      // Car not found in context, fetch individually
      axios.get(`${API_URL}/cars/${licensePlate}`)
        .then(res => {
          console.log('Car data:', res.data);
          setCar(res.data);
          setMainImage(res.data.mainImage);
          setOtherImages(res.data.otherImages || []);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching car:', error);
          setError('Không tìm thấy xe');
          setLoading(false);
        });

      // Fetch hợp đồng gần nhất của xe
      axios.get(`${API_URL}/contracts/by-car/${licensePlate}`)
        .then(res => {
          console.log('Contract data:', res.data);
          setContract(res.data);
          // Set owner info from contract data
          if (res.data) {
            setOwnerInfo({
              userId: res.data.customerId,
              fullName: res.data.name,
              email: res.data.email,
              phone: res.data.phone
            });
          }
        })
        .catch(error => {
          console.error('Error fetching contract:', error);
          setContract(null);
        });

      // Fetch reviews
      setReviewsLoading(true);
      axios.get(`${API_URL}/reviews/car/${licensePlate}`)
        .then(res => {
          setReviewsData(res.data);
          setReviewsLoading(false);
        })
        .catch(error => {
          console.error('Error fetching reviews:', error);
          setReviewsLoading(false);
        });
    }
  }, [licensePlate, carsData, getCarByLicensePlate]);

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
      axios.get(`${API_URL}/promotions`)
        .then(res => setCouponList(res.data))
        .catch(() => setCouponList([]));
    }
  }, [showCouponModal]);

  useEffect(() => {
    axios.get(`${API_URL}/cars`)
      .then(res => setAllCars(res.data))
      .catch(() => setAllCars([]));
  }, []);

  useEffect(() => {
    const fetchContracts = async () => {
      // Lấy danh sách xe cần fetch contract (chưa có trong carContracts)
      const carsToFetch = filteredCars.filter(item => !carContracts[item.licensePlate]);
      if (carsToFetch.length === 0) return; // Không có xe mới, không setState

      const newContracts = {};
      await Promise.all(carsToFetch.map(async (item) => {
        try {
          const res = await axios.get(`${API_URL}/contracts/by-car/${item.licensePlate}`);
          newContracts[item.licensePlate] = res.data;
        } catch {
          newContracts[item.licensePlate] = null;
        }
      }));
      // Chỉ setCarContracts nếu có contract mới
      if (Object.keys(newContracts).length > 0) {
        setCarContracts(prev => ({ ...prev, ...newContracts }));
      }
    };
    if (filteredCars.length > 0) fetchContracts();
    // eslint-disable-next-line
  }, [filteredCars, carContracts]);

  useEffect(() => {
    if (zoomLevel === 1) {
      setTranslate({ x: 0, y: 0 });
      setLastTranslate({ x: 0, y: 0 });
    }
  }, [zoomLevel]);

  const handleApplyCoupon = (coupon) => {
    if (selectedCoupon && selectedCoupon.code === coupon.code) {
      setSelectedCoupon(null);
      message.info('Đã bỏ áp dụng mã khuyến mãi');
    } else {
      setSelectedCoupon(coupon);
      message.success(`Đã áp dụng mã: ${coupon.code}`);
    }
  };

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

  // Hàm xử lý double click vào ảnh chính
  const handleMainImageDoubleClick = () => {
    setSelectedImage(mainImage);
    setShowImageModal(true);
  };

  // Hàm xử lý double click vào thumbnail
  const handleThumbnailDoubleClick = (img) => {
    setSelectedImage(img);
    setShowImageModal(true);
  };

  // Hàm đóng modal ảnh
  const handleCloseImageModal = () => {
    setShowImageModal(false);
    setSelectedImage('');
    setZoomLevel(1);
    setTranslate({ x: 0, y: 0 });
    setLastTranslate({ x: 0, y: 0 });
    setIsPanning(false);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 1));
  };

  const handleMouseDown = (e) => {
    if (zoomLevel <= 1) return;
    e.preventDefault();
    setStartPan({ x: e.clientX, y: e.clientY });
    setLastTranslate({ ...translate });
    setIsPanning(true);
  };

  const handleMouseMove = (e) => {
    if (!isPanning) return;
    e.preventDefault();
    const dx = e.clientX - startPan.x;
    const dy = e.clientY - startPan.y;
    setTranslate({
      x: lastTranslate.x + dx,
      y: lastTranslate.y + dy,
    });
  };

  const handleMouseUpOrLeave = () => {
    if (isPanning) {
      setIsPanning(false);
    }
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
    // You can add additional logic here, such as redirecting to a confirmation page
  };

  const handleContactOwner = () => {
    console.log('Contact owner clicked');
    const user = JSON.parse(localStorage.getItem('user'));
    console.log('Current user:', user);
    console.log('Owner info:', ownerInfo);

    if (!user) {
      message.warning('Vui lòng đăng nhập để liên hệ với chủ xe');
      navigate('/auth');
      return;
    }

    if (!ownerInfo) {
      message.error('Không thể lấy thông tin chủ xe');
      return;
    }

    // Kiểm tra nếu người dùng đang cố gắng liên hệ với chính họ
    if (user.userId === ownerInfo.userId) {
      message.warning('Bạn không thể liên hệ với chính mình');
      return;
    }

    // Tạo tin nhắn mặc định
    const defaultMessage = `Xin chào, tôi quan tâm đến xe ${car.brand} ${car.model} của bạn`;

    console.log('Navigating to messages with:', {
      selectedUser: {
        id: ownerInfo.userId,
        name: ownerInfo.fullName,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(ownerInfo.fullName)}&background=random`,
        lastMessage: defaultMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      initialMessage: defaultMessage
    });

    // Điều hướng đến trang messages với thông tin chủ xe
    navigate('/messages', { 
      state: { 
        selectedUser: {
          id: ownerInfo.userId,
          name: ownerInfo.fullName,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(ownerInfo.fullName)}&background=random`,
          lastMessage: defaultMessage,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        initialMessage: defaultMessage
      }
    });
  };


  if (loading) return <div className="loading"><Loader /></div>;

  // Hàm xử lý mở modal
  const handleShowAllReviews = () => {
    setShowAllReviewsModal(true);
  };

  // Hàm xử lý đóng modal
  const handleCloseAllReviews = () => {
    setShowAllReviewsModal(false);
  };

  if (loading) return <div>Đang tải...</div>;

  if (error) return <div>{error}</div>;
  if (!car) return <div>Không có dữ liệu xe</div>;

  return (
    <div className="car-detail-page ">
      <div className="row car-detail-main container-fluid">
        <div className="col-12 col-md-7 car-detail-images ">
          <div className="car-detail-main-image">
            <img
              src={mainImage}
              alt="car"
              onDoubleClick={handleMainImageDoubleClick}
              style={{ cursor: 'pointer' }}
            />
          </div>
          {otherImages && otherImages.length > 0 && (
            <div className="car-detail-thumbnails">
              {otherImages.slice(0, 3).map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`car-thumb-${idx + 1}`}
                  onClick={() => handleThumbnailClick(img, idx)}
                  onDoubleClick={() => handleThumbnailDoubleClick(img)}
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

          {/* Phần đánh giá */}
          <div className="car-reviews">
            <h1>Đánh giá từ khách hàng</h1>
            
            {/* Tổng quan đánh giá */}
            <div className="reviews-overview">
              <div className="overview-left">
                <div className="average-rating">
                  <div className="rating-number">{reviewsData.averageRating}/5</div>
                  <div className="rating-stars">
                    <Rate disabled allowHalf value={reviewsData.averageRating} />
                  </div>
                  <div className="total-reviews">{reviewsData.totalReviews} đánh giá</div>
                </div>
              </div>
              
              <div className="overview-right">
                <div className="rating-bars">
                  {[5, 4, 3, 2, 1].map(star => (
                    <div key={star} className="rating-bar-item">
                      <span className="star-label">{star} sao</span>
                      <div className="rating-bar">
                        <div 
                          className="rating-bar-fill" 
                          style={{ 
                            width: `${reviewsData.totalReviews > 0 ? (reviewsData.ratingCounts[star] / reviewsData.totalReviews) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                      <span className="star-count">{reviewsData.ratingCounts[star] || 0}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Divider />

            {/* Danh sách đánh giá nổi bật */}
            <div className="reviews-list">
              {reviewsLoading ? (
                <p>Đang tải đánh giá...</p>
              ) : topHighlightReviews.length === 0 ? (
                <div className="no-reviews">
                  <p>Chưa có đánh giá nào nổi bật.</p>
                </div>
              ) : (
                topHighlightReviews.map(review => (
                  <div key={review.id} className="review-item">
                    <div className="review-header">
                      <div className="reviewer-info">
                        <Avatar src={review.userAvatar} size={40} />
                        <div className="reviewer-details">
                          <div className="reviewer-name-date">
                            <span className="reviewer-name">{review.userName}</span>
                            <span className="review-date">{new Date(review.date).toLocaleDateString('vi-VN')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="review-rating">
                        <Rate disabled defaultValue={review.rating} />
                      </div>
                    </div>
                    <div className="review-content">
                      <p className="review-comment">{review.comment}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Nút xem thêm đánh giá */}
            <div className="reviews-footer">
              <Button type="primary" size="large" style={{ marginTop: '20px' }} onClick={handleShowAllReviews} disabled={reviewsLoading}>
                Xem tất cả đánh giá ({reviewsData.totalReviews})
              </Button>
            </div>
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
                          </span>
                          <span style={{margin: '0 6px', color: '#fff'}}>|</span>
                          <span>
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
        <div className="col-12 col-md-4 car-detail-info">
          <div className="car-detail-info-header">
            <h2>{car.brand} {car.model}</h2>
            <div className="car-info-row">
              <span className="car-info-icon"><FaCalendarAlt /></span>
              <span className="car-info-label">Năm sản xuất</span>
              <span className="car-info-value car-info-badge">{car.year}</span>
            </div>
            <div className="car-info-row">
              <span className="car-info-icon"><FaUserFriends /></span>
              <span className="car-info-label">Số chỗ ngồi</span>
              <span className="car-info-value">{car.seats} chỗ</span>
            </div>
            <div className="car-info-row">
              <span className="car-info-icon"><FaCogs /></span>
              <span className="car-info-label">Hộp số</span>
              <span className="car-info-value">{car.transmission === 'manual' ? 'Số sàn' : 'Số tự động'}</span>
            </div>
            <div className="car-info-row">
              <span className="car-info-icon"><FaGasPump /></span>
              <span className="car-info-label">Nhiên liệu</span>
              <span className="car-info-value">{
                car.fuelType === 'gasoline' ? 'Xăng' :
                car.fuelType === 'diesel' ? 'Dầu' :
                car.fuelType === 'electric' ? 'Điện' :
                car.fuelType === 'hybrid' ? 'Hybrid' : car.fuelType
              }</span>
            </div>
            <div className="car-info-row">
              <span className="car-info-icon"><FaRoad /></span>
              <span className="car-info-label">Mức tiêu thụ</span>
              <span className="car-info-value car-info-badge car-info-badge-red">{car.fuelConsumption} lít/100km</span>
            </div>
            <div className="car-info-row">
              <span className="car-info-icon"><FaMapMarkerAlt /></span>
              <span className="car-info-label">Địa điểm</span>
              <span className="car-info-value">{car.location}</span>
            </div>
            <div className="car-info-row car-info-desc">
              <span className="car-info-icon"><FaInfoCircle /></span>
              <span className="car-info-label">Mô tả:</span>
              <span className="car-info-value">{car.description}</span>
            </div>
          </div>
          <div className="car-detail-info-footer">
            {contract && (
              <>
                <div className="car-price-row">
                  <span className="car-price-label">Giá: </span>
                  <span className="car-price-value">{contract.pricePerDay?.toLocaleString()}</span>
                  <span className="car-price-unit">VNĐ/ngày</span>
                </div>
                <div className="car-price-row">
                  <span className="car-price-label">Deposit: </span>
                  <span className="car-price-value" style={{fontSize: '1.2rem'}}>{contract.deposit?.toLocaleString()}</span>
                  <span className="car-price-unit">VNĐ</span>
                </div>
              </>
            )}
            <button 
              className="btn-contact-owner" 
              onClick={handleContactOwner}
              
            >
              Liên hệ với chủ xe
            </button>
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

      <Modal
        title={<h2 style={{ textAlign: 'center', marginBottom: '0' }}>Đánh giá từ khách hàng</h2>}
        open={showAllReviewsModal}
        onCancel={handleCloseAllReviews}
        footer={null}
        width={800}
        centered
        destroyOnClose
      >
        <div className="reviews-filter">
          <div className="filter-buttons">
            <button
              className={`filter-btn ${allReviewsFilter === 0 ? 'active' : ''}`}
              onClick={() => { setAllReviewsFilter(0); setCurrentPage(1); }}
            >
              Tất cả ({reviewsData.totalReviews})
            </button>
            {[5, 4, 3, 2, 1].map(star => (
              <button
                key={star}
                className={`filter-btn ${allReviewsFilter === star ? 'active' : ''}`}
                onClick={() => { setAllReviewsFilter(star); setCurrentPage(1); }}
              >
                {star} sao ({reviewsData.ratingCounts[star] || 0})
              </button>
            ))}
          </div>
        </div>

        <div className="reviews-list">
          {currentReviews.length === 0 ? (
            <div className="no-reviews">
              <p>Không có đánh giá nào cho mức {allReviewsFilter > 0 ? `${allReviewsFilter} sao` : ''}</p>
            </div>
          ) : (
            currentReviews.map(review => (
              <div key={review.id} className="review-item">
                <div className="review-header">
                  <div className="reviewer-info">
                    <Avatar src={review.userAvatar} size={40} />
                    <div className="reviewer-details">
                      <div className="reviewer-name-date">
                        <span className="reviewer-name">{review.userName}</span>
                        <span className="review-date">{new Date(review.date).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="review-rating">
                    <Rate disabled defaultValue={review.rating} />
                  </div>
                </div>
                <div className="review-content">
                  <p className="review-comment">{review.comment}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <Pagination
          current={currentPage}
          pageSize={reviewsPerPage}
          total={allReviewsFiltered.length}
          onChange={(page) => setCurrentPage(page)}
          style={{ textAlign: 'center', marginTop: '2rem' }}
          showSizeChanger={false}
        />
      </Modal>

      <Modal
        title={<h2 style={{ textAlign: 'center', marginBottom: '0' }}>Xem ảnh xe</h2>}
        open={showImageModal}
        onCancel={handleCloseImageModal}
        footer={null}
        width={900}
        centered
        destroyOnClose
        style={{ top: 20 }}
        bodyStyle={{ padding: 0, background: '#fff' }}
      >
        <div
          className="image-modal-content"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          style={{ cursor: zoomLevel > 1 ? (isPanning ? 'grabbing' : 'grab') : 'default' }}
        >
          <div
            className="panning-container"
            style={{ transform: `translate(${translate.x}px, ${translate.y}px)` }}
          >
            <img
              src={selectedImage}
              alt="Selected car image"
              style={{
                width: '100%',
                transform: `scale(${zoomLevel})`,
                transition: isPanning ? 'none' : 'transform 0.1s linear',
              }}
            />
          </div>
        </div>
        <div className="zoom-controls">
          <span className="zoom-label">Zoom</span>
          <Button onClick={handleZoomOut} disabled={zoomLevel <= 1} size="small">-</Button>
          <Slider
            min={1}
            max={3}
            step={0.1}
            value={zoomLevel}
            onChange={setZoomLevel}
            style={{ flex: 1, margin: '0 15px' }}
          />
          <Button onClick={handleZoomIn} disabled={zoomLevel >= 3} size="small">+</Button>
        </div>
      </Modal>
    </div>
  );
};

export default ViewCarDetail;
