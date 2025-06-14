import React, { useState, useEffect } from "react";
import axios from "axios";
import EditCarForm from "./EditCarForm";
import "./CarManagementPage.css";

const CarManagementPage = ({ user }) => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCarToEdit, setCurrentCarToEdit] = useState(null);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/cars/owner/${user.userId}`
        );
        setCars(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching cars:", error);
        setError("Failed to load cars. Please try again later.");
        setLoading(false);
      }
    };

    if (user && user.userId) {
      fetchCars();
    }
  }, [user]);

  const handleDeleteCar = async (licensePlate) => {
    if (window.confirm("Are you sure you want to delete this car?")) {
      try {
        await axios.delete(`http://localhost:8080/api/cars/${licensePlate}`);
        setCars(cars.filter((car) => car.licensePlate !== licensePlate));
      } catch (error) {
        console.error("Error deleting car:", error);
        alert("Failed to delete car. Please try again.");
      }
    }
  };

  const handleStatusChange = async (licensePlate, newStatus) => {
    try {
      await axios.patch(
        `http://localhost:8080/api/cars/${licensePlate}/status`,
        {
          status: newStatus,
        }
      );
      setCars(
        cars.map((car) =>
          car.licensePlate === licensePlate
            ? { ...car, status: newStatus }
            : car
        )
      );
    } catch (error) {
      console.error("Error updating car status:", error);
      alert("Failed to update car status. Please try again.");
    }
  };

  const handleEditClick = (car) => {
    setCurrentCarToEdit(car);
    setIsEditing(true);
  };

  const handleSaveEditedCar = (updatedCar) => {
    setCars(
      cars.map((car) =>
        car.licensePlate === updatedCar.licensePlate ? updatedCar : car
      )
    );
    setIsEditing(false);
    setCurrentCarToEdit(null);
  };

  const handleCloseEditModal = () => {
    setIsEditing(false);
    setCurrentCarToEdit(null);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="car-management">
      <div className="car-management-header">
        <h2>Car Management</h2>
        <button className="add-car-btn">Add New Car</button>
      </div>

      <div className="cars-grid">
        {cars.map((car) => (
          <div key={car.licensePlate} className="car-card">
            <div className="car-image">
              {car.images && car.images.length > 0 ? (
                <img src={car.images[0]} alt={`${car.brand} ${car.model}`} />
              ) : (
                <div className="no-image">No Image Available</div>
              )}
              <div
                className="car-status-badge"
                style={{
                  backgroundColor:
                    car.status === "AVAILABLE"
                      ? "#4CAF50"
                      : car.status === "RENTED"
                      ? "#FFA726"
                      : "#F44336",
                }}
              >
                {car.status}
              </div>
            </div>
            <div className="car-info">
              <h3>
                {car.brand} {car.model}
              </h3>
              <div className="car-details">
                <p className="license-plate">
                  <i className="fas fa-car"></i> License: {car.licensePlate}
                </p>
                <p className="year">
                  <i className="fas fa-calendar"></i> Year: {car.year}
                </p>
                <p className="type">
                  <i className="fas fa-tag"></i> Type: {car.type}
                </p>
                <p className="price">
                  <i className="fas fa-dollar-sign"></i> Price: $
                  {car.pricePerDay}/day
                </p>
                <p className="location">
                  <i className="fas fa-map-marker-alt"></i> Location:{" "}
                  {car.location}
                </p>
                <p className="seats">
                  <i className="fas fa-chair"></i> Seats: {car.seats}
                </p>
                <p className="transmission">
                  <i className="fas fa-cog"></i> Transmission:{" "}
                  {car.transmission}
                </p>
              </div>
            </div>
            <div className="car-actions">
              <select
                className="status-select"
                value={car.status}
                onChange={(e) =>
                  handleStatusChange(car.licensePlate, e.target.value)
                }
              >
                <option value="AVAILABLE">Available</option>
                <option value="RENTED">Rented</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
              <button className="edit-btn" onClick={() => handleEditClick(car)}>
                <i className="fas fa-edit"></i> Edit
              </button>
              <button
                className="delete-btn"
                onClick={() => handleDeleteCar(car.licensePlate)}
              >
                <i className="fas fa-trash"></i> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {cars.length === 0 && (
        <div className="no-cars">
          <p>You haven't added any cars yet.</p>
          <button className="add-car-btn">Add Your First Car</button>
        </div>
      )}

      {isEditing && currentCarToEdit && (
        <EditCarForm
          car={currentCarToEdit}
          onSave={handleSaveEditedCar}
          onClose={handleCloseEditModal}
        />
      )}
    </div>
  );
};

export default CarManagementPage;
