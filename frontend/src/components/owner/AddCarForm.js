import React, { useState } from "react";
import axios from "axios";
import cloudinaryConfig from "../../config/cloudinary";
import "./EditCarForm.css"; // Reusing the same CSS as EditCarForm

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
    mainImage: "",
    otherImages: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMainImageFile, setSelectedMainImageFile] = useState(null);
  const [selectedOtherImageFiles, setSelectedOtherImageFiles] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);

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

  const handleImageUpload = async () => {
    if (!selectedMainImageFile) {
      alert("Please select a main image file to upload.");
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
      alert("Main image uploaded successfully!");
    } catch (err) {
      console.error("Error uploading main image to Cloudinary:", err);
      setError("Failed to upload main image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleOtherImageUpload = async () => {
    if (selectedOtherImageFiles.length === 0) {
      alert(
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
      setSelectedOtherImageFiles([]);
      alert("Other images uploaded and added successfully!");
    } catch (err) {
      console.error("Error uploading other images to Cloudinary:", err);
      setError("Failed to upload other images. Please try again.");
    } finally {
      setUploadingImage(false);
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
      const requiredFields = [
        "licensePlate",
        "brand",
        "model",
        "year",
        "type",
        "seats",
        "transmission",
        "fuelType",
        "fuelConsumption",
        "location",
        "pricePerDay",
      ];
      const missingFields = requiredFields.filter((field) => !formData[field]);

      if (missingFields.length > 0) {
        setError(`Missing required fields: ${missingFields.join(", ")}`);
        setLoading(false);
        return;
      }

      const transmissionMap = {
        manual: "MANUAL",
        automatic: "AUTOMATIC",
      };

      const fuelTypeMap = {
        gasoline: "GASOLINE",
        diesel: "DIESEL",
        electric: "ELECTRIC",
        hybrid: "HYBRID",
      };

      const carData = {
        licensePlate: formData.licensePlate,
        brand: formData.brand,
        model: formData.model,
        year: parseInt(formData.year),
        type: formData.type,
        description: formData.description || "",
        seats: parseInt(formData.seats),
        transmission: transmissionMap[formData.transmission.toLowerCase()],
        fuelType: fuelTypeMap[formData.fuelType.toLowerCase()],
        fuelConsumption: parseFloat(formData.fuelConsumption),
        location: formData.location,
        pricePerDay: parseFloat(formData.pricePerDay),
        status: "PENDING",
        mainImage: formData.mainImage || "",
        otherImages: formData.otherImages || [],
      };

      const response = await axios.post(
        "http://localhost:8080/api/cars",
        carData
      );
      console.log("New car created:", response.data);

      onSave(response.data);
      alert("Car registered successfully! Waiting for admin approval.");
    } catch (err) {
      console.error("Error registering car:", err);
      setError(
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
          <div className="form-group">
            <label htmlFor="licensePlate">License Plate:</label>
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
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="pricePerDay">Price per Day (VND):</label>
            <input
              type="number"
              id="pricePerDay"
              name="pricePerDay"
              value={formData.pricePerDay}
              onChange={handleChange}
              required
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
              required
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
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="transmission">Transmission:</label>
            <select
              id="transmission"
              name="transmission"
              value={formData.transmission}
              onChange={handleChange}
              required
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
              required
            >
              <option value="">Select...</option>
              <option value="gasoline">Gasoline</option>
              <option value="diesel">Diesel</option>
              <option value="electric">Electric</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="fuelConsumption">Fuel Consumption (L/100km):</label>
            <input
              type="number"
              step="0.1"
              id="fuelConsumption"
              name="fuelConsumption"
              value={formData.fuelConsumption}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="location">Location:</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />
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
              {loading ? "Registering..." : "Register Car"}
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

export default AddCarForm;
