import React, { useState, useEffect } from "react";
import "./BookingManager.css";
import { useRentalHistory } from "../../contexts/RentalHistoryContext";
import {
  FaCar,
  FaClipboardCheck,
  FaMoneyBillWave,
  FaCalendarAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { API_URL } from '../../api/configApi';
import { showErrorToast, showSuccessToast } from '../toast/notification';

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "cancelled", label: "Cancelled" },
  { value: "ongoing", label: "Ongoing" },
  { value: "completed", label: "Completed" },
];
const RentalStats = ({ stats }) => (
  <div className="statsGrid">
    <div className="statCard">
      <div className="statIcon">
        <FaCar />
      </div>
      <div>
        <div className="statValue">{stats.totalRentals}</div>
        <div className="statLabel">Total Rentals</div>
      </div>
    </div>
    <div className="statCard">
      <div className="statIcon">
        <FaClipboardCheck />
      </div>
      <div>
        <div className="statValue" style={{ color: "#27ae60" }}>
          {stats.completed}
        </div>
        <div className="statLabel">Completed</div>
      </div>
    </div>
    <div className="statCard">
      <div className="statIcon">
        <FaMoneyBillWave />
      </div>
      <div>
        <div className="statValue" style={{ color: "#f1c40f" }}>
          {stats.totalRevenue?.toLocaleString("vi-VN")} đ
        </div>
        <div className="statLabel">Total Revenue</div>
      </div>
    </div>
    <div className="statCard">
      <div className="statIcon">
        <FaCalendarAlt />
      </div>
      <div>
        <div className="statValue">{stats.thisMonth}</div>
        <div className="statLabel">This Month</div>
      </div>
    </div>
  </div>
);

const RentalFilters = ({
  statusFilter,
  setStatusFilter,
  search,
  setSearch,
  date,
  setDate,
  onFilter,
  onExport,
}) => (
  <div className="filtersBar">
    <input
      className="searchInput"
      type="text"
      placeholder="Search by car, renter, or location..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
    <select
      className="statusSelect"
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
    >
      <option value="">All Status</option>
      {statusOptions.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    <input
      className="dateInput"
      type="date"
      value={date}
      onChange={(e) => setDate(e.target.value)}
    />
    <button className="filterBtn" onClick={onFilter}>
      Filter
    </button>
    <button className="exportBtn" onClick={onExport}>
      Export
    </button>
  </div>
);

const RentalHistoryPage = () => {
  const { rentalsData, loading, error, fetchRentalsData, updateRentalStatus } =
    useRentalHistory();
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [hoveredRow, setHoveredRow] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.userId) {
      fetchRentalsData(user.userId);
    }
  }, [fetchRentalsData]);

  // Stats calculation
  const stats = {
    totalRentals: rentalsData.length,
    completed: rentalsData.filter((r) => r.status === "completed").length,
    totalRevenue: rentalsData.reduce((sum, r) => sum + (r.totalPrice || 0), 0),
    thisMonth: rentalsData.filter(
      (r) => new Date(r.startTime).getMonth() === new Date().getMonth()
    ).length,
  };

  // Filtered data
  const filteredData = rentalsData.filter((rental) => {
    const matchesStatus =
      !statusFilter || rental.status?.toLowerCase() === statusFilter;
    const matchesSearch =
      !search ||
      rental.car?.brand?.toLowerCase().includes(search.toLowerCase()) ||
      rental.car?.model?.toLowerCase().includes(search.toLowerCase()) ||
      rental.renter?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      rental.pickupLocation?.toLowerCase().includes(search.toLowerCase()) ||
      rental.dropoffLocation?.toLowerCase().includes(search.toLowerCase());
    const matchesDate = !date || rental.startTime?.slice(0, 10) === date;
    return matchesStatus && matchesSearch && matchesDate;
  });

  const handleStatusChange = async (rentalId, newStatus) => {
    try {
      await updateRentalStatus(rentalId, newStatus);
      showSuccessToast("Status updated successfully!");
    } catch (err) {
      showErrorToast("Failed to update status!");
    }
  };

  const getPaymentStatusStyle = (status) => {
    switch (status) {
      case "PAID":
        return { color: "green", fontWeight: "bold" };
      case "PENDING":
      case "Not Paid":
        return { color: "red", fontWeight: "bold" };
      default:
        return {};
    }
  };

  return (
    <div className="mainContent">
      <h2 className="h2Title">Rental History</h2>
      <p className="subtitle">Manage and track all your rental bookings</p>
      <RentalStats stats={stats} />
      <RentalFilters
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        search={search}
        setSearch={setSearch}
        date={date}
        setDate={setDate}
        onFilter={() => {}}
        onExport={() => {}}
      />
      <div className="rentalList">
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div style={{ color: "red" }}>{error}</div>
        ) : (
          <table className="rentalTable">
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
              {filteredData.map((rental) => (
                <tr
                  key={rental.id}
                  onMouseEnter={() => setHoveredRow(rental.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{ position: "relative" }}
                >
                  <td>
                    <b>
                      {rental.car?.brand} {rental.car?.model}
                    </b>
                    <div className="licensePlate">
                      {rental.car?.licensePlate}
                    </div>
                  </td>
                  <td style={{ position: "relative" }}>
                    <button
                      className="chatIconBtn"
                      style={{
                        background: "none",
                        border: "none",
                        marginRight: 8,
                        cursor: "pointer",
                        verticalAlign: "middle",
                        fontSize: 20,
                        color: "#6c63ff"
                      }}
                      title="Nhắn tin với người thuê"
                      onClick={() => {
                        console.log('Renter info:', rental.renter);
                        navigate("/messages", {
                          state: {
                            selectedUser: {
                              id: rental.renter?.userId || rental.renter?.id || rental.renter?._id,
                              name: rental.renter?.fullName || rental.renter?.email || rental.renter?.id,
                              avatar: rental.renter?.avatar || undefined,
                            },
                          },
                        });
                      }}
                    >
                      <i className="bi bi-chat-dots"></i>
                    </button>
                    {rental.renter?.fullName ||
                      rental.renter?.email ||
                      rental.renter?.id}
                  </td>
                  <td>{rental.startTime?.slice(0, 10)}</td>
                  <td>{rental.endTime?.slice(0, 10)}</td>
                  <td>
                    <span className="locationTag">{rental.pickupLocation}</span>
                  </td>
                  <td>
                    <span className="locationTag">
                      {rental.dropoffLocation}
                    </span>
                  </td>
                  <td>
                    <select
                      className={`${"statusBadge"} ${
                        "statusBadge" + rental.status?.toLowerCase()
                      }`}
                      value={rental.status}
                      onChange={(e) =>
                        handleStatusChange(rental.id, e.target.value)
                      }
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td style={getPaymentStatusStyle(rental.paymentStatus)}>
                    {rental.totalPrice?.toLocaleString("vi-VN")} đ
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default RentalHistoryPage;
