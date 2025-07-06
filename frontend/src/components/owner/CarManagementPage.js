import React, { useState, useEffect } from "react";
import EditCarForm from "./EditCarForm";
import AddCarForm from "./AddCarForm";
import "./CarManagementPage.css";
import { useCarManagement } from "../../contexts/CarManagementContext";
import { API_URL } from '../../api/configApi';
import { showErrorToast, showSuccessToast } from '../notification/notification';    
const CarManagementPage = ({ user }) => {
  const {
    carsData,
    loading,
    error,
    fetchCarsData,
    deleteCar,
    updateCarStatus,
    addCar,
    updateCar,
  } = useCarManagement();
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [currentCarToEdit, setCurrentCarToEdit] = useState(null);

  useEffect(() => {
    if (user && user.userId) {
      fetchCarsData(user.userId);
    }
  }, [user, fetchCarsData]);

  const handleDeleteCar = async (licensePlate) => {
    if (window.confirm("Are you sure you want to delete this car?")) {
      try {
        await deleteCar(licensePlate);
        showSuccessToast("Car deleted successfully!");
      } catch (error) {
        showErrorToast("Failed to delete car. Please try again.");
      }
    }
  };

  const handleStatusChange = async (licensePlate, newStatus) => {
    try {
      await updateCarStatus(licensePlate, newStatus);
      showSuccessToast("Car status updated successfully!");
    } catch (error) {
      showErrorToast("Failed to update car status. Please try again.");
    }
  };

  const handleEditClick = (car) => {
    setCurrentCarToEdit(car);
    setIsEditing(true);
  };

  const handleSaveEditedCar = (updatedCar) => {
    console.log(
      "Updated car received from EditCarForm:",
      JSON.stringify(updatedCar, null, 2)
    );

    updateCar(updatedCar);
    setIsEditing(false);
    setCurrentCarToEdit(null);
  };

  const handleCloseEditModal = () => {
    setIsEditing(false);
    setCurrentCarToEdit(null);
  };

  const handleAddNewCar = (newCar) => {
    addCar(newCar);
    setIsAdding(false);
  };

  const handleCloseAddModal = () => {
    setIsAdding(false);
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
        <h2>Approved Cars Management</h2>
        <button className="add-car-btn" onClick={() => setIsAdding(true)}>
          Register New Car
        </button>
      </div>

      <div className="cars-grid">
        {console.log("Rendering cars:", carsData)}
        {carsData.map((car) => {
          console.log("Car object before rendering image:", car);
          return (
            <div key={car.licensePlate} className="car-management-card">
              <div className="car-image">
                {car.images && car.images.length > 0 ? (
                  <img
                    src={`${car.images[0]}?_t=${new Date().getTime()}`}
                    alt={`${car.brand} ${car.model}`}
                  />
                ) : (
                  <div className="no-image">No Image Available</div>
                )}
                <div
                  className="car-status-badge"
                  style={{
                    backgroundColor: "#4CAF50",
                  }}
                >
                  ACTIVE_LEASE
                </div>
              </div>
              <div className="car-info">
                <h3>
                  {car.brand} {car.model}
                </h3>
                <p className="car-desc">Premium SUV Experience</p>
                <div className="car-attributes-row">
                  <div className="car-attribute-box">
                    <i className="fas fa-car"></i>
                    <div>
                      <div className="attr-title">License</div>
                      <div className="attr-value">{car.licensePlate}</div>
                    </div>
                  </div>
                  <div className="car-attribute-box">
                    <i className="fas fa-calendar"></i>
                    <div>
                      <div className="attr-title">Year</div>
                      <div className="attr-value">{car.year}</div>
                    </div>
                  </div>
                </div>
                <div className="car-attributes-row">
                  <div className="car-attribute-box">
                    <i className="fas fa-user-friends"></i>
                    <div>
                      <div className="attr-title">Seats</div>
                      <div className="attr-value">{car.seats} People</div>
                    </div>
                  </div>
                  <div className="car-attribute-box">
                    <i className="fas fa-cogs"></i>
                    <div>
                      <div className="attr-title">Transmission</div>
                      <div className="attr-value">{car.transmission}</div>
                    </div>
                  </div>
                </div>
                <div className="car-location-box">
                  <i className="fas fa-map-marker-alt"></i>
                  <span>{car.location}</span>
                </div>
                <div className="car-price-box">
                  <i className="fas fa-dollar-sign"></i>
                  <span>
                    {car.pricePerDay
                      ? `${car.pricePerDay.toLocaleString('vi-VN')} VNĐ/ngày`
                      : "Liên hệ để biết giá"}
                  </span>
                </div>
              </div>
              <div className="car-actions">
                <button
                  className="edit-btn"
                  onClick={() => handleEditClick(car)}
                >
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
          );
        })}
      </div>

      {carsData.length === 0 && (
        <div className="no-cars">
          <p>You don't have any approved cars yet.</p>
          <p>Register your car and wait for admin approval to start renting.</p>
          <button className="add-car-btn" onClick={() => setIsAdding(true)}>
            Register Your First Car
          </button>
        </div>
      )}

      {isEditing && currentCarToEdit && (
        <EditCarForm
          car={currentCarToEdit}
          onSave={handleSaveEditedCar}
          onClose={handleCloseEditModal}
        />
      )}

      {isAdding && (
        <AddCarForm onSave={handleAddNewCar} onClose={handleCloseAddModal} />
      )}
    </div>
  );
};

export default CarManagementPage;
