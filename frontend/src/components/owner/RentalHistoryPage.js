import React, { useState, useEffect } from "react";
import axios from "axios";

const RentalHistoryPage = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRentals = async () => {
      setLoading(true);
      setError(null);
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !user.userId) {
          setError("Không tìm thấy thông tin người dùng.");
          setLoading(false);
          return;
        }
        const response = await axios.get(`/api/bookings/owner/${user.userId}`);
        setRentals(response.data);
      } catch (err) {
        setError("Lỗi khi tải dữ liệu lịch sử thuê xe.");
      } finally {
        setLoading(false);
      }
    };
    fetchRentals();
  }, []);

  return (
    <div className="owner-content-page">
      <div className="page-header">
        <h2>Rental History</h2>
        <div className="filters">
          <select className="form-select">
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="in-progress">In Progress</option>
            <option value="cancelled">Cancelled</option>
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
        <div className="rental-list">
          <table className="table">
            <thead>
              <tr>
                <th>Car</th>
                <th>Renter</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th>Total Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rentals.map((rental) => (
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
                  <td>
                    <span
                      className={`status-badge ${rental.status
                        ?.toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {rental.status}
                    </span>
                  </td>
                  <td>
                    {rental.totalPrice?.toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}
                  </td>
                  <td>
                    <button className="btn btn-sm btn-info">
                      <i className="fas fa-eye"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RentalHistoryPage;
