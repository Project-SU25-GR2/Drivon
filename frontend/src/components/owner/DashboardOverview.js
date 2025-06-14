import React from "react";
import "./ManagerOwnerPage.css";

const DashboardOverview = () => {
  return (
    <div className="owner-content-page">
      <h2>Dashboard Overview</h2>
      <div className="dashboard-stats">
        <div className="stat-card">
          <i className="fas fa-car"></i>
          <h3>Total Cars</h3>
          <p>5</p>
        </div>
        <div className="stat-card">
          <i className="fas fa-calendar-check"></i>
          <h3>Active Rentals</h3>
          <p>3</p>
        </div>
        <div className="stat-card">
          <i className="fas fa-money-bill-wave"></i>
          <h3>Monthly Earnings</h3>
          <p>₫15,000,000</p>
        </div>
        <div className="stat-card">
          <i className="fas fa-star"></i>
          <h3>Average Rating</h3>
          <p>4.5/5</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
