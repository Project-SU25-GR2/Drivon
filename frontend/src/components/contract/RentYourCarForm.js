import React, { useState, useEffect } from 'react';
import axios from 'axios';
import cloudinaryConfig  from '../../config/cloudinary';
import './RentYourCarForm.css';
import { useNavigate } from 'react-router-dom';
import SimpleButton from '../others/SimpleButton';
import { API_URL } from '../../api/configApi';
import { showErrorToast, showSuccessToast } from '../notification/notification';
  const RentYourCarForm = () => {
    const navigate = useNavigate();

    // All hooks must be called at the top, before any return
    const [showCCCDModal, setShowCCCDModal] = useState(false);
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
    // CCCD verification status: 'loading', 'not_uploaded', 'pending', 'verified'
    const [cccdStatus, setCccdStatus] = useState('loading');

    // Check if user is already Owner
    const storedUser = localStorage.getItem("user");
    let isOwner = false;
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.role && (user.role.toLowerCase() === "owner" || user.role.toLowerCase() === "verify_owner")) {
          isOwner = true;
        }
      } catch (e) {
        // ignore
      }
    }

    useEffect(() => {
      if (storedUser) {
        const user = JSON.parse(storedUser);
        axios.get(`${API_URL}/user/image?userId=${user.userId}`)
          .then(res => {
            const cccdImages = (res.data || []).filter(img => img.documentType === 'cccd');
            if (!cccdImages.length) {
              setCccdStatus('not_uploaded');
            } else if (cccdImages.some(img => img.verified === true || img.verified === 1)) {
              setCccdStatus('verified');
            } else {
              setCccdStatus('pending');
            }
          })
          .catch(() => setCccdStatus('not_uploaded'));
      } else {
        setCccdStatus('not_uploaded');
      }
    }, [storedUser]);

    // Now, after all hooks, check isOwner and return modal if needed
    if (isOwner) {
      return (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.4)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{
            background: "#fff", borderRadius: 8, padding: 32, minWidth: 320, boxShadow: "0 2px 16px rgba(0,0,0,0.15)", textAlign: "center"
          }}>
            <h2>You are already an Owner</h2>
            <p>You do not need to register again to become a partner. Please manage your cars and contracts in the Owner Dashboard.</p>
            <div style={{ marginTop: 24, display: "flex", justifyContent: "center", gap: 16 }}>
              <button
                className="cccd-modal-btn"
                onClick={() => navigate('/')}
              >
                Cancel
              </button>
              <button
                className="cccd-modal-btn primary"
                onClick={() => navigate('/owner')}
              >
                Go to Owner Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Modal: chưa upload CCCD
    if (cccdStatus === 'not_uploaded') {
      return (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.4)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{
            background: "#fff", borderRadius: 8, padding: 32, minWidth: 320, boxShadow: "0 2px 16px rgba(0,0,0,0.15)", textAlign: "center"
          }}>
            <h2>Identity Verification Required</h2>
            <p>You need to upload your Citizen ID (CCCD) image before registering as a partner.</p>
            <div style={{ marginTop: 24, display: "flex", justifyContent: "center", gap: 16 }}>
              <button
                className="cccd-modal-btn primary"
                onClick={() => navigate('/profile')}
              >
                Upload CCCD
              </button>
              <button
                className="cccd-modal-btn"
                onClick={() => navigate('/')}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Modal: đã upload nhưng chưa xác thực
    if (cccdStatus === 'pending') {
      return (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.4)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{
            background: "#fff", borderRadius: 8, padding: 32, minWidth: 320, boxShadow: "0 2px 16px rgba(0,0,0,0.15)", textAlign: "center"
          }}>
            <h2>CCCD Verification Pending</h2>
            <p>Please wait for your Citizen ID (CCCD) to be verified before continuing to become a partner.</p>
            <div style={{ marginTop: 24, display: "flex", justifyContent: "center", gap: 16 }}>
              <button
                className="cccd-modal-btn"
                onClick={() => navigate('/')}
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

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
  
  // Province and city list

  const locations = [
    "Hanoi",
    "Ho Chi Minh City",
    "Da Nang",
    "Hai Phong",
    "Can Tho",
    "An Giang",
    "Ba Ria - Vung Tau",
    "Bac Giang",
    "Bac Kan",
    "Bac Lieu",
    "Bac Ninh",
    "Ben Tre",
    "Binh Dinh",
    "Binh Duong",
    "Binh Phuoc",
    "Binh Thuan",
    "Ca Mau",
    "Cao Bang",
    "Dak Lak",
    "Dak Nong",
    "Dien Bien",
    "Dong Nai",
    "Dong Thap",
    "Gia Lai",
    "Ha Giang",
    "Ha Nam",
    "Ha Tinh",
    "Hai Duong",
    "Hau Giang",
    "Hoa Binh",
    "Hung Yen",
    "Khanh Hoa",
    "Kien Giang",
    "Kon Tum",
    "Lai Chau",
    "Lam Dong",
    "Lang Son",
    "Lao Cai",
    "Long An",
    "Nam Dinh",
    "Nghe An",
    "Ninh Binh",
    "Ninh Thuan",
    "Phu Tho",
    "Phu Yen",
    "Quang Binh",
    "Quang Nam",
    "Quang Ngai",
    "Quang Ninh",
    "Quang Tri",
    "Soc Trang",
    "Son La",
    "Tay Ninh",
    "Thai Binh",
    "Thai Nguyen",
    "Thanh Hoa",
    "Thua Thien Hue",
    "Tien Giang",
    "Tra Vinh",
    "Tuyen Quang",
    "Vinh Long",
    "Vinh Phuc",
    "Yen Bai"
  ];

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
      // Create contract data from form
      const allImages = mainImage ? [mainImage, ...otherImages] : [...otherImages];
      const contractData = {
        contractNumber: `HD${Date.now()}`, // Auto-generate contract number
        startDate: new Date().toISOString().split('T')[0], // Current date
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days later
        carId: formData.licensePlate, // Use license plate as ID
        customerId: '1', // Default customer ID
        deposit: formData.dailyRate * 0.5, // Deposit = 50% of daily rate
        name: '', // Leave blank for user to fill
        phone: '', // Leave blank for user to fill
        cccd: '', // Leave blank for user to fill
        email: '', // Leave blank for user to fill
        carData: { // Add vehicle information
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

      // Navigate to contract page with data
      showSuccessToast('Vehicle information has been submitted successfully! Redirecting to contract page...');
      navigate('/contracts/lease', { state: { contractData: { ...contractData, cavetImages, otherDocImages } } });
      
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
    <div className="partner-container" aria-label="Become a Partner Registration">
      <h2>Register Your Vehicle</h2>
      <p style={{textAlign:'center', color:'#666', marginBottom:'2rem', fontSize:'1.08rem'}}>Fill out the form below to get started with your partnership</p>
      <form onSubmit={handleSubmit} className="partner-form" aria-label="Vehicle Registration Form">
        {/* --- Vehicle Information Card --- */}
        <div className="partner-form-group full-width" style={{marginBottom:'0.5rem'}}>
          <div style={{background:'#f8f9fa', borderRadius:8, boxShadow:'0 1px 4px rgba(0,0,0,0.04)', padding:'1.2rem 1rem 0.5rem 1rem', marginBottom:'0.5rem'}}>
            <h3 style={{color:'#2980b9', fontSize:'1.15rem', fontWeight:600, marginBottom:'0.7rem'}}>Vehicle Information</h3>
          </div>
        </div>
        {/* --- All vehicle info fields (as before) --- */}
        <div className="partner-form-group">
          <label htmlFor="brand">Car Brand</label>
          <select
            id="brand"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            required
            className="partner-select-input"
          >
            <option value="">Select a brand</option>
            {carBrands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>

        <div className="partner-form-group">
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

        <div className="partner-form-group">
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

        <div className="partner-form-group">
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
        
        <div className="partner-form-group">
          <label htmlFor="type">Type</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="partner-select-input"
          >
            <option value="">Select a type</option>
            <option value="suv">SUV</option>
            <option value="sedan">Sedan</option>
            <option value="mpv">MPV</option>
            <option value="hatchback">Hatchback</option>
            <option value="pickup">Pickup</option>
          </select>
        </div>

        <div className="partner-form-group">
          <label htmlFor="location">Location</label>
          <select
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="partner-select-input"
          >
            <option value="">Select a location</option>
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        <div className="partner-form-group">
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

        <div className="partner-form-group">
          <label htmlFor="transmission">Transmission</label>
          <select
            id="transmission"
            name="transmission"
            value={formData.transmission}
            onChange={handleChange}
            required
            className="partner-select-input"
          >
            <option value="">Select transmission</option>
            <option value="manual">Manual</option>
            <option value="automatic">Automatic</option>
          </select>
        </div>

        <div className="partner-form-group">
          <label htmlFor="fuelType">Fuel Type</label>
          <select
            id="fuelType"
            name="fuelType"
            value={formData.fuelType}
            onChange={handleChange}
            required
            className="partner-select-input"
          >
            <option value="">Select fuel type</option>
            <option value="gasoline">Gasoline</option>
            <option value="diesel">Diesel</option>
            <option value="electric">Electric</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>

        <div className="partner-form-group">
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
        {/* Move Description to the last row, full width */}
        <div className="partner-form-group full-width">
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
        {/* --- Images & Documents Section --- */}
        <div className="partner-form-group full-width" style={{marginTop:'1.2rem', marginBottom:'0.5rem'}}>
          <div style={{background:'#f8f9fa', borderRadius:8, boxShadow:'0 1px 4px rgba(0,0,0,0.04)', padding:'1.2rem 1rem 0.5rem 1rem', marginBottom:'0.5rem'}}>
            <h3 style={{color:'#2980b9', fontSize:'1.15rem', fontWeight:600, marginBottom:'0.7rem'}}>Images & Documents</h3>
          </div>
        </div>
        {/* 2-column image/document upload layout */}
        <div className="partner-form-group full-width">
          <div className="partner-image-docs-grid">
            {/* Left column: Car Images & Other Car Images (separated) */}
            <div className="partner-image-docs-col partner-image-docs-card">
              <label style={{fontWeight:600, marginBottom:8}}>Car Images</label>
              <div className="partner-image-upload-section">
                <div className="partner-image-preview-grid">
                  {mainPreviewUrl && (
                    <div className="partner-image-preview-item">
                      <img src={mainPreviewUrl} alt="Main Preview" />
                      <button type="button" className="partner-remove-image-btn" onClick={removeMainImage}>×</button>
                    </div>
                  )}
                  {!mainPreviewUrl && (
                    <label className="partner-upload-button" htmlFor="car-main-image">
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
              </div>
              <label style={{fontWeight:600, margin:'16px 0 8px 0'}}>Other Car Images</label>
              <div className="partner-image-upload-section">
                <label className="partner-upload-button" htmlFor="car-other-images">
                  <i className="bi bi-plus-lg"></i>
                  <span>Other Car Images</span>
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
                <div className="partner-image-preview-grid">
                  {otherPreviewUrls.map((url, index) => (
                    <div key={index} className="partner-image-preview-item">
                      <img src={url} alt={`Other Preview ${index + 1}`} />
                      <button type="button" className="partner-remove-image-btn" onClick={() => removeOtherImage(index)}>×</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Right column: Cavet & Other Documents */}
            <div className="partner-image-docs-col partner-image-docs-card">
              <label style={{fontWeight:600, marginBottom:8}}>Vehicle Registration (Cavet) Images</label>
              <div className="partner-image-upload-section">
                <label className="partner-upload-button" htmlFor="car-cavet-images">
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
                <div className="partner-image-preview-grid">
                  {cavetPreviewUrls.map((url, index) => (
                    <div key={index} className="partner-image-preview-item">
                      <img src={url} alt={`Cavet Preview ${index + 1}`} />
                      <button type="button" className="partner-remove-image-btn" onClick={() => removeCavetImage(index)}>×</button>
                    </div>
                  ))}
                </div>
              </div>
              <label style={{fontWeight:600, margin:'16px 0 8px 0'}}>Other Documents (if needed)</label>
              <div className="partner-image-upload-section">
                <label className="partner-upload-button" htmlFor="car-other-doc-images">
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
                <div className="partner-image-preview-grid">
                  {otherDocPreviewUrls.map((url, index) => (
                    <div key={index} className="partner-image-preview-item">
                      <img src={url} alt={`Other Doc Preview ${index + 1}`} />
                      <button type="button" className="partner-remove-image-btn" onClick={() => removeOtherDocImage(index)}>×</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <small className="partner-upload-info" style={{marginTop:'0.7rem', display:'block'}}>
            <i className="bi bi-info-circle me-1" aria-hidden="true"></i>
            Supported formats: JPG, PNG, GIF. Max size: 5MB
          </small>
        </div>
        {/* --- Important Notes Card --- */}
        <div className="partner-form-group full-width" style={{margin:'0.5rem 0 1.5rem 0'}}>
          <div style={{background:'#eaf6fb', border:'1.5px solid #b3e0fc', borderRadius:8, boxShadow:'0 1px 4px rgba(41,128,185,0.07)', padding:'1.1rem 1.2rem', display:'flex', alignItems:'flex-start', gap:'0.8rem'}} aria-label="Important Notes">
            <span style={{fontSize:'1.5rem', color:'#2980b9', marginTop:'0.1rem'}} aria-hidden="true">
              <i className="bi bi-info-circle-fill"></i>
            </span>
            <span>
              <strong style={{color:'#2c3e50'}}>Vehicle document note:</strong><br/>
              <span style={{display:'block', margin:'0.3rem 0 0.1rem 0.2rem'}}>
                <span style={{color:'#27ae60', fontWeight:500}}>&#10003; Owner vehicle:</span> <span style={{color:'#34495e'}}>Upload a photo/scan of the vehicle registration with the same name as the Partner.</span>
              </span>
              <span style={{display:'block', margin:'0.1rem 0 0 0.2rem'}}>
                <span style={{color:'#e67e22', fontWeight:500}}>&#9888; Not owner vehicle:</span> <span style={{color:'#34495e'}}>A valid authorization letter or car rental contract is required (with signature and clear information).</span>
              </span>
            </span>
          </div>
        </div>
        {/* --- Submit Button --- */}
        <SimpleButton
          type="submit"
          disabled={uploading}
          isLoading={uploading}
          aria-label="Submit Registration"
        >
          {uploading ? 'Uploading...' : 'Submit'}
        </SimpleButton>
      </form>
      {/* --- Benefits Section --- */}
      <div className="partner-introduction" style={{marginTop:'2.5rem'}} aria-label="Benefits of Becoming Our Partner">
        <h2>Benefits of Becoming Our Partner</h2>
        <div className="partner-intro-content">
          <div className="partner-benefits-grid">
            <div className="partner-benefit-item" aria-label="Stable Income">
              <i className="bi bi-cash-stack" aria-hidden="true"></i>
              <h3>Stable Income</h3>
              <p>Earn extra income from your car when it's not in use</p>
            </div>
            <div className="partner-benefit-item" aria-label="Comprehensive Insurance">
              <i className="bi bi-shield-check" aria-hidden="true"></i>
              <h3>Comprehensive Insurance</h3>
              <p>Your car is fully insured during the entire rental period</p>
            </div>
            <div className="partner-benefit-item" aria-label="Efficient Management">
              <i className="bi bi-graph-up" aria-hidden="true"></i>
              <h3>Efficient Management</h3>
              <p>Professional management system helps track schedules and revenue</p>
            </div>
            <div className="partner-benefit-item" aria-label="Quality Customers">
              <i className="bi bi-people" aria-hidden="true"></i>
              <h3>Quality Customers</h3>
              <p>Access a community of trustworthy customers</p>
            </div>
          </div>
          {/* --- How It Works Section --- */}
          <div className="partner-process-section" style={{marginTop:'2.5rem'}} aria-label="How to Become a Partner">
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