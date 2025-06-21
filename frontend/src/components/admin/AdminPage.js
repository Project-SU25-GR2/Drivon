import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios'; // Assuming you'll use axios for API calls
import './AdminPage.css'; // Import the new CSS file

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

// Component for Admin Page
const AdminPage = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get active component from URL or default to 'dashboard'
  const activeComponent = new URLSearchParams(location.search).get('tab') || 'dashboard';

  const setActiveComponent = (component) => {
    // Preserve the current path while updating the tab parameter
    navigate(`/admin?tab=${component}`, { replace: true });
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
      try {
        const response = await axios.get(`http://localhost:8080/api/admin/check-role/${user.userId}`);
        const { role, status } = response.data;
        
        if (role?.toLowerCase() !== 'admin' || status?.toLowerCase() !== 'active') {
          navigate('/404', { replace: true });
          return;
        }
        
        // If user is admin and active, continue loading the page
        setLoading(false);
      } catch (error) {
        console.error('Error checking user role:', error);
        navigate('/404', { replace: true });
      }
    };

    if (user) {
      checkUserRole();
    } else {
      setError('User not logged in.');
      setLoading(false);
    }
  }, [user, navigate]);

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
      default:
        return <div>Select a component from the sidebar</div>;
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="sidebar">
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
            >
              <i className="fas fa-tachometer-alt"></i> Dashboard
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
            >
              <i className="fas fa-users"></i> User Management
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
            >
              <i className="fas fa-handshake"></i> Partner
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
            >
              <i className="fas fa-calendar-alt"></i> Calendar
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
            >
              <i className="fas fa-comments"></i> Chat
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
            >
              <i className="fas fa-chart-bar"></i> Charts
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
            >
              <i className="fas fa-file-alt"></i> Forms
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
            >
              <i className="fas fa-cube"></i> UI Elements
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
            >
              <i className="fas fa-table"></i> Tables
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
            >
              <i className="fas fa-map"></i> Maps
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
            >
              <i className="fas fa-file"></i> Pages
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
            >
              <i className="fas fa-layer-group"></i> Multiple Levels
            </a>
          </li>
        </ul>
      </div>
      <div className="main-content">
        {/* Header will go here */}
        {/* Dashboard content will go here */}
        {renderActiveComponent()}
      </div>
    </div>
  );
};

export default AdminPage; 