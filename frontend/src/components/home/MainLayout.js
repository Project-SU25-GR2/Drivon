import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Login from '../auth/Login';
import Signup from '../auth/Signup';
import ForgotPasswordPage from '../auth/ForgotPasswordPage';
import Footer from '../layout/footer';
import './MainLayout.css';

const MainLayout = ({ user, handleLogout, children }) => {
  const [authMode, setAuthMode] = useState("login"); // 'login', 'signup', or 'forgot'
  const location = useLocation();
  const navigate = useNavigate();
  const avatarUrl =
    user && user.avatarUrl
      ? user.avatarUrl
      : "https://ui-avatars.com/api/?name=" +
      encodeURIComponent(user?.fullName || "User") +
      "&background=FFD700&color=222&size=64";

  const showAuthForm = location.pathname === "/auth";

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const handleAuthSuccess = (userData) => {
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
      if (userData.token) {
        localStorage.setItem("token", userData.token);
      }
      window.location.href = "/"; // Force reload to update user state
    }
  };

  const handleCloseModal = () => {
    navigate("/"); // Go back to previous page when closing modal
  };

  return (
    <div className="HomeLayout">
      <header>
        <div className="logo">
          CAR<span>RENTAL</span>
        </div>
        
        <nav>
          <Link to="/">Home</Link>
          <Link to="/rent-car">Rent car</Link>
          <Link to="/contracts">Contracts</Link>
          <Link to="/rent-your-car">Become a Partner</Link>
          {/* <a href="#">About</a>
          <a href="#">Pages</a> */}
          <a href="#">Contact</a>
          <div className="search-box">
            <input type="text" placeholder="Search..." />
            <button type="button"><i className="fas fa-search"></i></button>
          </div>
          {user && user.role === "ADMIN" && <Link to="/admin">Admin</Link>}
          {user && user.role === "OWNER" && <Link to="/owner">Manager Car</Link>}
        </nav>
        <div
          className="user-menu-container"
          style={{ position: 'relative', display: 'inline-block' }}
          ref={menuRef}
        >
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => setMenuOpen((open) => !open)}>
              <img
                src={avatarUrl}
                alt="avatar"
                className="user-avatar-header"
                style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', marginRight: 8 }}
              />
              <span style={{ fontWeight: 500, color: '#fff', fontSize: 16 }}>{user.fullName || user.email || "User"}</span>
            </div>
          ) : (
            <i
              className="bi bi-person-circle"
              style={{ fontSize: 32, cursor: 'pointer' }}
              onClick={() => setMenuOpen((open) => !open)}
            />
          )}
          {menuOpen && (
            <div
              className="user-dropdown-menu"
            >
              {user ? (
                <>
                  <Link to="/profile" className="dropdown-item" style={{ display: 'flex', alignItems: 'center', padding: '10px', textDecoration: 'none', color: '#222' }}>
                    <img
                      src={avatarUrl}
                      alt="avatar"
                      className="user-avatar-header"
                      style={{ width: 28, height: 28, borderRadius: '50%', marginRight: 8 }}
                    />
                    <span>{user.fullName || user.email || "User"}</span>
                  </Link>
                  <Link to="/messages" className="dropdown-item" style={{ padding: '10px', display: 'block', textDecoration: 'none', color: '#222' }}>
                    <i className="bi bi-chat-dots" style={{ marginRight: '8px' }}></i>
                    Messages
                  </Link>
                  <Link to="/my-rentals" className="dropdown-item" style={{ padding: '10px', display: 'block', textDecoration: 'none', color: '#222' }}>
                    <i className="bi bi-car-front" style={{ marginRight: '8px' }}></i>
                    My Rentals
                  </Link>
                  <Link to="/payment" className="dropdown-item" style={{ padding: '10px', display: 'block', textDecoration: 'none', color: '#222' }}>Payment</Link>
                  <button onClick={handleLogout} className="dropdown-item logout-button" style={{ padding: '10px', width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer' }}>Logout</button>
                </>
              ) : (
                <>
                  <Link to="/auth" className="dropdown-item" style={{ padding: '10px', display: 'block', textDecoration: 'none', color: '#222' }}>Login/Signup</Link>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {showAuthForm && (
        <div className="auth-modal">
          <div className="auth-modal-content">
            {authMode !== "forgot" && (
              <div className="auth-tabs">
                <button
                  className={`auth-tab ${authMode === "login" ? "active" : ""}`}
                  onClick={() => setAuthMode("login")}
                >
                  Login
                </button>
                <button
                  className={`auth-tab ${authMode === "signup" ? "active" : ""
                    }`}
                  onClick={() => setAuthMode("signup")}
                >
                  Signup
                </button>
              </div>
            )}

            {authMode === "login" && (
              <>
                <Login onLoginSuccess={handleAuthSuccess} />
                <div
                  style={{
                    textAlign: "center",
                    marginTop: "10px",
                  }}
                >
                  <button
                    onClick={() => setAuthMode("forgot")}
                    className="link-button"
                    style={{ fontSize: "14px" }}
                  >
                    Quên mật khẩu?
                  </button>
                </div>
              </>
            )}
            {authMode === "signup" && (
              <Signup onSignupSuccess={handleAuthSuccess} />
            )}
            {authMode === "forgot" && (
              <>
                <ForgotPasswordPage />
                <div style={{ textAlign: "center", marginTop: "10px" }}>
                  <button
                    onClick={() => setAuthMode("login")}
                    className="link-button"
                  >
                    Quay lại đăng nhập
                  </button>
                </div>
              </>
            )}
            <button className="close-modal" onClick={handleCloseModal}>
              ×
            </button>
          </div>
        </div>
      )}

      <div className="page-content">{children}</div>
      <Footer />
      <style>{`
        .user-dropdown-menu .dropdown-item:hover, .user-dropdown-menu .dropdown-item:focus {
          background: #f5f5f5;
          color: #1a73e8;
          outline: none;
        }
      `}</style>
    </div>
  );
};

export default MainLayout;
