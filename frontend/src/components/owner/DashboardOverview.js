import React, { useEffect, useState } from "react";
import axios from "axios";
import "./DashBoard.css"
import { useCarManagement } from "../../contexts/CarManagementContext";
import { useRentalHistory } from "../../contexts/RentalHistoryContext";

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
    if (user && user.userId) {
      fetchCarsData(user.userId);
      fetchRentalsData(user.userId);
    }
  }, [user, fetchCarsData, fetchRentalsData]);

  useEffect(() => {
    setStats((prev) => ({ ...prev, totalCars: carsData.length }));
  }, [carsData]);

  useEffect(() => {
    // Đếm số lượng booking có trạng thái ongoing hoặc active
    const activeCount = rentalsData.filter(
      (r) => r.status && ["ongoing", "active"].includes(r.status.toLowerCase())
    ).length;
    setStats((prev) => ({ ...prev, activeRentals: activeCount }));
  }, [rentalsData]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user || !user.userId) return;
      setLoading(true);
      try {
        // Lấy doanh thu
        let earnings = 0;
        try {
          const earningsRes = await axios.get(
            `http://localhost:8080/api/earnings/owner/${user.userId}`
          );
          console.log("Earnings API response:", earningsRes.data);
          earnings = Number(earningsRes.data?.totalEarnings) || 0;
          console.log("Earnings value set:", earnings);
        } catch {
          earnings = 0;
        }

        // Lấy average rating
        let averageRating = null;
        try {
          const ratingRes = await axios.get(
            `http://localhost:8080/api/ratings/owner/${user.userId}`
          );
          averageRating = ratingRes.data?.averageRating ?? null;
        } catch {
          averageRating = null;
        }

        setStats((prev) => ({
          ...prev,
          earnings,
          averageRating,
        }));
      } catch (err) {
        setStats((prev) => ({
          ...prev,
          earnings: 0,
          averageRating: null,
        }));
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
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
