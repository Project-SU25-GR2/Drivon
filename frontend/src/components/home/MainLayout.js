import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from 'axios';
import Login from '../auth/Login';
import Signup from '../auth/Signup';
import ForgotPasswordPage from '../auth/ForgotPasswordPage';
import Footer from '../layout/footer';
import Loader from '../others/loader';
import NotificationBell from '../notification/NotificationBell';
import webSocketService from '../../services/WebSocketService';
import './MainLayout.css';
import { API_URL } from '../../api/configApi';
import { showErrorToast } from '../notification/notification';
const MainLayout = ({ user, handleLogout, children }) => {
  const [authMode, setAuthMode] = useState("login"); // 'login', 'signup', or 'forgot'
  const [userRole, setUserRole] = useState(null);
  const [roleCheckComplete, setRoleCheckComplete] = useState(false);
  const [roleCheckLoading, setRoleCheckLoading] = useState(false);
  const [roleCheckError, setRoleCheckError] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  // Connect WebSocket when user is available
  useEffect(() => {
    if (user && user.userId) {
      console.log('Connecting WebSocket for user:', user.userId);
      webSocketService.connect(user.userId, () => {
        console.log('WebSocket connected successfully for user:', user.userId);
      });
    } else {
      console.log('No user available, disconnecting WebSocket');
      webSocketService.disconnect();
    }

    return () => {
      if (user && user.userId) {
        console.log('Cleaning up WebSocket for user:', user.userId);
      }
    };
  }, [user]);

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
        const roleCheckPromise = axios.get(`${API_URL}/admin/check-role/${user.userId}`);
        
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
        showErrorToast('Failed to check user role');
      } finally {
        setRoleCheckLoading(false);
      }
    };

    checkUserRole();
  }, [user]);

  // Close menu when clicking outside
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
      <header className="main-header">
        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <i className="bi bi-list"></i>
        </button>

        {/* Logo */}
        <div className="logo" style={{cursor: 'pointer'}} onClick={() => navigate('/') }>
          DRI<span>VON</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          <Link to="/" className={location.pathname === "/" ? "active" : ""}>Home</Link>
          <Link to="/rent-car" className={location.pathname.startsWith("/rent-car") ? "active" : ""}>Rent car</Link>
          <Link to="/contracts" className={location.pathname.startsWith("/contracts") ? "active" : ""}>Partner Applications</Link>
          <Link to="/rent-your-car" className={location.pathname.startsWith("/rent-your-car") ? "active" : ""}>Become a Partner</Link>
          <Link to="/contact" className={location.pathname === "/contact" ? "active" : ""}>Contact</Link>
          <div className="search-box">
            <input type="text" placeholder="Search..." />
          </div>
        </nav>

        {/* Right Side - User Menu & Notifications */}
        <div className="header-right">
          <div className="user-menu-container" ref={menuRef}>
            {user ? (
              <>
                <div className="user-menu-trigger" onClick={() => setMenuOpen((open) => !open)}>
                  <img
                    src={avatarUrl}
                    alt="avatar"
                    className="user-avatar-header"
                  />
                  <span className="user-name">{user.fullName || user.email || "User"}</span>
                </div>
                {menuOpen && (
                  <div className="user-dropdown-menu">
                    <Link to="/profile" className="dropdown-item">
                      <i className="bi bi-person"></i>
                      Profile
                    </Link>
                    <Link to="/messages" className="dropdown-item">
                      <i className="bi bi-chat-dots"></i>
                      Messages
                    </Link>
                    <Link to="/my-rentals" className="dropdown-item">
                      <i className="bi bi-car-front"></i>
                      My Rentals
                    </Link>
                    <Link to="/payment" className="dropdown-item">
                      <i className="bi bi-credit-card"></i>
                      Payment
                    </Link>
                    
                    {/* Admin Dashboard Button */}
                    {userRole === "admin" && (
                      <Link to="/adminSecret" className="dropdown-item">
                        <i className="bi bi-speedometer2"></i>
                        Admin Dashboard
                      </Link>
                    )}
                    
                    {/* Owner Dashboard Button */}
                    {(userRole === "owner" ||userRole === "verify_owner") && (
                      <Link to="/owner" className="dropdown-item">
                        <i className="bi bi-gear"></i>
                        Owner Dashboard
                      </Link>
                    )}
                    
                    <button onClick={handleLogout} className="dropdown-item logout-button">Logout</button>
                  </div>
                )}
              </>
            ) : (
              <button 
                className="login-btn"
                onClick={() => navigate('/auth')}
              >
                Login / Signup
              </button>
            )}
          </div>
          <NotificationBell />
        </div>

        {/* Mobile Navigation Overlay */}
        {mobileMenuOpen && (
          <div className="mobile-nav-overlay" onClick={() => setMobileMenuOpen(false)}>
            <div className="mobile-nav-content" onClick={(e) => e.stopPropagation()}>
              <div className="mobile-nav-header">
                <div className="logo" style={{cursor: 'pointer'}} onClick={() => { setMobileMenuOpen(false); navigate('/'); }}>DRI<span>VON</span></div>
                <button 
                  className="close-mobile-menu"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <i className="bi bi-x"></i>
                </button>
              </div>
              <nav className="mobile-nav">
                <Link to="/" className={location.pathname === "/" ? "active" : ""} onClick={() => setMobileMenuOpen(false)}>Home</Link>
                <Link to="/rent-car" className={location.pathname.startsWith("/rent-car") ? "active" : ""} onClick={() => setMobileMenuOpen(false)}>Rent car</Link>
                <Link to="/contracts" className={location.pathname.startsWith("/contracts") ? "active" : ""} onClick={() => setMobileMenuOpen(false)}>Partner Applications</Link>
                <Link to="/rent-your-car" className={location.pathname.startsWith("/rent-your-car") ? "active" : ""} onClick={() => setMobileMenuOpen(false)}>Become a Partner</Link>
                <Link to="/contact" className={location.pathname === "/contact" ? "active" : ""} onClick={() => setMobileMenuOpen(false)}>Contact</Link>
                <div className="mobile-search-box">
                  <input type="text" placeholder="Search..." />
                </div>
              </nav>
            </div>
          </div>
        )}
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
                    Forgot password?
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
                    Back to login
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
        .mobile-nav a:hover {
          color: #FFD700 !important;
          background-color: #f5f5f5 !important;
        }
        .mobile-nav a {
          color: #222 !important;
          background: none !important;
        }
        .mobile-nav a.active {
          color: #FFD700 !important;
          background-color: #fffbe7 !important;
          border-left: 3px solid #FFD700;
        }
      `}</style>
    </div>
  );
};

export default MainLayout;
