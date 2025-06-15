import React, { useState, useEffect } from "react";
import axios from "axios";
import cloudinaryConfig from "../../config/cloudinary"; // Import Cloudinary config
import "./EditCarForm.css"; // We will create this CSS file next

const EditCarForm = ({ car, onSave, onClose }) => {
  const modalRef = React.useRef();
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
  const [selectedFile, setSelectedFile] = useState(null); // State for selected file object
  const [uploadingImage, setUploadingImage] = useState(false); // State to indicate image is being uploaded

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

  // Effect to handle clicks outside the modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    // Attach the event listener to the document
    document.addEventListener("mousedown", handleClickOutside);

    // Clean up the event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleRemoveImage = (indexToRemove) => {
    setFormData((prevData) => ({
      ...prevData,
      otherImages: prevData.otherImages.filter(
        (_, index) => index !== indexToRemove
      ),
    }));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    console.log("File selected:", e.target.files[0]);
  };

  const handleImageUpload = async () => {
    console.log("Attempting to upload file:", selectedFile);
    if (!selectedFile) {
      alert("Please select an image file to upload.");
      return;
    }

    const formDataUpload = new FormData();
    formDataUpload.append("file", selectedFile);
    formDataUpload.append("upload_preset", cloudinaryConfig.uploadPreset);
    formDataUpload.append("api_key", cloudinaryConfig.apiKey);

    setUploadingImage(true); // Set uploading state
    setError(null);

    try {
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/upload`;
      const uploadResponse = await axios.post(cloudinaryUrl, formDataUpload);

      const uploadedImageUrl = uploadResponse.data.secure_url; // Cloudinary returns secure_url

      setFormData((prevData) => ({
        ...prevData,
        mainImage: uploadedImageUrl, // Update mainImage instead of adding to otherImages
      }));
      setSelectedFile(null); // Clear selected file
      alert("Main image uploaded and updated successfully!");
    } catch (err) {
      console.error("Error uploading image to Cloudinary:", err);
      setError(
        "Failed to upload image. Please check your Cloudinary configuration and network connection."
      );
    } finally {
      setUploadingImage(false); // Reset uploading state
    }
  };

  const handleOtherImageUpload = async () => {
    if (!selectedFile) {
      alert("Please select an image file to upload for other images.");
      return;
    }

    const formDataUploadOther = new FormData();
    formDataUploadOther.append("file", selectedFile);
    formDataUploadOther.append("upload_preset", cloudinaryConfig.uploadPreset);
    formDataUploadOther.append("api_key", cloudinaryConfig.apiKey);

    setUploadingImage(true);
    setError(null);

    try {
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/upload`;
      const uploadResponse = await axios.post(
        cloudinaryUrl,
        formDataUploadOther
      );
      const uploadedImageUrl = uploadResponse.data.secure_url;

      setFormData((prevData) => ({
        ...prevData,
        otherImages: [...prevData.otherImages, uploadedImageUrl],
      }));
      setSelectedFile(null);
      alert("Other image uploaded and added successfully!");
    } catch (err) {
      console.error("Error uploading other image to Cloudinary:", err);
      setError("Failed to upload other image. Please try again.");
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
        `http://localhost:8080/api/cars/${formData.licensePlate}`,
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

        await axios.post("http://localhost:8080/api/cars/images", imageData);
      }

      onSave(response.data);
      alert("Car updated successfully!");
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-car-modal-overlay">
      <div className="edit-car-modal" ref={modalRef}>
        <div className="edit-car-modal-header">
          <h2>Edit Car Information</h2>
        </div>

        {loading && <div className="loading">Updating car...</div>}
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="edit-car-form">
          <div className="form-group">
            <label htmlFor="brand">Brand:</label>
            <input
              type="text"
              id="brand"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              required
            />
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
          <div className="form-group">
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
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
            />
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

          <div className="form-group image-upload-section">
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
              <input type="file" accept="image/*" onChange={handleFileChange} />
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

          <div className="form-group image-upload-section">
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
              <input type="file" accept="image/*" onChange={handleFileChange} />
              <button
                type="button"
                onClick={handleOtherImageUpload}
                className="add-image-btn"
                disabled={uploadingImage || loading}
              >
                {uploadingImage ? "Uploading..." : "Upload Other Image"}
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
