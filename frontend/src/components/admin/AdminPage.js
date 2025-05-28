import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios'; // Assuming you'll use axios for API calls
import './AdminPage.css'; // Import the new CSS file
import DashboardOverview from './DashboardOverview';
import UserManagementPage from './UserManagementPage';
import ComposePage from './ComposePage';
import CalendarPage from './CalendarPage';
import ChatPage from './ChatPage';
import ChartsPage from './ChartsPage';
import FormsPage from './FormsPage';
import UIElementsPage from './UIElementsPage';
import TablesPage from './TablesPage';
import MapsPage from './MapsPage';
import PagesPage from './PagesPage';
import MultipleLevelsPage from './MultipleLevelsPage';

// Component for Admin Page
const AdminPage = ({ user }) => {
  const [activeTab, setActiveTab] = useState('dashboard'); // State to keep track of the active tab
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    // Only fetch if user is available (temporarily removing role check for testing)
    if (user) {
        // Keeping the fetch call for now, but won't display the table in the new layout yet
        // fetchUsers(); 
    } else {
        // If no user, set error and stop loading
        setError('User not logged in.'); // Changed message for clarity
        setLoading(false);
    }

  }, [user]); // Refetch users if user data changes (e.g., re-login)

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

  return (
    <div className="admin-dashboard">
      <div className="sidebar">
        <div className="sidebar-header">
          {/* Logo and Adminator text */}
          <span>Adminator</span>
        </div>
        <ul className="sidebar-nav">
          <li><a href="#" className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}><i className="fas fa-tachometer-alt"></i> Dashboard</a></li> {/* Add active class */}
          <li><a href="#" className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}><i className="fas fa-users"></i> User Management</a></li>
          <li><a href="#" className={activeTab === 'compose' ? 'active' : ''} onClick={() => setActiveTab('compose')}><i className="fas fa-edit"></i> Compose</a></li>
          <li><a href="#" className={activeTab === 'calendar' ? 'active' : ''} onClick={() => setActiveTab('calendar')}><i className="fas fa-calendar-alt"></i> Calendar</a></li>
          <li><a href="#" className={activeTab === 'chat' ? 'active' : ''} onClick={() => setActiveTab('chat')}><i className="fas fa-comments"></i> Chat</a></li>
          <li><a href="#" className={activeTab === 'charts' ? 'active' : ''} onClick={() => setActiveTab('charts')}><i className="fas fa-chart-bar"></i> Charts</a></li>
          <li><a href="#" className={activeTab === 'forms' ? 'active' : ''} onClick={() => setActiveTab('forms')}><i className="fas fa-file-alt"></i> Forms</a></li>
          <li><a href="#" className={activeTab === 'ui-elements' ? 'active' : ''} onClick={() => setActiveTab('ui-elements')}><i className="fas fa-cube"></i> UI Elements</a></li>
          <li><a href="#" className={activeTab === 'tables' ? 'active' : ''} onClick={() => setActiveTab('tables')}><i className="fas fa-table"></i> Tables</a></li>
          <li><a href="#" className={activeTab === 'maps' ? 'active' : ''} onClick={() => setActiveTab('maps')}><i className="fas fa-map"></i> Maps</a></li>
          <li><a href="#" className={activeTab === 'pages' ? 'active' : ''} onClick={() => setActiveTab('pages')}><i className="fas fa-file"></i> Pages</a></li>
          <li><a href="#" className={activeTab === 'multiple-levels' ? 'active' : ''} onClick={() => setActiveTab('multiple-levels')}><i className="fas fa-layer-group"></i> Multiple Levels</a></li>
        </ul>
      </div>
      <div className="main-content">
        {/* Header will go here */}
        <div className="header">
          <div className="header-left">
            {/* Add search bar or other elements if needed */}
          </div>
          <div className="header-right">
            <i className="fas fa-bell"></i> {/* Notification icon */}
            <i className="fas fa-envelope"></i> {/* Message icon */}
            <div className="user-profile">
              <img src="placeholder-user.png" alt="User Avatar" /> {/* Placeholder for user avatar */}
              <span>User Name</span> {/* Placeholder for user name */}
            </div>
          </div>
        </div>

        {/* Conditional rendering based on activeTab */}
        <div className="content-area">
          {activeTab === 'dashboard' && <DashboardOverview />}
          {activeTab === 'users' && <UserManagementPage />}
          {activeTab === 'compose' && <ComposePage />}
          {activeTab === 'calendar' && <CalendarPage />}
          {activeTab === 'chat' && <ChatPage />}
          {activeTab === 'charts' && <ChartsPage />}
          {activeTab === 'forms' && <FormsPage />}
          {activeTab === 'ui-elements' && <UIElementsPage />}
          {activeTab === 'tables' && <TablesPage />}
          {activeTab === 'maps' && <MapsPage />}
          {activeTab === 'pages' && <PagesPage />}
          {activeTab === 'multiple-levels' && <MultipleLevelsPage />}
          {/* Add conditional rendering for other tabs as needed */}
        </div>

      </div>
    </div>
  );
};

export default AdminPage; 