import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ManagerOwnerPage.css";

const DashboardOverview = ({ user }) => {
  const [stats, setStats] = useState({
    totalCars: 0,
    activeRentals: 0,
    earnings: 0,
    averageRating: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user || !user.userId) return;
      setLoading(true);
      try {
        // Lấy số xe đã đăng ký
        const carsRes = await axios.get(`/api/cars/owner/${user.userId}`);
        const totalCars = Array.isArray(carsRes.data) ? carsRes.data.length : 0;

        // Lấy số active rentals
        const rentalsRes = await axios.get(
          `/api/rentals/owner/${user.userId}?status=active`
        );
        const activeRentals = Array.isArray(rentalsRes.data)
          ? rentalsRes.data.length
          : 0;

        // Lấy doanh thu
        let earnings = 0;
        try {
          const earningsRes = await axios.get(
            `/api/earnings/owner/${user.userId}`
          );
          earnings = earningsRes.data?.total || 0;
        } catch {
          earnings = 0;
        }

        // Lấy average rating
        let averageRating = null;
        try {
          const ratingRes = await axios.get(
            `/api/ratings/owner/${user.userId}`
          );
          averageRating = ratingRes.data?.averageRating ?? null;
        } catch {
          averageRating = null;
        }

        setStats({ totalCars, activeRentals, earnings, averageRating });
      } catch (err) {
        setStats({
          totalCars: 0,
          activeRentals: 0,
          earnings: 0,
          averageRating: null,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  return (
    <div className="owner-content-page">
      <h2>Dashboard Overview</h2>
      {loading ? (
        <div style={{ textAlign: "center", color: "#888", margin: "32px 0" }}>
          Loading...
        </div>
      ) : (
        <div className="dashboard-stats">
          <div className="stat-card">
            <i className="fas fa-car"></i>
            <h3>Registered Cars</h3>
            <p>{stats.totalCars}</p>
          </div>
          <div className="stat-card">
            <i className="fas fa-calendar-check"></i>
            <h3>Active Rentals</h3>
            <p>{stats.activeRentals}</p>
          </div>
          <div className="stat-card">
            <i className="fas fa-money-bill-wave"></i>
            <h3>Revenue</h3>
            <p>₫{stats.earnings.toLocaleString()}</p>
          </div>
          <div className="stat-card">
            <i className="fas fa-star"></i>
            <h3>Average Rating</h3>
            <p>
              {stats.averageRating !== null && stats.averageRating > 0
                ? `${stats.averageRating}/5`
                : "N/A"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardOverview;
