import React, { useState, useEffect } from "react";
import axios from "axios";
import cloudinaryConfig from "../../config/cloudinary"; // Import Cloudinary config
import "./EditCarForm.css"; // We will create this CSS file next
import { API_URL } from '../../api/configApi';  
import { useParams, useNavigate } from 'react-router-dom';
import { showErrorToast, showSuccessToast } from '../toast/notification';

const EditCarForm = ({ car, onSave, onClose }) => {
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
    status: "",
    mainImage: "",
    otherImages: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMainImageFile, setSelectedMainImageFile] = useState(null); // State for selected main image file object
  const [selectedOtherImageFiles, setSelectedOtherImageFiles] = useState([]); // State for selected other image files array
  const [uploadingImage, setUploadingImage] = useState(false); // State to indicate image is being uploaded

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
    "Yên Bái",
  ];

  useEffect(() => {
    if (car) {
      setFormData({
        licensePlate: car.licensePlate || "",
        brand: car.brand || "",
        model: car.model || "",
        year: car.year || "",
        type: car.type || "",
        description: car.description || "",
        seats: car.seats || "",
        transmission: car.transmission?.toLowerCase() || "",
        fuelType: car.fuelType?.toLowerCase() || "",
        fuelConsumption: car.fuelConsumption || "",
        location: car.location || "",
        status: car.status || "",
        mainImage: car.mainImage || "",
        otherImages: car.otherImages || [],
      });
    }
  }, [car]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleMainFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedMainImageFile(e.target.files[0]);
    }
  };

  const handleOtherFileChange = (e) => {
    if (e.target.files) {
      setSelectedOtherImageFiles(Array.from(e.target.files));
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData((prevData) => ({
      ...prevData,
      otherImages: prevData.otherImages.filter(
        (_, index) => index !== indexToRemove
      ),
    }));
  };

  const handleImageUpload = async () => {
    // This is for the main image (single file upload)
    if (!selectedMainImageFile) {
      showErrorToast("Please select a main image file to upload.");
      return;
    }

    const formDataUpload = new FormData();
    formDataUpload.append("file", selectedMainImageFile);
    formDataUpload.append("upload_preset", cloudinaryConfig.uploadPreset);
    formDataUpload.append("api_key", cloudinaryConfig.apiKey);

    setUploadingImage(true);
    setError(null);

    try {
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/upload`;
      const uploadResponse = await axios.post(cloudinaryUrl, formDataUpload);
      const uploadedImageUrl = uploadResponse.data.secure_url;

      setFormData((prevData) => ({
        ...prevData,
        mainImage: uploadedImageUrl,
      }));
      setSelectedMainImageFile(null);
      showSuccessToast("Main image uploaded successfully!");
    } catch (err) {
      console.error("Error uploading main image to Cloudinary:", err);
      setError("Failed to upload main image. Please try again.");
      showErrorToast("Failed to upload main image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleOtherImageUpload = async () => {
    // This is for other images (multiple file upload)
    if (selectedOtherImageFiles.length === 0) {
      showErrorToast(
        "Please select at least one image file to upload for other images."
      );
      return;
    }

    setUploadingImage(true);
    setError(null);
    const uploadedUrls = [];

    try {
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/upload`;

      for (const file of selectedOtherImageFiles) {
        const formDataUploadOther = new FormData();
        formDataUploadOther.append("file", file);
        formDataUploadOther.append(
          "upload_preset",
          cloudinaryConfig.uploadPreset
        );
        formDataUploadOther.append("api_key", cloudinaryConfig.apiKey);

        const uploadResponse = await axios.post(
          cloudinaryUrl,
          formDataUploadOther
        );
        uploadedUrls.push(uploadResponse.data.secure_url);
      }

      setFormData((prevData) => ({
        ...prevData,
        otherImages: [...prevData.otherImages, ...uploadedUrls],
      }));
      setSelectedOtherImageFiles([]); // Clear selected files
      showSuccessToast("Other images uploaded and added successfully!");
    } catch (err) {
      console.error("Error uploading other images to Cloudinary:", err);
      setError("Failed to upload other images. Please try again.");
      showErrorToast("Failed to upload other images. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      const requiredFields = [
        "brand",
        "model",
        "year",
        "type",
        "seats",
        "transmission",
        "fuelType",
        "fuelConsumption",
        "location",
      ];
      const missingFields = requiredFields.filter((field) => !formData[field]);

      if (missingFields.length > 0) {
        setError(`Missing required fields: ${missingFields.join(", ")}`);
        setLoading(false);
        return;
      }

      // Convert enum values to match backend expectations
      const transmissionMap = {
        MANUAL: "manual",
        AUTOMATIC: "automatic",
      };

      const fuelTypeMap = {
        GASOLINE: "gasoline",
        DIESEL: "diesel",
        ELECTRIC: "electric",
        HYBRID: "hybrid",
      };

      console.log(
        "formData.mainImage before sending to backend:",
        formData.mainImage
      ); // New debug log

      // First update the car data
      const carData = {
        licensePlate: formData.licensePlate,
        brand: formData.brand,
        model: formData.model,
        year: parseInt(formData.year),
        type: formData.type,
        description: formData.description || "",
        seats: parseInt(formData.seats),
        transmission:
          transmissionMap[formData.transmission] ||
          formData.transmission.toLowerCase(),
        fuelType:
          fuelTypeMap[formData.fuelType] || formData.fuelType.toLowerCase(),
        fuelConsumption: parseFloat(formData.fuelConsumption),
        location: formData.location,
        status: formData.status || "available",
        mainImage: formData.mainImage || "",
      };

      console.log("Sending car data:", carData); // Debug log

      const response = await axios.put(
        `${API_URL}/cars/${formData.licensePlate}`,
        carData
      );

      console.log("Update response:", response.data); // Debug log

      // Then update the images if they've changed
      if (
        formData.mainImage ||
        (formData.otherImages && formData.otherImages.length > 0)
      ) {
        const imageData = {
          carId: formData.licensePlate,
          mainImage: formData.mainImage || "",
          otherImages: formData.otherImages || [],
        };
        console.log("Sending image data:", imageData); // Debug log

        await axios.post(`${API_URL}/cars/images`, imageData);
      }

      onSave(response.data);
      showSuccessToast("Car updated successfully!");
    } catch (err) {
      console.error("Error updating car:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        requestData: err.config?.data,
      });
      setError(
        `Failed to update car: ${err.response?.data?.error || err.message}`
      );
      showErrorToast(`Failed to update car: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-car-modal-overlay" onClick={onClose}>
      <div className="edit-car-modal" onClick={(e) => e.stopPropagation()}>
        <div className="edit-car-modal-header">
          <h2>Edit Car Information</h2>
        </div>

        {loading && <div className="loading">Updating car...</div>}
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="edit-car-form">
          <div className="form-group">
            <label htmlFor="brand">Brand:</label>
            <select
              id="brand"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              required
              className="form-control"
            >
              <option value="">Select a brand</option>
              {CAR_BRANDS.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
            {formData.brand === "Other" && (
              <input
                type="text"
                name="brand"
                placeholder="Enter your brand"
                value={formData.brandInput || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, brand: e.target.value }))
                }
                className="form-control"
                style={{ marginTop: 8 }}
                required
              />
            )}
          </div>
          <div className="form-group">
            <label htmlFor="model">Model:</label>
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
            <label htmlFor="year">Year:</label>
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
            <label htmlFor="type">Type:</label>
            <input
              type="text"
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
            />
          </div>
          <div className="form-group full-width">
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
            ></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="seats">Seats:</label>
            <input
              type="number"
              id="seats"
              name="seats"
              value={formData.seats}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="transmission">Transmission:</label>
            <select
              id="transmission"
              name="transmission"
              value={formData.transmission}
              onChange={handleChange}
            >
              <option value="">Select...</option>
              <option value="manual">Manual</option>
              <option value="automatic">Automatic</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="fuelType">Fuel Type:</label>
            <select
              id="fuelType"
              name="fuelType"
              value={formData.fuelType}
              onChange={handleChange}
            >
              <option value="">Select...</option>
              <option value="gasoline">Gasoline</option>
              <option value="diesel">Diesel</option>
              <option value="electric">Electric</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="fuelConsumption">Fuel Consumption:</label>
            <input
              type="number"
              id="fuelConsumption"
              name="fuelConsumption"
              value={formData.fuelConsumption}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="location">Location:</label>
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
            <label htmlFor="status">Status:</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="AVAILABLE">Available</option>
              <option value="RENTED">Rented</option>
              <option value="MAINTENANCE">Maintenance</option>
            </select>
          </div>

          <div className="form-group image-upload-section full-width">
            <label>Main Image:</label>
            <div className="main-image-preview">
              {formData.mainImage ? (
                <img
                  src={formData.mainImage}
                  alt="Main Car"
                  className="image-preview"
                />
              ) : (
                <p>No main image selected.</p>
              )}
            </div>
            <div className="add-image-input-group">
              <input
                type="file"
                accept="image/*"
                onChange={handleMainFileChange}
              />
              <button
                type="button"
                onClick={handleImageUpload}
                className="add-image-btn"
                disabled={uploadingImage || loading}
              >
                {uploadingImage ? "Uploading..." : "Upload Main Image"}
              </button>
            </div>
          </div>

          <div className="form-group image-upload-section full-width">
            <label>Other Images:</label>
            <div className="image-preview-container">
              {formData.otherImages.length > 0 ? (
                formData.otherImages.map((img, index) => (
                  <div key={index} className="image-preview-item">
                    <img src={img} alt="Car" className="image-preview" />
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={() => handleRemoveImage(index)}
                    >
                      &times;
                    </button>
                  </div>
                ))
              ) : (
                <p>No other images uploaded.</p>
              )}
            </div>
            <div className="add-image-input-group">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleOtherFileChange}
              />
              <button
                type="button"
                onClick={handleOtherImageUpload}
                className="add-image-btn"
                disabled={uploadingImage || loading}
              >
                {uploadingImage ? "Uploading..." : "Upload Other Images"}
              </button>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="save-btn"
              disabled={loading || uploadingImage}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={loading || uploadingImage}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCarForm;
