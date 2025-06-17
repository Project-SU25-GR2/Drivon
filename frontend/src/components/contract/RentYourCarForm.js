import React, { useState } from 'react';
import axios from 'axios';
import cloudinaryConfig  from '../../config/cloudinary';
import '../css/RentYourCarForm.css';
import { useNavigate } from 'react-router-dom';
import SimpleButton from '../others/SimpleButton';

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

  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: '',
    licensePlate: '',
    dailyRate: '',
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
  const [uploadError, setUploadError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleMainImageChange = async (e) => {
    const file = e.target.files[0];
    setUploadError(null);
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Kích thước file không được vượt quá 5MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setUploadError('Vui lòng chọn file hình ảnh');
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
    } catch (error) {
      setUploadError('Có lỗi xảy ra khi tải ảnh lên.');
    } finally {
      setUploading(false);
    }
  };

  const handleOtherImagesChange = async (e) => {
    const files = Array.from(e.target.files);
    setUploadError(null);
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('Kích thước file không được vượt quá 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setUploadError('Vui lòng chọn file hình ảnh');
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
    } catch (error) {
      setUploadError('Có lỗi xảy ra khi tải ảnh lên.');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setMessage('Vui lòng điền đầy đủ thông tin hợp lệ');
      return;
    }

    console.log('Form data before submission:', formData);

    // Kiểm tra carId đã tồn tại chưa
    try {
      const checkResponse = await axios.get(`http://localhost:8080/api/contracts/check-car/${formData.licensePlate}`);
      if (checkResponse.data.exists) {
        setMessage('Car ID already exists in the system. Please choose another car.');
        return;
      }
    } catch (error) {
      setMessage('Error checking car ID: ' + (error.response?.data?.error || error.message));
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
          dailyRate: formData.dailyRate,
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
      navigate('/contracts/lease', { state: { contractData } });
      
    } catch (error) {
      console.error('Error submitting form:', error);
      setMessage('Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại sau.');
    }
  };

  const validateForm = () => {
    // Implement form validation logic here
    return true; // Placeholder return, actual implementation needed
  };

  return (
    <div className="rent-your-car-container">
      <h2>Become a Partner	</h2>
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
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="seats">Số chỗ ngồi</label>
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
          <label htmlFor="transmission">Hộp số</label>
          <select
            id="transmission"
            name="transmission"
            value={formData.transmission}
            onChange={handleChange}
            required
            className="select-input"
          >
            <option value="">Chọn loại hộp số</option>
            <option value="manual">Số sàn</option>
            <option value="automatic">Số tự động</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="fuelType">Nhiên liệu</label>
          <select
            id="fuelType"
            name="fuelType"
            value={formData.fuelType}
            onChange={handleChange}
            required
            className="select-input"
          >
            <option value="">Chọn loại nhiên liệu</option>
            <option value="gasoline">Xăng</option>
            <option value="diesel">Dầu</option>
            <option value="electric">Điện</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="fuelConsumption">Mức tiêu thụ nhiên liệu (lít/100km)</label>
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
            placeholder='Mô tả xe (màu sơn, tính năng, ...)'
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
            {uploadError && (
              <div className="upload-error">{uploadError}</div>
            )}
            <small className="upload-info">
              <i className="bi bi-info-circle me-1"></i>
              Hỗ trợ các định dạng: JPG, PNG, GIF. Kích thước tối đa: 5MB
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
      </form>
      {message && (
        <div className="form-message">{message}</div>
      )}
      
      <div className="partner-introduction">
        <h2>Lợi ích khi trở thành đối tác của chúng tôi</h2>
        <div className="intro-content">
          <div className="benefits-grid">
            <div className="benefit-item">
              <i className="bi bi-cash-stack"></i>
              <h3>Thu nhập ổn định</h3>
              <p>Kiếm thêm thu nhập từ chiếc xe của bạn khi không sử dụng</p>
            </div>
            <div className="benefit-item">
              <i className="bi bi-shield-check"></i>
              <h3>Bảo hiểm toàn diện</h3>
              <p>Xe của bạn được bảo hiểm đầy đủ trong suốt thời gian cho thuê</p>
            </div>
            <div className="benefit-item">
              <i className="bi bi-graph-up"></i>
              <h3>Quản lý hiệu quả</h3>
              <p>Hệ thống quản lý chuyên nghiệp giúp theo dõi lịch trình và doanh thu</p>
            </div>
            <div className="benefit-item">
              <i className="bi bi-people"></i>
              <h3>Khách hàng chất lượng</h3>
              <p>Tiếp cận với cộng đồng khách hàng đáng tin cậy</p>
            </div>
          </div>
          <div className="process-section">
            <h3>Quy trình trở thành đối tác</h3>
            <ol>
              <li>Điền thông tin xe và thông tin cá nhân</li>
              <li>Chờ xác nhận từ đội ngũ của chúng tôi</li>
              <li>Ký kết hợp đồng hợp tác</li>
              <li>Bắt đầu cho thuê xe và kiếm thu nhập</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentYourCarForm; 