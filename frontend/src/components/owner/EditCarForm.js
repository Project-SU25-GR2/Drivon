import React, { useState, useEffect } from "react";
import axios from "axios";
import cloudinaryConfig from "../../config/cloudinary"; // Import Cloudinary config
import "./EditCarForm.css"; // We will create this CSS file next
import { API_URL } from "../../api/configApi";
import { useParams, useNavigate } from "react-router-dom";
import { showErrorToast, showSuccessToast } from "../notification/notification";

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
  // 1. Thêm state cho cavetImages và cavetPreviewUrls
  const [cavetImages, setCavetImages] = useState([]);
  const [cavetPreviewUrls, setCavetPreviewUrls] = useState([]);
  // 1. Thêm state loading riêng cho từng loại ảnh
  const [mainImageUploading, setMainImageUploading] = useState(false);
  const [otherImagesUploading, setOtherImagesUploading] = useState(false);
  const [cavetImagesUploading, setCavetImagesUploading] = useState(false);

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

  const handleMainFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setMainImageUploading(true);
    if (file.size > 5 * 1024 * 1024) {
      showErrorToast("File size must not exceed 5MB");
      setMainImageUploading(false);
      return;
    }
    if (!file.type.startsWith("image/")) {
      showErrorToast("Please select an image file");
      setMainImageUploading(false);
      return;
    }
    setSelectedMainImageFile(file);

    const formDataUpload = new FormData();
    formDataUpload.append("file", file);
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
      setMainImageUploading(false);
    }
  };

  const handleOtherFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setOtherImagesUploading(true);
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        showErrorToast("File size must not exceed 5MB");
        setOtherImagesUploading(false);
        return;
      }
      if (!file.type.startsWith("image/")) {
        showErrorToast("Please select an image file");
        setOtherImagesUploading(false);
        return;
      }
    }
    setSelectedOtherImageFiles(files);

    setUploadingImage(true);
    setError(null);
    const uploadedUrls = [];

    try {
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/upload`;

      for (const file of files) {
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
      setOtherImagesUploading(false);
    }
  };

  // 2. Thêm hàm handleCavetImagesChange
  const handleCavetImagesChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setCavetImagesUploading(true);
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        showErrorToast("File size must not exceed 5MB");
        setCavetImagesUploading(false);
        return;
      }
      if (!file.type.startsWith("image/")) {
        showErrorToast("Please select an image file");
        setCavetImagesUploading(false);
        return;
      }
    }
    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
    setCavetPreviewUrls((prev) => [...prev, ...newPreviewUrls]);

    setUploadingImage(true);
    setError(null);
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
      setUploadingImage(false);
      setCavetImagesUploading(false);
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

      // 4. Khi submit, gửi cavetImages lên backend qua API /cars/images/cavet nếu có thay đổi
      if (cavetImages.length > 0) {
        const cavetImageData = {
          carId: formData.licensePlate,
          cavetImages: cavetImages,
        };
        console.log("Sending cavet image data:", cavetImageData);
        await axios.post(`${API_URL}/cars/images/cavet`, cavetImageData);
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
      showErrorToast(
        `Failed to update car: ${err.response?.data?.error || err.message}`
      );
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

          {/* 1. Main Image Upload UI giống cavet */}
          <div className="form-group full-width">
            <label style={{ fontWeight: 600, marginBottom: 8 }}>
              Main Car Image
            </label>
            <div className="partner-image-upload-section">
              <label className="partner-upload-button" htmlFor="car-main-image">
                <span>Upload Main Image</span>
                <input
                  type="file"
                  id="car-main-image"
                  accept="image/*"
                  onChange={handleMainFileChange}
                  disabled={mainImageUploading || uploadingImage}
                  style={{ display: "none" }}
                />
              </label>
              {mainImageUploading && (
                <div className="image-loading">Uploading main image...</div>
              )}
              <div className="partner-image-preview-grid">
                {formData.mainImage ? (
                  <div className="partner-image-preview-item">
                    <img src={formData.mainImage} alt="Main Preview" />
                    <button
                      type="button"
                      className="partner-remove-image-btn"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, mainImage: "" }))
                      }
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <p>No main image selected.</p>
                )}
              </div>
            </div>
            <small
              className="partner-upload-info"
              style={{ marginTop: "0.7rem", display: "block" }}
            >
              Supported formats: JPG, PNG, GIF. Max size: 5MB
            </small>
          </div>

          {/* 2. Other Images Upload UI giống cavet */}
          <div className="form-group full-width">
            <label style={{ fontWeight: 600, marginBottom: 8 }}>
              Other Car Images
            </label>
            <div className="partner-image-upload-section">
              <label
                className="partner-upload-button"
                htmlFor="car-other-images"
              >
                <span>Upload Other Images</span>
                <input
                  type="file"
                  id="car-other-images"
                  accept="image/*"
                  multiple
                  onChange={handleOtherFileChange}
                  disabled={otherImagesUploading || uploadingImage}
                  style={{ display: "none" }}
                />
              </label>
              {otherImagesUploading && (
                <div className="image-loading">Uploading other images...</div>
              )}
              <div className="partner-image-preview-grid">
                {formData.otherImages.length > 0 ? (
                  formData.otherImages.map((img, index) => (
                    <div key={index} className="partner-image-preview-item">
                      <img src={img} alt={`Other Preview ${index + 1}`} />
                      <button
                        type="button"
                        className="partner-remove-image-btn"
                        onClick={() => handleRemoveImage(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))
                ) : (
                  <p>No other images uploaded.</p>
                )}
              </div>
            </div>
            <small
              className="partner-upload-info"
              style={{ marginTop: "0.7rem", display: "block" }}
            >
              Supported formats: JPG, PNG, GIF. Max size: 5MB
            </small>
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
                  disabled={cavetImagesUploading || uploadingImage}
                  style={{ display: "none" }}
                />
              </label>
              {cavetImagesUploading && (
                <div className="image-loading">Uploading cavet images...</div>
              )}
              <div className="partner-image-preview-grid">
                {cavetPreviewUrls.map((url, index) => (
                  <div key={index} className="partner-image-preview-item">
                    <img src={url} alt={`Cavet Preview ${index + 1}`} />
                    <button
                      type="button"
                      className="partner-remove-image-btn"
                      onClick={() => {
                        setCavetImages((prev) =>
                          prev.filter((_, i) => i !== index)
                        );
                        setCavetPreviewUrls((prev) =>
                          prev.filter((_, i) => i !== index)
                        );
                      }}
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

          <div className="form-actions">
            <button
              type="submit"
              className="save-btn"
              disabled={
                loading ||
                uploadingImage ||
                mainImageUploading ||
                otherImagesUploading ||
                cavetImagesUploading
              }
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={
                loading ||
                uploadingImage ||
                mainImageUploading ||
                otherImagesUploading ||
                cavetImagesUploading
              }
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
