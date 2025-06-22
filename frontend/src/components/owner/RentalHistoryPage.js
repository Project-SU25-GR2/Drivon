import React, { useState, useEffect } from "react";
import styles from "./RentalHistoryPage.module.css";
import { useRentalHistory } from "../../contexts/RentalHistoryContext";

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "cancelled", label: "Cancelled" },
  { value: "ongoing", label: "Ongoing" },
  { value: "completed", label: "Completed" },
];

const RentalHistoryPage = () => {
  const { rentalsData, loading, error, fetchRentalsData, updateRentalStatus } = useRentalHistory();
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.userId) {
      fetchRentalsData(user.userId);
    }
  }, [fetchRentalsData]);

  const handleStatusChange = async (rentalId, newStatus) => {
    try {
      await updateRentalStatus(rentalId, newStatus);
    } catch (err) {
      alert("Cập nhật trạng thái thất bại!");
    }
  };

  return (
    <div className={styles.mainContent}>
      <div className={styles.ownerContentPage}>
        <div className={styles.pageHeader}>
          <h2 className={styles.h2Title}>Rental History</h2>
          <div className={styles.filters}>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="cancelled">Cancelled</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
            <input
              type="date"
              className="form-control"
              placeholder="Filter by date"
            />
          </div>
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div style={{ color: "red" }}>{error}</div>
        ) : (
          <div className={styles.rentalList}>
            <table className="table">
              <thead>
                <tr>
                  <th>Car</th>
                  <th>Renter</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Pickup Location</th>
                  <th>Dropoff Location</th>
                  <th>Status</th>
                  <th>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {rentalsData
                  .filter(
                    (rental) =>
                      !statusFilter ||
                      rental.status?.toLowerCase() === statusFilter
                  )
                  .map((rental) => (
                    <tr key={rental.id}>
                      <td>
                        {rental.car?.brand} {rental.car?.model} (
                        {rental.car?.licensePlate})
                      </td>
                      <td>
                        {rental.renter?.fullName ||
                          rental.renter?.email ||
                          rental.renter?.id}
                      </td>
                      <td>{rental.startTime?.slice(0, 10)}</td>
                      <td>{rental.endTime?.slice(0, 10)}</td>
                      <td>{rental.pickupLocation}</td>
                      <td>{rental.dropoffLocation}</td>
                      <td>
                        <select
                          className={`form-select status-badge ${rental.status
                            ?.toLowerCase()
                            .replace(" ", "-")}`}
                          value={rental.status}
                          onChange={(e) => handleStatusChange(rental.id, e.target.value)}
                        >
                          {statusOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        {rental.totalPrice?.toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        })}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RentalHistoryPage;
