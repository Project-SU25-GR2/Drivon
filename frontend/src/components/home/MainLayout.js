import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from 'axios';
import Login from '../auth/Login';
import Signup from '../auth/Signup';
import ForgotPasswordPage from '../auth/ForgotPasswordPage';
import Footer from '../layout/footer';
import Loader from '../others/loader';
import NotificationBell from '../others/NotificationBell';
import './MainLayout.css';

const MainLayout = ({ user, handleLogout, children }) => {
  const [authMode, setAuthMode] = useState("login"); // 'login', 'signup', or 'forgot'
  const [userRole, setUserRole] = useState(null);
  const [roleCheckComplete, setRoleCheckComplete] = useState(false);
  const [roleCheckLoading, setRoleCheckLoading] = useState(false);
  const [roleCheckError, setRoleCheckError] = useState(null);
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

  // Check user role with timeout
  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        setRoleCheckComplete(true);
        return;
      }

      setRoleCheckLoading(true);
      setRoleCheckError(null);

      // Set timeout for role check (10 seconds)
      const timeoutDuration = 10000;
      let timeoutId;
      
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error('Role check timeout'));
        }, timeoutDuration);
      });

      try {
        const roleCheckPromise = axios.get(`http://localhost:8080/api/admin/check-role/${user.userId}`);
        
        // Race between role check and timeout
        const response = await Promise.race([roleCheckPromise, timeoutPromise]);
        
        // Clear timeout if role check completes successfully
        clearTimeout(timeoutId);
        
        const { role, status } = response.data;
        
        if (status?.toLowerCase() === 'active') {
          setUserRole(role?.toLowerCase());
        } else {
          setUserRole(null);
        }
        
        setRoleCheckComplete(true);
      } catch (error) {
        // Clear timeout if it was set
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        console.error('Error checking user role:', error);
        setUserRole(null);
        setRoleCheckComplete(true);
      } finally {
        setRoleCheckLoading(false);
      }
    };

    checkUserRole();
  }, [user]);

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

  // Show loader while checking role
  if (roleCheckLoading) {
    return <div className="loading"><Loader /></div>;
  }

  return (
    <div className="HomeLayout">
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="logo">
          DRI<span>VON</span>
        </div>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/rent-car">Rent car</Link>
          <Link to="/contracts">Contracts</Link>
          <Link to="/rent-your-car">Become a Partner</Link>
          <a href="#">Contact</a>
          <div className="search-box">
            <input type="text" placeholder="Search..." />
            <button type="button"><i className="fas fa-search"></i></button>
          </div>
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="user-menu-container" style={{ position: 'relative', display: 'inline-block' }} ref={menuRef}>
            {user ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => setMenuOpen((open) => !open)}>
                  <img
                    src={avatarUrl}
                    alt="avatar"
                    className="user-avatar-header"
                    style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', marginRight: 8 }}
                  />
                  <span style={{ fontWeight: 500, color: '#fff', fontSize: 16 }}>{user.fullName || user.email || "User"}</span>
                </div>
                {menuOpen && (
                  <div
                    className="user-dropdown-menu"
                  >
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
                    <Link to="/payment" className="dropdown-item" style={{ padding: '10px', display: 'block', textDecoration: 'none', color: '#222' }}>
                      <i className="bi bi-credit-card" style={{ marginRight: '8px' }}></i>
                      Payment
                    </Link>
                    
                    {/* Admin Dashboard Button */}
                    {userRole === "admin" && (
                      <Link to="/adminSecret" className="dropdown-item" style={{ padding: '10px', display: 'block', textDecoration: 'none', color: '#222' }}>
                        <i className="bi bi-speedometer2" style={{ marginRight: '8px' }}></i>
                        Admin Dashboard
                      </Link>
                    )}
                    
                    {/* Owner Dashboard Button */}
                    {userRole === "owner" && (
                      <Link to="/owner" className="dropdown-item" style={{ padding: '10px', display: 'block', textDecoration: 'none', color: '#222' }}>
                        <i className="bi bi-gear" style={{ marginRight: '8px' }}></i>
                        Owner Dashboard
                      </Link>
                    )}
                    
                    <button onClick={handleLogout} className="dropdown-item logout-button" style={{ padding: '10px', width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer' }}>Logout</button>
                  </div>
                )}
              </>
            ) : (
              <button 
                onClick={() => navigate('/auth')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Login / Signup
              </button>
            )}
          </div>
          <NotificationBell />
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
