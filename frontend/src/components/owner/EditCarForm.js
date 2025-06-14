import React, { useState, useEffect } from "react";
import axios from "axios";
import cloudinaryConfig from "../../config/cloudinary"; // Import Cloudinary config
import "./EditCarForm.css"; // We will create this CSS file next

const EditCarForm = ({ car, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    licensePlate: "",
    brand: "",
    model: "",
    year: "",
    type: "",
    color: "",
    pricePerDay: "",
    description: "",
    seats: "",
    transmission: "",
    fuelType: "",
    location: "",
    images: [],
    status: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newImageUrl, setNewImageUrl] = useState(""); // State for new image URL input
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
        color: car.color || "",
        pricePerDay: car.pricePerDay || "",
        description: car.description || "",
        seats: car.seats || "",
        transmission: car.transmission || "",
        fuelType: car.fuelType || "",
        location: car.location || "",
        images: car.images || [],
        status: car.status || "",
      });
    }
  }, [car]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleAddImage = () => {
    if (newImageUrl.trim() !== "") {
      setFormData((prevData) => ({
        ...prevData,
        images: [...prevData.images, newImageUrl.trim()],
      }));
      setNewImageUrl(""); // Clear the input field
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData((prevData) => ({
      ...prevData,
      images: prevData.images.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleImageUpload = async () => {
    if (!selectedFile) {
      alert("Please select an image file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("upload_preset", cloudinaryConfig.uploadPreset);
    formData.append("api_key", cloudinaryConfig.apiKey);

    setUploadingImage(true); // Set uploading state
    setError(null);

    try {
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/upload`;
      const uploadResponse = await axios.post(cloudinaryUrl, formData);

      const uploadedImageUrl = uploadResponse.data.secure_url; // Cloudinary returns secure_url

      setFormData((prevData) => ({
        ...prevData,
        images: [...prevData.images, uploadedImageUrl],
      }));
      setSelectedFile(null); // Clear selected file
      alert("Image uploaded and added successfully!");
    } catch (err) {
      console.error("Error uploading image to Cloudinary:", err);
      setError(
        "Failed to upload image. Please check your Cloudinary configuration and network connection."
      );
    } finally {
      setUploadingImage(false); // Reset uploading state
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.put(
        `http://localhost:8080/api/cars/${formData.licensePlate}`,
        formData
      );
      onSave(response.data); // Pass updated car data back to parent
      alert("Car updated successfully!");
    } catch (err) {
      console.error("Error updating car:", err);
      setError("Failed to update car. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-car-modal-overlay">
      <div className="edit-car-modal">
        <div className="edit-car-modal-header">
          <h2>Edit Car Information</h2>
          <button className="close-modal-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="edit-car-form">
          {error && <div className="error-message">{error}</div>}

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
            <label htmlFor="color">Color:</label>
            <input
              type="text"
              id="color"
              name="color"
              value={formData.color}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="pricePerDay">Price Per Day ($):</label>
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
              <option value="MANUAL">Manual</option>
              <option value="AUTOMATIC">Automatic</option>
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
              <option value="PETROL">Petrol</option>
              <option value="DIESEL">Diesel</option>
              <option value="ELECTRIC">Electric</option>
            </select>
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
            <label>Car Images:</label>
            <div className="image-preview-container">
              {formData.images.length > 0 ? (
                formData.images.map((img, index) => (
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
                <p>No images uploaded.</p>
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
                {uploadingImage ? "Uploading..." : "Upload Image"}
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
