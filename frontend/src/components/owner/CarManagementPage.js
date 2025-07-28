import React, { useState, useEffect } from "react";
import EditCarForm from "./EditCarForm";
import AddCarForm from "./AddCarForm";
import "./CarManagementPage.css";
import { useCarManagement } from "../../contexts/CarManagementContext";
import { useCarData } from "../../contexts/CarDataContext";
import { showErrorToast, showSuccessToast } from "../notification/notification";
import axios from "axios";
import { API_URL } from "../../api/configApi";

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
  const { refreshCarsData } = useCarData();
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [currentCarToEdit, setCurrentCarToEdit] = useState(null);
  const [bookingStatuses, setBookingStatuses] = useState({}); // Lưu trạng thái booking cho từng xe
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [carToDelete, setCarToDelete] = useState(null);

  useEffect(() => {
    if (user && user.userId) {
      fetchCarsData(user.userId);
      fetchBookingStatuses(user.userId);
    }
  }, [user, fetchCarsData]);

  // Fetch booking statuses for all cars
  const fetchBookingStatuses = async (ownerId) => {
    try {
      const response = await axios.get(`${API_URL}/bookings/owner/${ownerId}`);
      const bookings = response.data || [];

      // Tạo map để lưu trạng thái booking cho từng xe
      const statusMap = {};
      bookings.forEach((booking) => {
        if (booking.car?.licensePlate) {
          // Nếu xe đã có booking, kiểm tra xem có booking ongoing không
          if (
            !statusMap[booking.car.licensePlate] ||
            booking.status?.toLowerCase() === "ongoing"
          ) {
            statusMap[booking.car.licensePlate] = booking.status?.toLowerCase();
          }
        }
      });

      setBookingStatuses(statusMap);
    } catch (error) {
      console.error("Error fetching booking statuses:", error);
    }
  };

  // Function to check if car has ongoing booking
  const hasOngoingBooking = (car) => {
    const bookingStatus = bookingStatuses[car.licensePlate];
    return bookingStatus === "ongoing";
  };

  // Function to get car status based on booking status
  const getCarStatus = (car) => {
    if (hasOngoingBooking(car)) {
      return "unavailable"; // Force unavailable when car is being rented
    }
    return car.status || "available";
  };

  // Function to check if car can be edited
  const canEditCar = (car) => {
    return !hasOngoingBooking(car); // Can't edit when car is being rented
  };

  const handleStatusChange = async (licensePlate, newStatus) => {
    try {
      await updateCarStatus(licensePlate, newStatus);
      showSuccessToast("Car status updated successfully!");
      refreshCarsData(); // Force refresh car data for rent page
    } catch (error) {
      showErrorToast("Failed to update car status. Please try again.");
    }
  };

  const handleEditClick = (car) => {
    if (!canEditCar(car)) {
      showErrorToast("Cannot edit car while it is being rented!");
      return;
    }
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

  const handleDeleteClick = (car) => {
    if (!canEditCar(car)) {
      showErrorToast("Cannot delete car while it is being rented!");
      return;
    }
    setCarToDelete(car);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!carToDelete) return;

    try {
      await deleteCar(carToDelete.licensePlate);
      showSuccessToast("Car deleted successfully!");
      refreshCarsData();
      setShowDeleteModal(false);
      setCarToDelete(null);
    } catch (error) {
      showErrorToast("Failed to delete car. Please try again.");
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setCarToDelete(null);
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
          const carStatus = getCarStatus(car);
          const isBeingRented = hasOngoingBooking(car);
          const canEdit = canEditCar(car);

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
                {/* Status badge thay thế ACTIVE_LEASE */}
                <div
                  className="car-status-badge"
                  style={{
                    backgroundColor: isBeingRented
                      ? "#ef4444" // Đỏ khi đang được thuê
                      : carStatus === "available"
                      ? "#10b981" // Xanh lá khi available
                      : "#f59e0b", // Vàng khi unavailable
                    color: "white",
                  }}
                >
                  {isBeingRented
                    ? "RENTED"
                    : carStatus === "available"
                    ? "AVAILABLE"
                    : "UNAVAILABLE"}
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
                      ? `${car.pricePerDay.toLocaleString("en-US")} VND/day`
                      : "Contact for price"}
                  </span>
                </div>
              </div>
              <div className="car-actions">
                {/* Chỉ hiển thị dropdown khi xe không đang được thuê */}
                {!isBeingRented && (
                  <select
                    value={carStatus}
                    onChange={(e) =>
                      handleStatusChange(car.licensePlate, e.target.value)
                    }
                    className={`car-status-dropdown${
                      carStatus === "unavailable" ? " unavailable" : ""
                    }`}
                  >
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                )}
                <button
                  className={`edit-btn ${!canEdit ? "disabled" : ""}`}
                  onClick={() => handleEditClick(car)}
                  disabled={!canEdit}
                  title={
                    !canEdit
                      ? "Cannot edit car while it is being rented"
                      : "Edit car information"
                  }
                >
                  <i className="fas fa-edit"></i> Edit
                </button>
                <button
                  className={`delete-btn ${!canEdit ? "disabled" : ""}`}
                  onClick={() => handleDeleteClick(car)}
                  disabled={!canEdit}
                  title={
                    !canEdit
                      ? "Cannot delete car while it is being rented"
                      : "Delete car"
                  }
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && carToDelete && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <div className="delete-modal-header">
              <h3>Confirm Delete</h3>
              <button
                className="delete-modal-close"
                onClick={handleCancelDelete}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="delete-modal-content">
              <div className="delete-modal-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <p>
                Are you sure you want to delete{" "}
                <strong>
                  {carToDelete.brand} {carToDelete.model}
                </strong>
                ?
              </p>
              <p className="delete-modal-warning">
                This action cannot be undone. All car data and images will be
                permanently deleted.
              </p>
            </div>
            <div className="delete-modal-actions">
              <button
                className="delete-modal-cancel"
                onClick={handleCancelDelete}
              >
                Cancel
              </button>
              <button
                className="delete-modal-confirm"
                onClick={handleConfirmDelete}
              >
                Delete Car
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarManagementPage;
