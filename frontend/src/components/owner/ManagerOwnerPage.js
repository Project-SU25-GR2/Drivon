import React, { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./ManagerOwnerPage.css";

// Import all owner components
import DashboardOverview from "./DashboardOverview";
import CarManagementPage from "./CarManagementPage";
import RentalHistoryPage from "./BookingManager";
import EarningsPage from "./EarningsPage";
import ProfilePage from "./ProfilePage";
import { API_URL } from '../../api/configApi';  
const ManagerOwnerPage = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get active component from URL or default to 'dashboard'
  const activeComponent =
    new URLSearchParams(location.search).get("tab") || "dashboard";

  const setActiveComponent = useCallback(
    (component) => {
      navigate(`/owner?tab=${component}`, { replace: true });
    },
    [navigate]
  );

  const renderActiveComponent = useCallback(() => {
    switch (activeComponent) {
      case "dashboard":
        return <DashboardOverview user={user} />;
      case "car-management":
        return <CarManagementPage user={user} />;
      case "rental-history":
        return <RentalHistoryPage />;
      case "earnings":
        return <EarningsPage />;
      case "profile":
        return <ProfilePage user={user} />;
      default:
        return <DashboardOverview user={user} />;
    }
  }, [activeComponent, user]);

  return (
    <div className="owner-dashboard">
      <div className="sidebar">
        <div className="sidebar-header">
          <span>Owner Dashboard</span>
        </div>
        <ul className="sidebar-nav">
          <li>
            <a
              href="#"
              className={activeComponent === "dashboard" ? "active" : ""}
              onClick={(e) => {
                e.preventDefault();
                setActiveComponent("dashboard");
              }}
            >
              <i className="fas fa-tachometer-alt"></i> Dashboard
            </a>
          </li>
          <li>
            <a
              href="#"
              className={activeComponent === "car-management" ? "active" : ""}
              onClick={(e) => {
                e.preventDefault();
                setActiveComponent("car-management");
              }}
            >
              <i className="fas fa-car"></i> Car Management
            </a>
          </li>
          <li>
            <a
              href="#"
              className={activeComponent === "rental-history" ? "active" : ""}
              onClick={(e) => {
                e.preventDefault();
                setActiveComponent("rental-history");
              }}
            >
              <i className="fas fa-history"></i> Booking Management
            </a>
          </li>
          <li>
            <a
              href="#"
              className={activeComponent === "earnings" ? "active" : ""}
              onClick={(e) => {
                e.preventDefault();
                setActiveComponent("earnings");
              }}
            >
              <i className="fas fa-money-bill-wave"></i> Earnings
            </a>
          </li>
          <li>
            <a
              href="#"
              className={activeComponent === "profile" ? "active" : ""}
              onClick={(e) => {
                e.preventDefault();
                setActiveComponent("profile");
              }}
            >
              <i className="fas fa-user"></i> Profile
            </a>
          </li>
        </ul>
      </div>
      <div className="main-content">{renderActiveComponent()}</div>
    </div>
  );
};

export default ManagerOwnerPage;
