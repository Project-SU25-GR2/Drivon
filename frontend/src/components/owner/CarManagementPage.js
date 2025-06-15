import React, { useState, useEffect } from "react";
import axios from "axios";
import EditCarForm from "./EditCarForm";
import { useNavigate } from "react-router-dom";
import "./CarManagementPage.css";

const CarManagementPage = ({ user }) => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCarToEdit, setCurrentCarToEdit] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCars = async () => {
      try {
        // Fetch cars for the current owner
        const response = await axios.get(
          `http://localhost:8080/api/cars/owner/${user.userId}`
        );
        console.log("API Response:", response.data);
        console.log("User ID:", user.userId);

        // Combine mainImage and otherImages into a single images array for display
        const carsWithCombinedImages = response.data.map((car) => ({
          ...car,
          images: car.mainImage
            ? [car.mainImage, ...(car.otherImages || [])]
            : car.otherImages || [],
        }));
        setCars(carsWithCombinedImages);
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
    console.log(
      "Updated car received from EditCarForm:",
      JSON.stringify(updatedCar, null, 2)
    );

    // Combine mainImage and otherImages into a single images array for the updated car
    const updatedCarWithImages = {
      ...updatedCar,
      images: updatedCar.mainImage
        ? [updatedCar.mainImage, ...(updatedCar.otherImages || [])]
        : updatedCar.otherImages || [],
    };

    setCars(
      cars.map((car) =>
        car.licensePlate === updatedCarWithImages.licensePlate
          ? updatedCarWithImages
          : car
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
        <h2>Approved Cars Management</h2>
        <button
          className="add-car-btn"
          onClick={() => {
            console.log("Navigating to /rent-your-car");
            navigate("/rent-your-car");
          }}
        >
          Register New Car
        </button>
      </div>

      <div className="cars-grid">
        {console.log("Rendering cars:", cars)}
        {cars.map((car) => {
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

      {cars.length === 0 && (
        <div className="no-cars">
          <p>You don't have any approved cars yet.</p>
          <p>Register your car and wait for admin approval to start renting.</p>
          <button
            className="add-car-btn"
            onClick={() => {
              console.log("Navigating to /rent-your-car from empty state");
              navigate("/rent-your-car");
            }}
          >
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
    </div>
  );
};

export default CarManagementPage;
