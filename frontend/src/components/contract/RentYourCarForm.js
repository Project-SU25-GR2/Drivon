import React, { useState, useEffect } from 'react';
import axios from 'axios';
import cloudinaryConfig  from '../../config/cloudinary';
import '../css/RentYourCarForm.css';
import { useNavigate } from 'react-router-dom';
import SimpleButton from '../others/SimpleButton';
import { API_URL } from '../../api/configApi';
import { showErrorToast, showSuccessToast } from '../notification/notification';
  const RentYourCarForm = () => {
    const navigate = useNavigate();
    

  const carBrands = [
    "Toyota",
    "Honda",
    "Ford",
    "Chevrolet",
    "Hyundai",
    "Kia",
    "Mazda",
    "Nissan",
    "BMW",
    "Mercedes-Benz",
    "Audi",
    "Lexus",
    "Volkswagen",
    "Subaru",
    "Mitsubishi",
    "Suzuki",
    "VinFast",
    "Other"
  ];
  
  // danh sách tỉnh thành

  const locations = [
    "Hà Nội",
    "TP. Hồ Chí Minh",
    "Đà Nẵng",
    "Hải Phòng",
    "Cần Thơ",
    "An Giang",
    "Bà Rịa - Vũng Tàu",
    "Bắc Giang",
    "Bắc Kạn",
    "Bạc Liêu",
    "Bắc Ninh",
    "Bến Tre",
    "Bình Định",
    "Bình Dương",
    "Bình Phước",
    "Bình Thuận",
    "Cà Mau",
    "Cao Bằng",
    "Đắk Lắk",
    "Đắk Nông",
    "Điện Biên",
    "Đồng Nai",
    "Đồng Tháp",
    "Gia Lai",
    "Hà Giang",
    "Hà Nam",
    "Hà Tĩnh",
    "Hải Dương",
    "Hậu Giang",
    "Hòa Bình",
    "Hưng Yên",
    "Khánh Hòa",
    "Kiên Giang",
    "Kon Tum",
    "Lai Châu",
    "Lâm Đồng",
    "Lạng Sơn",
    "Lào Cai",
    "Long An",
    "Nam Định",
    "Nghệ An",
    "Ninh Bình",
    "Ninh Thuận",
    "Phú Thọ",
    "Phú Yên",
    "Quảng Bình",
    "Quảng Nam",
    "Quảng Ngãi",
    "Quảng Ninh",
    "Quảng Trị",
    "Sóc Trăng",
    "Sơn La",
    "Tây Ninh",
    "Thái Bình",
    "Thái Nguyên",
    "Thanh Hóa",
    "Thừa Thiên Huế",
    "Tiền Giang",
    "Trà Vinh",
    "Tuyên Quang",
    "Vĩnh Long",
    "Vĩnh Phúc",
    "Yên Bái"
  ];

  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: '',
    licensePlate: '',
    location: '',
    description: '',
    type: '',
    seats: '',
    transmission: '',
    fuelType: '',
    fuelConsumption: '',
    images: [],
  });

  const [mainImage, setMainImage] = useState('');
  const [mainPreviewUrl, setMainPreviewUrl] = useState('');
  const [otherImages, setOtherImages] = useState([]);
  const [otherPreviewUrls, setOtherPreviewUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [cavetImages, setCavetImages] = useState([]);
  const [cavetPreviewUrls, setCavetPreviewUrls] = useState([]);
  const [otherDocImages, setOtherDocImages] = useState([]);
  const [otherDocPreviewUrls, setOtherDocPreviewUrls] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleMainImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showErrorToast('Kích thước file không được vượt quá 5MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      showErrorToast('Vui lòng chọn file hình ảnh');
      return;
    }
    setMainPreviewUrl(URL.createObjectURL(file));
    setUploading(true);
    try {
      const formDataImg = new FormData();
      formDataImg.append('file', file);
      formDataImg.append('upload_preset', cloudinaryConfig.uploadPreset);
      formDataImg.append('api_key', cloudinaryConfig.apiKey);
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/upload`;
      const response = await axios.post(cloudinaryUrl, formDataImg);
      setMainImage(response.data.secure_url);
      showSuccessToast('Ảnh chính đã được tải lên thành công');
    } catch (error) {
      showErrorToast('Có lỗi xảy ra khi tải ảnh lên.');
    } finally {
      setUploading(false);
    }
  };

  const handleOtherImagesChange = async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        showErrorToast('Kích thước file không được vượt quá 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        showErrorToast('Vui lòng chọn file hình ảnh');
        return;
      }
    }
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setOtherPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    setUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const formDataImg = new FormData();
        formDataImg.append('file', file);
        formDataImg.append('upload_preset', cloudinaryConfig.uploadPreset);
        formDataImg.append('api_key', cloudinaryConfig.apiKey);
        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/upload`;
        const response = await axios.post(cloudinaryUrl, formDataImg);
        return response.data.secure_url;
      });
      const uploadedUrls = await Promise.all(uploadPromises);
      setOtherImages(prev => [...prev, ...uploadedUrls]);
      showSuccessToast(`${files.length} ảnh đã được tải lên thành công`);
    } catch (error) {
      showErrorToast('Có lỗi xảy ra khi tải ảnh lên.');
    } finally {
      setUploading(false);
    }
  };

  const handleCavetImagesChange = async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        showErrorToast('Kích thước file không được vượt quá 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        showErrorToast('Vui lòng chọn file hình ảnh');
        return;
      }
    }
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setCavetPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    setUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const formDataImg = new FormData();
        formDataImg.append('file', file);
        formDataImg.append('upload_preset', cloudinaryConfig.uploadPreset);
        formDataImg.append('api_key', cloudinaryConfig.apiKey);
        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/upload`;
        const response = await axios.post(cloudinaryUrl, formDataImg);
        return response.data.secure_url;
      });
      const uploadedUrls = await Promise.all(uploadPromises);
      setCavetImages(prev => [...prev, ...uploadedUrls]);
      showSuccessToast(`${files.length} ảnh Cavet đã được tải lên thành công`);
    } catch (error) {
      showErrorToast('Có lỗi xảy ra khi tải ảnh Cavet lên.');
    } finally {
      setUploading(false);
    }
  };

  const handleOtherDocImagesChange = async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        showErrorToast('Kích thước file không được vượt quá 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        showErrorToast('Vui lòng chọn file hình ảnh');
        return;
      }
    }
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setOtherDocPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    setUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const formDataImg = new FormData();
        formDataImg.append('file', file);
        formDataImg.append('upload_preset', cloudinaryConfig.uploadPreset);
        formDataImg.append('api_key', cloudinaryConfig.apiKey);
        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/upload`;
        const response = await axios.post(cloudinaryUrl, formDataImg);
        return response.data.secure_url;
      });
      const uploadedUrls = await Promise.all(uploadPromises);
      setOtherDocImages(prev => [...prev, ...uploadedUrls]);
      showSuccessToast(`${files.length} ảnh giấy tờ khác đã được tải lên thành công`);
    } catch (error) {
      showErrorToast('Có lỗi xảy ra khi tải ảnh giấy tờ khác lên.');
    } finally {
      setUploading(false);
    }
  };

  const removeMainImage = () => {
    setMainImage('');
    setMainPreviewUrl('');
  };
  const removeOtherImage = (index) => {
    setOtherImages(prev => prev.filter((_, i) => i !== index));
    setOtherPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };
  const removeCavetImage = (index) => {
    setCavetImages(prev => prev.filter((_, i) => i !== index));
    setCavetPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };
  const removeOtherDocImage = (index) => {
    setOtherDocImages(prev => prev.filter((_, i) => i !== index));
    setOtherDocPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showErrorToast('Vui lòng điền đầy đủ thông tin hợp lệ');
      return;
    }

    console.log('Form data before submission:', formData);

    // Kiểm tra carId đã tồn tại chưa
    try {
      const checkResponse = await axios.get(`${API_URL}/contracts/check-car/${formData.licensePlate}`);
      if (checkResponse.data.exists) {
        showErrorToast('Car ID already exists in the system. Please choose another car.');
        return;
      }
    } catch (error) {
      showErrorToast('Error checking car ID: ' + (error.response?.data?.error || error.message));
      return;
    }

    try {
      // Tạo dữ liệu hợp đồng từ form
      const allImages = mainImage ? [mainImage, ...otherImages] : [...otherImages];
      const contractData = {
        contractNumber: `HD${Date.now()}`, // Tạo số hợp đồng tự động
        startDate: new Date().toISOString().split('T')[0], // Ngày hiện tại
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 ngày sau
        carId: formData.licensePlate, // Sử dụng biển số xe làm ID
        customerId: '1', // ID khách hàng mặc định
        deposit: formData.dailyRate * 0.5, // Tiền cọc = 50% giá thuê/ngày
        name: '', // Để trống cho người dùng điền
        phone: '', // Để trống cho người dùng điền
        cccd: '', // Để trống cho người dùng điền
        email: '', // Để trống cho người dùng điền
        carData: { // Thêm thông tin xe
          brand: formData.brand,
          model: formData.model,
          year: formData.year,
          licensePlate: formData.licensePlate,

          type: formData.type,
          location: formData.location,
          description: formData.description,
          seats: parseInt(formData.seats),
          transmission: formData.transmission,
          fuelType: formData.fuelType,
          fuelConsumption: parseFloat(formData.fuelConsumption),
          mainImage: mainImage, // Add mainImage separately
          images: allImages
        }
      };

      console.log('Contract data before navigation:', contractData);

      // Chuyển hướng đến trang hợp đồng với dữ liệu
      showSuccessToast('Thông tin xe đã được gửi thành công! Đang chuyển đến trang hợp đồng...');
      navigate('/contracts/lease', { state: { contractData } });
      
    } catch (error) {
      console.error('Error submitting form:', error);
      showErrorToast('Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại sau.');
    }
  };

  const validateForm = () => {
    // Kiểm tra các trường bắt buộc
    if (!formData.brand || !formData.model || !formData.year || !formData.licensePlate || 
        !formData.type || !formData.location || !formData.seats || 
        !formData.transmission || !formData.fuelType || !formData.fuelConsumption || 
        !formData.description) {
      return false;
    }
    
    // Kiểm tra giá trị hợp lệ
    if (parseInt(formData.seats) < 2 || parseInt(formData.seats) > 16) {
      return false;
    }
    
    if (parseFloat(formData.fuelConsumption) <= 0) {
      return false;
    }
    
    return true;
  };

  return (
    <div className="rent-your-car-container">
      <h2>Become a Partner</h2>
      <form onSubmit={handleSubmit} className="rent-car-form">
        <div className="form-group">
          <label htmlFor="brand">Car Brand</label>
          <select
            id="brand"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            required
            className="select-input"
          >
            <option value="">Select a brand</option>
            {carBrands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="model">Car Model</label>
          <input
            type="text"
            id="model"
            name="model"
            value={formData.model}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="year">Year</label>
          <input
            type="number"
            id="year"
            name="year"
            value={formData.year}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="licensePlate">License Plate</label>
          <input
            type="text"
            id="licensePlate"
            name="licensePlate"
            value={formData.licensePlate}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="type">Type</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="select-input"
          >
            <option value="">Select a type</option>
            <option value="suv">SUV</option>
            <option value="sedan">Sedan</option>
            <option value="mpv">MPV</option>
            <option value="hatchback">Hatchback</option>
            <option value="pickup">Pickup</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="location">Location</label>
          <select
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="select-input"
          >
            <option value="">Select a location</option>
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="seats">Seats</label>
          <input
            type="number"
            id="seats"
            name="seats"
            value={formData.seats}
            onChange={handleChange}
            required
            min="2"
            max="16"
          />
        </div>

        <div className="form-group">
          <label htmlFor="transmission">Transmission</label>
          <select
            id="transmission"
            name="transmission"
            value={formData.transmission}
            onChange={handleChange}
            required
            className="select-input"
          >
            <option value="">Select transmission</option>
            <option value="manual">Manual</option>
            <option value="automatic">Automatic</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="fuelType">Fuel Type</label>
          <select
            id="fuelType"
            name="fuelType"
            value={formData.fuelType}
            onChange={handleChange}
            required
            className="select-input"
          >
            <option value="">Select fuel type</option>
            <option value="gasoline">Gasoline</option>
            <option value="diesel">Diesel</option>
            <option value="electric">Electric</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="fuelConsumption">Fuel Consumption (liters/100km)</label>
          <input
            type="number"
            id="fuelConsumption"
            name="fuelConsumption"
            value={formData.fuelConsumption}
            onChange={handleChange}
            required
            step="0.1"
            min="0"
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            placeholder='Describe your car (color, features, ... )'
            value={formData.description}
            onChange={handleChange}
            rows="4"
            required
          />
        </div>
        <div className="form-group">
          <label>Car Images</label>
          <div className="image-upload-section">
            <div className="image-preview-grid">
              {mainPreviewUrl && (
                <div className="image-preview-item">
                  <img src={mainPreviewUrl} alt="Main Preview" />
                  <button type="button" className="remove-image-btn" onClick={removeMainImage}>×</button>
                </div>
              )}
              {!mainPreviewUrl && (
                <label className="upload-button" htmlFor="car-main-image">
                  <i className="bi bi-plus-lg"></i>
                  <span>Car Images</span>
                  <input
                    type="file"
                    id="car-main-image"
                    accept="image/*"
                    onChange={handleMainImageChange}
                    disabled={uploading}
                    style={{ display: 'none' }}
                  />
                </label>
              )}
            </div>
            <label className="upload-button" htmlFor="car-other-images">
              <i className="bi bi-plus-lg"></i>
              <span>Other Images</span>
              <input
                type="file"
                id="car-other-images"
                accept="image/*"
                multiple
                onChange={handleOtherImagesChange}
                disabled={uploading}
                style={{ display: 'none' }}
              />
            </label>
            <div className="image-preview-grid">
              {otherPreviewUrls.map((url, index) => (
                <div key={index} className="image-preview-item">
                  <img src={url} alt={`Other Preview ${index + 1}`} />
                  <button type="button" className="remove-image-btn" onClick={() => removeOtherImage(index)}>×</button>
                </div>
              ))}
            </div>
            <small className="upload-info">
              <i className="bi bi-info-circle me-1"></i>
              Supported formats: JPG, PNG, GIF. Max size: 5MB
            </small>
          </div>
        </div>
        <div className="form-group">
          <label>Vehicle Registration (Cavet) Images</label>
          <div className="image-upload-section">
            <label className="upload-button" htmlFor="car-cavet-images">
              <i className="bi bi-plus-lg"></i>
              <span>Upload Registration</span>
              <input
                type="file"
                id="car-cavet-images"
                accept="image/*"
                multiple
                onChange={handleCavetImagesChange}
                disabled={uploading}
                style={{ display: 'none' }}
              />
            </label>
            <div className="image-preview-grid">
              {cavetPreviewUrls.map((url, index) => (
                <div key={index} className="image-preview-item">
                  <img src={url} alt={`Cavet Preview ${index + 1}`} />
                  <button type="button" className="remove-image-btn" onClick={() => removeCavetImage(index)}>×</button>
                </div>
              ))}
            </div>
            <small className="upload-info">
              <i className="bi bi-info-circle me-1"></i>
              Supported formats: JPG, PNG, GIF. Max size: 5MB
            </small>
          </div>
        </div>
        <div className="form-group">
          <label>Other Documents (if needed)</label>
          <div className="image-upload-section">
            <label className="upload-button" htmlFor="car-other-doc-images">
              <i className="bi bi-plus-lg"></i>
              <span>Upload Other Documents</span>
              <input
                type="file"
                id="car-other-doc-images"
                accept="image/*"
                multiple
                onChange={handleOtherDocImagesChange}
                disabled={uploading}
                style={{ display: 'none' }}
              />
            </label>
            <div className="image-preview-grid">
              {otherDocPreviewUrls.map((url, index) => (
                <div key={index} className="image-preview-item">
                  <img src={url} alt={`Other Doc Preview ${index + 1}`} />
                  <button type="button" className="remove-image-btn" onClick={() => removeOtherDocImage(index)}>×</button>
                </div>
              ))}
            </div>
            <small className="upload-info">
              <i className="bi bi-info-circle me-1"></i>
              Supported formats: JPG, PNG, GIF. Max size: 5MB
            </small>
          </div>
        </div>

        <SimpleButton
          type="submit"
          disabled={uploading}
          isLoading={uploading}
        >
          {uploading ? 'Uploading...' : 'Submit'}
        </SimpleButton>
        <div className="car-ownership-note" style={{
          marginTop: '1rem',
          fontSize: '0.95rem',
          color: '#34495e',
          background: '#f8f9fa',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: '0.9rem 1.2rem',
          gridColumn: '1 / -1',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.7rem'
        }}>
          <span style={{fontSize: '1.3rem', color: '#2980b9', marginTop: '0.1rem'}}>
            <i className="bi bi-exclamation-circle-fill"></i>
          </span>
          <span>
            <strong style={{color: '#2c3e50'}}>Vehicle document note:</strong><br/>
            <span style={{display: 'block', margin: '0.3rem 0 0.1rem 0.2rem'}}>
              <span style={{color: '#27ae60', fontWeight: 500}}>&#10003; Owner vehicle:</span> <span style={{color: '#34495e'}}>Upload a photo/scan of the vehicle registration with the same name as the Partner.</span>
            </span>
            <span style={{display: 'block', margin: '0.1rem 0 0 0.2rem'}}>
              <span style={{color: '#e67e22', fontWeight: 500}}>&#9888; Not owner vehicle:</span> <span style={{color: '#34495e'}}>A valid authorization letter or car rental contract is required (with signature and clear information).</span>
            </span>
          </span>
        </div>
      </form>
      
      <div className="partner-introduction">
        <h2>Benefits of Becoming Our Partner</h2>
        <div className="intro-content">
          <div className="benefits-grid">
            <div className="benefit-item">
              <i className="bi bi-cash-stack"></i>
              <h3>Stable Income</h3>
              <p>Earn extra income from your car when it's not in use</p>
            </div>
            <div className="benefit-item">
              <i className="bi bi-shield-check"></i>
              <h3>Comprehensive Insurance</h3>
              <p>Your car is fully insured during the entire rental period</p>
            </div>
            <div className="benefit-item">
              <i className="bi bi-graph-up"></i>
              <h3>Efficient Management</h3>
              <p>Professional management system helps track schedules and revenue</p>
            </div>
            <div className="benefit-item">
              <i className="bi bi-people"></i>
              <h3>Quality Customers</h3>
              <p>Access a community of trustworthy customers</p>
            </div>
          </div>
          <div className="process-section">
            <h3>How to Become a Partner</h3>
            <ol>
              <li>Fill in your car and personal information</li>
              <li>Wait for confirmation from our team</li>
              <li>Sign the partnership contract</li>
              <li>Start renting out your car and earning income</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentYourCarForm; 