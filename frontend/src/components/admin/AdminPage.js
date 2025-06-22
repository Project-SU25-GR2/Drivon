import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios'; // Assuming you'll use axios for API calls
import './AdminPage.css'; // Import the new CSS file
import Loader from '../others/loader';
// Import all admin components
import DashboardOverview from './DashboardOverview';
import PagesPage from './PagesPage';
import ChatPage from './ChatPage';
import MapsPage from './MapsPage';
import FormsPage from './FormsPage';
import ChartsPage from './ChartsPage';
import TablesPage from './TablesPage';
import PartnerPage from './PartnerPage';
import CalendarPage from './CalendarPage';
import UIElementsPage from './UIElementsPage';
import UserManagementPage from './UserManagementPage';
import MultipleLevelsPage from './MultipleLevelsPage';
import AdminNotificationManager from './AdminNotificationManager';
import { createNotification } from '../../api/notification';

// Component for Admin Page
const AdminPage = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roleCheckComplete, setRoleCheckComplete] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState('');
  const [type, setType] = useState('SYSTEM');
  const [sending, setSending] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get active component from URL or default to 'dashboard'
  const activeComponent = new URLSearchParams(location.search).get('tab') || 'dashboard';

  const setActiveComponent = (component) => {
    // Preserve the current path while updating the tab parameter
    navigate(`/adminSecret?tab=${component}`, { replace: true });
    // Close mobile menu when selecting a component
    setMobileMenuOpen(false);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Define fetchUsers outside useEffect so it can be called from other functions
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      // Get token from user data in localStorage
      // Removed token check for testing, but keeping userData for potential future use
      const userData = JSON.parse(localStorage.getItem('user'));

      // Temporarily remove Authorization header for testing public endpoint
      const response = await axios.get('http://localhost:8080/api/admin/users' /*, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }*/);
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debug user role
    console.log('Current user:', user);
    console.log('User role:', user?.role);
    
    const checkUserRole = async () => {
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
        
        if (role?.toLowerCase() !== 'admin' || status?.toLowerCase() !== 'active') {
          navigate('/404', { replace: true });
          return;
        }
        
        // If user is admin and active, continue loading the page
        setRoleCheckComplete(true);
        setLoading(false);
      } catch (error) {
        // Clear timeout if it was set
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        console.error('Error checking user role:', error);
        
        // Show specific error message based on error type
        if (error.message === 'Role check timeout') {
          setError('Role check timed out. Please try again.');
        } else {
          setError('Failed to verify admin access. Please try again.');
        }
        
        // Redirect to 404 after a short delay to show error message
        setTimeout(() => {
          navigate('/404', { replace: true });
        }, 2000);
      }
    };

    if (user) {
      checkUserRole();
    } else {
      setError('User not logged in.');
      setLoading(false);
    }
  }, [user, navigate]);

  // Show loader while checking role or if role check hasn't completed
  if (loading || !roleCheckComplete) {
    return <div className="loading"><Loader text="Checking admin access..." /></div>;
  }

  // Show error message if there's an error
  if (error) {
    return (
      <div className="admin-page-container" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        color: 'red',
        fontSize: '18px'
      }}>
        {error}
      </div>
    );
  }

  // Implement update role and delete user functions (Keeping for now, but not used in this layout step)
  const handleUpdateRole = async (userId, newRole) => {
    console.log(`Updating role for user ${userId} to ${newRole}`);
    try {
      // Using axios.put to call the backend endpoint
      const response = await axios.put(`http://localhost:8080/api/admin/users/${userId}/role`, { role: newRole });
      console.log('Update role response:', response.data);
      alert('User role updated successfully!');
      // After successful API call, refetch users to update the list
      // We need to re-call the fetchUsers function
      // Since fetchUsers depends on 'user', and we removed the role check for testing,
      // we can directly call fetchUsers after a small delay to allow backend DB update.
      // A better approach in a real app would be to update state directly or trigger useEffect more reliably.
      setTimeout(fetchUsers, 100);

    } catch (err) {
      console.error('Error updating role:', err);
      setError('Failed to update user role: ' + (err.response?.data?.message || err.message));
      alert('Failed to update user role: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteUser = async (userId) => {
     console.log(`Deleting user ${userId}`);
     if (window.confirm('Are you sure you want to delete this user?')) {
        try {
          // Using axios.delete to call the backend endpoint
          const response = await axios.delete(`http://localhost:8080/api/admin/users/${userId}`);
          console.log('Delete user response:', response.data);
          alert('User deleted successfully!');
           // After successful API call, refetch users to update the list
           setTimeout(fetchUsers, 100);
        } catch (err) {
          console.error('Error deleting user:', err);
          setError('Failed to delete user: ' + (err.response?.data?.message || err.message));
          alert('Failed to delete user: ' + (err.response?.data?.message || err.message));
        }
     }
  };

  // Condition to redirect non-admin users (keeping for clarity, but route handles redirect)
  //    if (!user || user.role !== 'admin') {
  //      return <Navigate to="/" replace />;
  //    }

  // Temporarily hide loading/error/table while building the new layout
  // if (loading) {
  //   return <div className="admin-page-container">Loading users...</div>;
  // }

  // if (error) {
  //   return <div className="admin-page-container" style={{ color: 'red' }}>Error: {error}</div>;
  // }

  const renderActiveComponent = () => {
    switch (activeComponent) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'pages':
        return <PagesPage />;
      case 'chat':
        return <ChatPage />;
      case 'maps':
        return <MapsPage />;
      case 'forms':
        return <FormsPage />;
      case 'charts':
        return <ChartsPage />;
      case 'tables':
        return <TablesPage />;
      case 'partner':
        return <PartnerPage />;
      case 'calendar':
        return <CalendarPage />;
      case 'ui-elements':
        return <UIElementsPage />;
      case 'user-management':
        return <UserManagementPage />;
      case 'multiple-levels':
        return <MultipleLevelsPage />;
      case 'notification-manager':
        return <AdminNotificationManager />;
      default:
        return <div>Select a component from the sidebar</div>;
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await createNotification(content, type);
      alert('Đã gửi thông báo đến tất cả user!');
      setContent('');
      setShowForm(false);
    } catch {
      alert('Gửi thông báo thất bại!');
    }
    setSending(false);
  };

  return (
    <div className="admin-dashboard">
      <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-toggle" onClick={toggleSidebar}>
          <i className="fas fa-chevron-left"></i>
        </div>
        <div className="sidebar-header">
          {/* Logo and Adminator text */}
          <span>Adminator</span>
        </div>
        <ul className="sidebar-nav">
          <li>
            <a 
              href="#" 
              className={activeComponent === 'dashboard' ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                setActiveComponent('dashboard');
              }}
              data-title="Dashboard"
            >
              <i className="fas fa-tachometer-alt"></i>
              <span>Dashboard</span>
            </a>
          </li>
          <li>
            <a 
              href="#" 
              className={activeComponent === 'user-management' ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                setActiveComponent('user-management');
              }}
              data-title="User Management"
            >
              <i className="fas fa-users"></i>
              <span>User Management</span>
            </a>
          </li>
          <li>
            <a 
              href="#" 
              className={activeComponent === 'partner' ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                setActiveComponent('partner');
              }}
              data-title="Partner"
            >
              <i className="fas fa-handshake"></i>
              <span>Partner</span>
            </a>
          </li>
          <li>
            <a 
              href="#" 
              className={activeComponent === 'calendar' ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                setActiveComponent('calendar');
              }}
              data-title="Calendar"
            >
              <i className="fas fa-calendar-alt"></i>
              <span>Calendar</span>
            </a>
          </li>
          <li>
            <a 
              href="#" 
              className={activeComponent === 'chat' ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                setActiveComponent('chat');
              }}
              data-title="Chat"
            >
              <i className="fas fa-comments"></i>
              <span>Chat</span>
            </a>
          </li>
          <li>
            <a 
              href="#" 
              className={activeComponent === 'charts' ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                setActiveComponent('charts');
              }}
              data-title="Charts"
            >
              <i className="fas fa-chart-bar"></i>
              <span>Charts</span>
            </a>
          </li>
          <li>
            <a 
              href="#" 
              className={activeComponent === 'forms' ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                setActiveComponent('forms');
              }}
              data-title="Forms"
            >
              <i className="fas fa-file-alt"></i>
              <span>Forms</span>
            </a>
          </li>
          <li>
            <a 
              href="#" 
              className={activeComponent === 'ui-elements' ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                setActiveComponent('ui-elements');
              }}
              data-title="UI Elements"
            >
              <i className="fas fa-cube"></i>
              <span>UI Elements</span>
            </a>
          </li>
          <li>
            <a 
              href="#" 
              className={activeComponent === 'tables' ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                setActiveComponent('tables');
              }}
              data-title="Tables"
            >
              <i className="fas fa-table"></i>
              <span>Tables</span>
            </a>
          </li>
          <li>
            <a 
              href="#" 
              className={activeComponent === 'maps' ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                setActiveComponent('maps');
              }}
              data-title="Maps"
            >
              <i className="fas fa-map"></i>
              <span>Maps</span>
            </a>
          </li>
          <li>
            <a 
              href="#" 
              className={activeComponent === 'pages' ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                setActiveComponent('pages');
              }}
              data-title="Pages"
            >
              <i className="fas fa-file"></i>
              <span>Pages</span>
            </a>
          </li>
          <li>
            <a 
              href="#" 
              className={activeComponent === 'multiple-levels' ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                setActiveComponent('multiple-levels');
              }}
              data-title="Multiple Levels"
            >
              <i className="fas fa-layer-group"></i>
              <span>Multiple Levels</span>
            </a>
          </li>
          <li>
            <a 
              href="#" 
              className={activeComponent === 'notification-manager' ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                setActiveComponent('notification-manager');
              }}
              data-title="Quản lý thông báo"
            >
              <i className="fas fa-bell"></i>
              <span>Quản lý thông báo</span>
            </a>
          </li>
        </ul>
      </div>
      <div className="main-content">
        {/* Mobile menu toggle for small screens */}
        <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          <i className="fas fa-bars"></i>
        </div>
        {/* Header will go here */}
        {/* Dashboard content will go here */}
        {renderActiveComponent()}
      </div>
    </div>
  );
};

export default AdminPage; 