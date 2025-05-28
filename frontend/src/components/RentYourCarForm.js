import React, { useState } from 'react';
import axios from 'axios';
import CLOUDINARY_CONFIG from '../config/cloudinary';
import './RentYourCarForm.css';
import { useNavigate } from 'react-router-dom';

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
    carBrand: '',
    carModel: '',
    year: '',
    licensePlate: '',
    dailyRate: '',
    location: '',
    description: '',
    images: [],
  });

  const [previewUrls, setPreviewUrls] = useState([]);
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

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    setUploadError(null);

    // Validate files
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

    // Create preview URLs
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);

    // Upload to Cloudinary
    setUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
        formData.append('api_key', CLOUDINARY_CONFIG.apiKey);

        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/upload`;
        const response = await axios.post(cloudinaryUrl, formData);
        return response.data.secure_url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setFormData(prevState => ({
        ...prevState,
        images: [...prevState.images, ...uploadedUrls]
      }));
    } catch (error) {
      console.error('Error uploading images:', error);
      setUploadError('Có lỗi xảy ra khi tải ảnh lên.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prevState => ({
      ...prevState,
      images: prevState.images.filter((_, i) => i !== index)
    }));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setMessage('Vui lòng điền đầy đủ thông tin hợp lệ');
      return;
    }

    try {
      // Tạo dữ liệu hợp đồng từ form
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
          carBrand: formData.carBrand,
          carModel: formData.carModel,
          year: formData.year,
          licensePlate: formData.licensePlate,
          dailyRate: formData.dailyRate,
          location: formData.location,
          description: formData.description,
          images: formData.images
        }
      };

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
          <label htmlFor="carBrand">Car Brand</label>
          <select
            id="carBrand"
            name="carBrand"
            value={formData.carBrand}
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
          <label htmlFor="carModel">Car Model</label>
          <input
            type="text"
            id="carModel"
            name="carModel"
            value={formData.carModel}
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
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            placeholder='Mô tả xe (màu sơn, động cơ, hệ thống điều hòa, số chỗ ngồi, tính năng, ...)'
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
              {previewUrls.map((url, index) => (
                <div key={index} className="image-preview-item">
                  <img src={url} alt={`Preview ${index + 1}`} />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={() => removeImage(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
              <label className="upload-button" htmlFor="car-images">
                <i className="bi bi-plus-lg"></i>
                <span>Add Images</span>
                <input
                  type="file"
                  id="car-images"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  disabled={uploading}
                  style={{ display: 'none' }}
                />
              </label>
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

        <button type="submit" className="submit-button" disabled={uploading}>
          {uploading ? 'Uploading...' : 'Submit'}
        </button>
      </form>
      {message && (
        <div className="form-message">{message}</div>
      )}
    </div>
  );
};

export default RentYourCarForm; 