import React, { useEffect, useState } from "react";
import axios from "axios";
import "./DashBoard.css";
import { useCarManagement } from "../../contexts/CarManagementContext";
import { useRentalHistory } from "../../contexts/RentalHistoryContext";
import { API_URL } from "../../api/configApi";
const DashboardOverview = ({ user }) => {
  const { carsData, fetchCarsData, loading: carsLoading } = useCarManagement();
  const {
    rentalsData,
    fetchRentalsData,
    loading: rentalsLoading,
  } = useRentalHistory();
  const [stats, setStats] = useState({
    totalCars: 0,
    activeRentals: 0,
    earnings: 0,
    averageRating: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("user in DashboardOverview:", user);
    if (user && user.userId) {
      fetchCarsData(user.userId);
      fetchRentalsData(user.userId);
    }
  }, [user, fetchCarsData, fetchRentalsData]);

  useEffect(() => {
    setStats((prev) => ({ ...prev, totalCars: carsData.length }));
  }, [carsData]);

  useEffect(() => {
    // Đếm số lượng booking có trạng thái approved hoặc ongoing
    const activeCount = rentalsData.filter(
      (r) =>
        r.status && ["approved", "ongoing"].includes(r.status.toLowerCase())
    ).length;
    setStats((prev) => ({ ...prev, activeRentals: activeCount }));
  }, [rentalsData]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch earnings
        const earningsRes = await axios.get(
          `${API_URL}/earnings/owner/${user.userId}`
        );
        const totalEarnings = earningsRes.data?.totalEarnings ?? 0;

        // Fetch total cars
        const carsRes = await axios.get(`${API_URL}/cars/owner/${user.userId}`);
        const totalCars = carsRes.data?.length ?? 0;

        // Fetch average rating - Sử dụng endpoint mới
        const ratingRes = await axios.get(
          `${API_URL}/reviews/owner/${user.userId}`
        );
        const averageRating = ratingRes.data?.averageRating ?? null;

        // Fetch total bookings
        const bookingsRes = await axios.get(
          `${API_URL}/bookings/owner/${user.userId}`
        );
        const totalBookings = bookingsRes.data?.length ?? 0;

        setStats({
          earnings: totalEarnings,
          totalCars,
          averageRating,
          totalBookings,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.userId) {
      fetchStats();
    }
  }, [user]);

  return (
    <div className="owner-content-page">
      <h2>Dashboard Overview</h2>
      {loading || carsLoading || rentalsLoading ? (
        <div style={{ textAlign: "center", color: "#888", margin: "32px 0" }}>
          Loading...
        </div>
      ) : (
        <div className="dashboard-stats">
          <div className="stat-card blue">
            <div className="icon-wrapper">
              <i className="fas fa-car"></i>
            </div>
            <h3>Registered Cars</h3>
            <p className="stat-value">{stats.totalCars}</p>
            <div className="progress-line"></div>
          </div>
          <div className="stat-card green">
            <div className="icon-wrapper">
              <i className="fas fa-clock"></i>
            </div>
            <h3>Active Rentals</h3>
            <p className="stat-value">{stats.activeRentals}</p>
            <div className="progress-line"></div>
          </div>
          <div className="stat-card purple">
            <div className="icon-wrapper">
              <i className="fas fa-dollar-sign"></i>
            </div>
            <h3>Revenue</h3>
            <p className="stat-value">₫{stats.earnings.toLocaleString()}</p>
            <div className="progress-line"></div>
          </div>
          <div className="stat-card orange">
            <div className="icon-wrapper">
              <i className="fas fa-star"></i>
            </div>
            <h3>Average Rating</h3>
            <p className="stat-value">
              {stats.averageRating !== null && stats.averageRating > 0
                ? `${stats.averageRating}/5`
                : "N/A"}
            </p>
            <div className="progress-line"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardOverview;
