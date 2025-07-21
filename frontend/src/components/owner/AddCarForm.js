import React, { useState } from "react";
import axios from "axios";
import cloudinaryConfig from "../../config/cloudinary";
import "./EditCarForm.css";
import { API_URL } from "../../api/configApi";
import { showErrorToast, showSuccessToast } from "../notification/notification";

const CAR_BRANDS = [
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
  "Other",
];
const LOCATIONS = [
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
  "Yen Bai",
];

const AddCarForm = ({ onSave, onClose }) => {
  const [formData, setFormData] = useState({
    licensePlate: "",
    brand: "",
    model: "",
    year: "",
    type: "",
    description: "",
    seats: "",
    transmission: "",
    fuelType: "",
    fuelConsumption: "",
    location: "",
    pricePerDay: "",
    deposit: "",
    phoneNumber: "",
  });
  const [mainImage, setMainImage] = useState("");
  const [mainPreviewUrl, setMainPreviewUrl] = useState("");
  const [otherImages, setOtherImages] = useState([]);
  const [otherPreviewUrls, setOtherPreviewUrls] = useState([]);
  const [cavetImages, setCavetImages] = useState([]);
  const [cavetPreviewUrls, setCavetPreviewUrls] = useState([]);
  const [otherDocImages, setOtherDocImages] = useState([]);
  const [otherDocPreviewUrls, setOtherDocPreviewUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Lấy userId từ localStorage (hoặc context nếu có)
  const user = JSON.parse(localStorage.getItem("user"));
  const ownerId = user?.id;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMainImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showErrorToast("File size must not exceed 5MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      showErrorToast("Please select an image file");
      return;
    }
    setMainPreviewUrl(URL.createObjectURL(file));
    setUploading(true);
    try {
      const formDataImg = new FormData();
      formDataImg.append("file", file);
      formDataImg.append("upload_preset", cloudinaryConfig.uploadPreset);
      formDataImg.append("api_key", cloudinaryConfig.apiKey);
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/upload`;
      const response = await axios.post(cloudinaryUrl, formDataImg);
      setMainImage(response.data.secure_url);
      showSuccessToast("Main image uploaded successfully");
    } catch (error) {
      showErrorToast("Error uploading image");
    } finally {
      setUploading(false);
    }
  };

  const handleOtherImagesChange = async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        showErrorToast("File size must not exceed 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        showErrorToast("Please select an image file");
        return;
      }
    }
    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
    setOtherPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
    setUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const formDataImg = new FormData();
        formDataImg.append("file", file);
        formDataImg.append("upload_preset", cloudinaryConfig.uploadPreset);
        formDataImg.append("api_key", cloudinaryConfig.apiKey);
        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/upload`;
        const response = await axios.post(cloudinaryUrl, formDataImg);
        return response.data.secure_url;
      });
      const uploadedUrls = await Promise.all(uploadPromises);
      setOtherImages((prev) => [...prev, ...uploadedUrls]);
      showSuccessToast(`${files.length} other images uploaded successfully`);
    } catch (error) {
      showErrorToast("Error uploading images");
    } finally {
      setUploading(false);
    }
  };

  const handleCavetImagesChange = async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        showErrorToast("File size must not exceed 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        showErrorToast("Please select an image file");
        return;
      }
    }
    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
    setCavetPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
    setUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const formDataImg = new FormData();
        formDataImg.append("file", file);
        formDataImg.append("upload_preset", cloudinaryConfig.uploadPreset);
        formDataImg.append("api_key", cloudinaryConfig.apiKey);
        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/upload`;
        const response = await axios.post(cloudinaryUrl, formDataImg);
        return response.data.secure_url;
      });
      const uploadedUrls = await Promise.all(uploadPromises);
      setCavetImages((prev) => [...prev, ...uploadedUrls]);
      showSuccessToast(`${files.length} cavet images uploaded successfully`);
    } catch (error) {
      showErrorToast("Error uploading cavet images");
    } finally {
      setUploading(false);
    }
  };

  const handleOtherDocImagesChange = async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        showErrorToast("File size must not exceed 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        showErrorToast("Please select an image file");
        return;
      }
    }
    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
    setOtherDocPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
    setUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const formDataImg = new FormData();
        formDataImg.append("file", file);
        formDataImg.append("upload_preset", cloudinaryConfig.uploadPreset);
        formDataImg.append("api_key", cloudinaryConfig.apiKey);
        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/upload`;
        const response = await axios.post(cloudinaryUrl, formDataImg);
        return response.data.secure_url;
      });
      const uploadedUrls = await Promise.all(uploadPromises);
      setOtherDocImages((prev) => [...prev, ...uploadedUrls]);
      showSuccessToast(
        `${files.length} other document images uploaded successfully`
      );
    } catch (error) {
      showErrorToast("Error uploading other document images");
    } finally {
      setUploading(false);
    }
  };

  const removeMainImage = () => {
    setMainImage("");
    setMainPreviewUrl("");
  };
  const removeOtherImage = (index) => {
    setOtherImages((prev) => prev.filter((_, i) => i !== index));
    setOtherPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };
  const removeCavetImage = (index) => {
    setCavetImages((prev) => prev.filter((_, i) => i !== index));
    setCavetPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };
  const removeOtherDocImage = (index) => {
    setOtherDocImages((prev) => prev.filter((_, i) => i !== index));
    setOtherDocPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    // Validate
    if (
      !formData.brand ||
      !formData.model ||
      !formData.year ||
      !formData.licensePlate ||
      !formData.type ||
      !formData.location ||
      !formData.seats ||
      !formData.transmission ||
      !formData.fuelType ||
      !formData.fuelConsumption ||
      !formData.description ||
      !formData.pricePerDay ||
      !formData.deposit ||
      !formData.phoneNumber
    ) {
      showErrorToast("Please fill in all required fields");
      setLoading(false);
      return;
    }
    if (parseInt(formData.seats) < 2 || parseInt(formData.seats) > 16) {
      showErrorToast("Seats must be between 2 and 16");
      setLoading(false);
      return;
    }
    if (parseFloat(formData.fuelConsumption) <= 0) {
      showErrorToast("Fuel consumption must be positive");
      setLoading(false);
      return;
    }
    if (parseFloat(formData.deposit) <= 0) {
      showErrorToast("Deposit must be positive");
      setLoading(false);
      return;
    }
    try {
      const carData = {
        licensePlate: formData.licensePlate,
        brand: formData.brand,
        model: formData.model,
        year: parseInt(formData.year),
        type: formData.type,
        description: formData.description || "",
        seats: parseInt(formData.seats),
        transmission: formData.transmission,
        fuelType: formData.fuelType,
        fuelConsumption: parseFloat(formData.fuelConsumption),
        location: formData.location,
        pricePerDay: parseFloat(formData.pricePerDay),
        deposit: parseFloat(formData.deposit),
        phoneNumber: formData.phoneNumber,
        status: "PENDING",
        mainImage: mainImage || "",
        otherImages: otherImages || [],
        cavetImages: cavetImages || [],
        otherDocImages: otherDocImages || [],
        ownerId: ownerId, // Thêm ownerId vào payload
      };
      const response = await axios.post(`${API_URL}/cars`, carData);
      onSave(response.data);
      showSuccessToast(
        "Car registered successfully! Waiting for admin approval."
      );
    } catch (err) {
      showErrorToast(
        `Failed to register car: ${err.response?.data?.error || err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-car-modal-overlay" onClick={onClose}>
      <div className="edit-car-modal" onClick={(e) => e.stopPropagation()}>
        <div className="edit-car-modal-header">
          <h2>Register New Car</h2>
        </div>
        {loading && <div className="loading">Registering car...</div>}
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="edit-car-form">
          {/* Vehicle Info */}
          <div className="form-group">
            <label htmlFor="brand">Car Brand</label>
            <select
              id="brand"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              required
            >
              <option value="">Select a brand</option>
              {CAR_BRANDS.map((brand) => (
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
            >
              <option value="">Select a location</option>
              {LOCATIONS.map((location) => (
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
            >
              <option value="">Select fuel type</option>
              <option value="gasoline">Gasoline</option>
              <option value="diesel">Diesel</option>
              <option value="electric">Electric</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="fuelConsumption">
              Fuel Consumption (liters/100km)
            </label>
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
            <label htmlFor="pricePerDay">Price per Day (VND)</label>
            <input
              type="number"
              id="pricePerDay"
              name="pricePerDay"
              value={formData.pricePerDay}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="deposit">Deposit (VND)</label>
            <input
              type="number"
              id="deposit"
              name="deposit"
              value={formData.deposit}
              onChange={handleChange}
              required
              min="1"
            />
          </div>
          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              pattern="[0-9]{10,15}"
              placeholder="Enter your phone number"
            />
          </div>
          <div className="form-group full-width">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              required
            />
          </div>
          {/* Images & Documents Section */}
          <div className="form-group full-width">
            <label style={{ fontWeight: 600, marginBottom: 8 }}>
              Car Images
            </label>
            <div className="partner-image-upload-section">
              <div className="partner-image-preview-grid">
                {mainPreviewUrl && (
                  <div className="partner-image-preview-item">
                    <img src={mainPreviewUrl} alt="Main Preview" />
                    <button
                      type="button"
                      className="partner-remove-image-btn"
                      onClick={removeMainImage}
                    >
                      ×
                    </button>
                  </div>
                )}
                {!mainPreviewUrl && (
                  <label
                    className="partner-upload-button"
                    htmlFor="car-main-image"
                  >
                    <span>Car Images</span>
                    <input
                      type="file"
                      id="car-main-image"
                      accept="image/*"
                      onChange={handleMainImageChange}
                      disabled={uploading}
                      style={{ display: "none" }}
                    />
                  </label>
                )}
              </div>
            </div>
            <label style={{ fontWeight: 600, margin: "16px 0 8px 0" }}>
              Other Car Images
            </label>
            <div className="partner-image-upload-section">
              <label
                className="partner-upload-button"
                htmlFor="car-other-images"
              >
                <span>Other Car Images</span>
                <input
                  type="file"
                  id="car-other-images"
                  accept="image/*"
                  multiple
                  onChange={handleOtherImagesChange}
                  disabled={uploading}
                  style={{ display: "none" }}
                />
              </label>
              <div className="partner-image-preview-grid">
                {otherPreviewUrls.map((url, index) => (
                  <div key={index} className="partner-image-preview-item">
                    <img src={url} alt={`Other Preview ${index + 1}`} />
                    <button
                      type="button"
                      className="partner-remove-image-btn"
                      onClick={() => removeOtherImage(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="form-group full-width">
            <label style={{ fontWeight: 600, marginBottom: 8 }}>
              Vehicle Registration (Cavet) Images
            </label>
            <div className="partner-image-upload-section">
              <label
                className="partner-upload-button"
                htmlFor="car-cavet-images"
              >
                <span>Upload Registration</span>
                <input
                  type="file"
                  id="car-cavet-images"
                  accept="image/*"
                  multiple
                  onChange={handleCavetImagesChange}
                  disabled={uploading}
                  style={{ display: "none" }}
                />
              </label>
              <div className="partner-image-preview-grid">
                {cavetPreviewUrls.map((url, index) => (
                  <div key={index} className="partner-image-preview-item">
                    <img src={url} alt={`Cavet Preview ${index + 1}`} />
                    <button
                      type="button"
                      className="partner-remove-image-btn"
                      onClick={() => removeCavetImage(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <label style={{ fontWeight: 600, margin: "16px 0 8px 0" }}>
              Other Documents (if needed)
            </label>
            <div className="partner-image-upload-section">
              <label
                className="partner-upload-button"
                htmlFor="car-other-doc-images"
              >
                <span>Upload Other Documents</span>
                <input
                  type="file"
                  id="car-other-doc-images"
                  accept="image/*"
                  multiple
                  onChange={handleOtherDocImagesChange}
                  disabled={uploading}
                  style={{ display: "none" }}
                />
              </label>
              <div className="partner-image-preview-grid">
                {otherDocPreviewUrls.map((url, index) => (
                  <div key={index} className="partner-image-preview-item">
                    <img src={url} alt={`Other Doc Preview ${index + 1}`} />
                    <button
                      type="button"
                      className="partner-remove-image-btn"
                      onClick={() => removeOtherDocImage(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <small
              className="partner-upload-info"
              style={{ marginTop: "0.7rem", display: "block" }}
            >
              Supported formats: JPG, PNG, GIF. Max size: 5MB
            </small>
          </div>
          {/* Important Notes */}
          <div
            className="form-group full-width"
            style={{ margin: "0.5rem 0 1.5rem 0" }}
          >
            <div
              style={{
                background: "#eaf6fb",
                border: "1.5px solid #b3e0fc",
                borderRadius: 8,
                boxShadow: "0 1px 4px rgba(41,128,185,0.07)",
                padding: "1.1rem 1.2rem",
                display: "flex",
                alignItems: "flex-start",
                gap: "0.8rem",
              }}
            >
              <span
                style={{
                  fontSize: "1.5rem",
                  color: "#2980b9",
                  marginTop: "0.1rem",
                }}
              >
                <i className="bi bi-info-circle-fill"></i>
              </span>
              <span>
                <strong style={{ color: "#2c3e50" }}>
                  Vehicle document note:
                </strong>
                <br />
                <span
                  style={{ display: "block", margin: "0.3rem 0 0.1rem 0.2rem" }}
                >
                  <span style={{ color: "#27ae60", fontWeight: 500 }}>
                    &#10003; Owner vehicle:
                  </span>{" "}
                  <span style={{ color: "#34495e" }}>
                    Upload a photo/scan of the vehicle registration with the
                    same name as the Partner.
                  </span>
                </span>
                <span style={{ display: "block", margin: "0.1rem 0 0 0.2rem" }}>
                  <span style={{ color: "#e67e22", fontWeight: 500 }}>
                    &#9888; Not owner vehicle:
                  </span>{" "}
                  <span style={{ color: "#34495e" }}>
                    A valid authorization letter or car rental contract is
                    required (with signature and clear information).
                  </span>
                </span>
              </span>
            </div>
          </div>
          {/* Submit/Cancel */}
          <div className="form-actions">
            <button
              type="submit"
              className="save-btn"
              disabled={loading || uploading}
            >
              {loading ? "Registering..." : "Register Car"}
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={loading || uploading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCarForm;
