import React, { useState, useEffect } from "react";
import axios from "axios";

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "cancelled", label: "Cancelled" },
  { value: "ongoing", label: "Ongoing" },
  { value: "completed", label: "Completed" },
];

const RentalHistoryPage = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");

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
        const response = await axios.get(
          `http://localhost:8080/api/bookings/owner/${user.userId}`
        );
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
              </tr>
            </thead>
            <tbody>
              {rentals
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
                    <td>
                      <select
                        className={`form-select status-badge ${rental.status
                          ?.toLowerCase()
                          .replace(" ", "-")}`}
                        value={rental.status}
                        onChange={async (e) => {
                          const newStatus = e.target.value;
                          try {
                            await axios.put(
                              `http://localhost:8080/api/bookings/status/${rental.id}`,
                              { status: newStatus },
                              {
                                headers: { "Content-Type": "application/json" },
                              }
                            );
                            setRentals((prev) =>
                              prev.map((item) =>
                                item.id === rental.id
                                  ? { ...item, status: newStatus }
                                  : item
                              )
                            );
                          } catch (err) {
                            alert("Cập nhật trạng thái thất bại!");
                          }
                        }}
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
  );
};

export default RentalHistoryPage;
