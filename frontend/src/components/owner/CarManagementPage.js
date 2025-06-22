import React, { useState, useEffect } from "react";
import EditCarForm from "./EditCarForm";
import AddCarForm from "./AddCarForm";
import "./CarManagementPage.css";
import { useCarManagement } from "../../contexts/CarManagementContext";

const CarManagementPage = ({ user }) => {
  const { carsData, loading, error, fetchCarsData, deleteCar, updateCarStatus, addCar, updateCar } = useCarManagement();
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
      } catch (error) {
        alert("Failed to delete car. Please try again.");
      }
    }
  };

  const handleStatusChange = async (licensePlate, newStatus) => {
    try {
      await updateCarStatus(licensePlate, newStatus);
    } catch (error) {
      alert("Failed to update car status. Please try again.");
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
            <div key={car.licensePlate} className="car-card">
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
