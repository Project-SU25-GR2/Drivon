import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios'; // Assuming you'll use axios for API calls
import './AdminPage.css'; // Import the new CSS file

// Component for Admin Page
const AdminPage = ({ user }) => {
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
          <li><a href="#" className="active"><i className="fas fa-tachometer-alt"></i> Dashboard</a></li> {/* Add active class */}
          <li><a href="#"><i className="fas fa-envelope"></i> Email</a></li>
          <li><a href="#"><i className="fas fa-edit"></i> Compose</a></li>
          <li><a href="#"><i className="fas fa-calendar-alt"></i> Calendar</a></li>
          <li><a href="#"><i className="fas fa-comments"></i> Chat</a></li>
          <li><a href="#"><i className="fas fa-chart-bar"></i> Charts</a></li>
          <li><a href="#"><i className="fas fa-file-alt"></i> Forms</a></li>
          <li><a href="#"><i className="fas fa-cube"></i> UI Elements</a></li>
          <li><a href="#"><i className="fas fa-table"></i> Tables</a></li>
          <li><a href="#"><i className="fas fa-map"></i> Maps</a></li>
          <li><a href="#"><i className="fas fa-file"></i> Pages</a></li>
          <li><a href="#"><i className="fas fa-layer-group"></i> Multiple Levels</a></li>
        </ul>
      </div>
      <div className="main-content">
        {/* Header will go here */}
        {/* Dashboard content will go here */}
        <div className="dashboard-content">
            {/* This is where the cards, map, charts etc. will be added */}
            {/* The existing user table will be moved or adapted later */}
            <h3>Dashboard Overview</h3>

            {/* Metric Cards */}
            <div className="metric-cards">
                <div className="card">
                    <div className="card-title">Total Visits</div>
                    <div className="card-value">10,500</div> {/* Placeholder value */}
                    <div className="card-trend">
                        {/* Placeholder for small chart */}
                        <div className="mini-chart"></div>
                        <span className="percentage-change positive">+10%</span>
                    </div>
                </div>

                <div className="card">
                    <div className="card-title">Total Page Views</div>
                    <div className="card-value">50,000</div> {/* Placeholder value */}
                    <div className="card-trend">
                        {/* Placeholder for small chart */}
                        <div className="mini-chart"></div>
                        <span className="percentage-change negative">-7%</span>
                    </div>
                </div>

                <div className="card">
                    <div className="card-title">Unique Visitor</div>
                    <div className="card-value">8,200</div> {/* Placeholder value */}
                    <div className="card-trend">
                        {/* Placeholder for small chart */}
                        <div className="mini-chart"></div>
                        <span className="percentage-change negative">-12%</span>
                    </div>
                </div>

                <div className="card">
                    <div className="card-title">Bounce Rate</div>
                    <div className="card-value">33%</div> {/* Placeholder value */}
                    <div className="card-trend">
                         {/* Placeholder for small chart */}
                         <div className="mini-chart"></div>
                         <span className="percentage-change positive">+33%</span> {/* Example positive change */}
                    </div>
                </div>
            </div>

            {/* Placeholder for other sections (Map, Regional Stats, Circular Charts) */}
            {/* <p>Content will be added here according to the image.</p> */}

            {/* Site Visits Section */}
            <div className="site-visits-section">
                <h4>Site Visits</h4>
                <div className="site-visits-content">
                    <div className="world-map-placeholder">
                        {/* Placeholder for World Map */}
                        World Map goes here
                    </div>
                    <div className="regional-stats">
                        {/* Regional Stats List */}
                        <div className="stat-item">
                            <div className="stat-label">100k</div>
                            <div className="stat-region">Visitors From USA</div>
                            <div className="progress-bar-container">
                                <div className="progress-bar" style={{ width: '50%', backgroundColor: '#6f42c1' }}></div> {/* Example color */}
                            </div>
                            <div className="stat-percentage">50%</div>
                        </div>
                         <div className="stat-item">
                            <div className="stat-label">1M</div>
                            <div className="stat-region">Visitors From Europe</div>
                            <div className="progress-bar-container">
                                <div className="progress-bar" style={{ width: '80%', backgroundColor: '#28a745' }}></div> {/* Example color */}
                            </div>
                            <div className="stat-percentage">80%</div>
                        </div>
                         <div className="stat-item">
                            <div className="stat-label">450k</div>
                            <div className="stat-region">Visitors From Australia</div>
                            <div className="progress-bar-container">
                                <div className="progress-bar" style={{ width: '40%', backgroundColor: '#007bff' }}></div> {/* Example color */}
                            </div>
                            <div className="stat-percentage">40%</div>
                        </div>
                         <div className="stat-item">
                            <div className="stat-label">1B</div>
                            <div className="stat-region">Visitors From India</div>
                            <div className="progress-bar-container">
                                <div className="progress-bar" style={{ width: '90%', backgroundColor: '#dc3545' }}></div> {/* Example color */}
                            </div>
                            <div className="stat-percentage">90%</div>
                        </div>
                        {/* Add more regional stats as needed */}
                    </div>
                </div>
            </div>

            {/* Placeholder for Circular Charts */}
            <div className="circular-charts-section">
                 <h4>User Statistics</h4> {/* Example title */}
                 <div className="circular-charts-container">
                     <div className="chart-item">
                         {/* Placeholder for New Users Chart */}
                         <div className="circular-chart">75%</div> {/* Placeholder value */}
                         <div className="chart-label">New Users</div>
                     </div>
                     <div className="chart-item">
                          {/* Placeholder for New Purchases Chart */}
                          <div className="circular-chart">50%</div> {/* Placeholder value */}
                          <div className="chart-label">New Purchases</div>
                      </div>
                      <div className="chart-item">
                           {/* Placeholder for Bounce Rate Chart */}
                           <div className="circular-chart">90%</div> {/* Placeholder value */}
                           <div className="chart-label">Bounce Rate</div>
                       </div>
                 </div>
            </div>

             {/* Remaining Widgets Section */}
             <div className="remaining-widgets">
                 <div className="widget monthly-stats">
                     <h4>Monthly Stats</h4>
                     {/* Placeholder content */}
                     <p>Monthly stats content here.</p>
                 </div>
                 <div className="widget todo-list">
                     <h4>Todo List</h4>
                     {/* Placeholder content */}
                     <ul>
                         <li>Call John for Dinner</li>
                         <li>Book Boss Flight 2 Days</li>
                         <li>Hit the Gym 3 Minutes</li>
                         <li>Give Purchase Report not important</li>
                         <li>Watch Game of Thrones Episode Tomorrow</li>
                         <li>Give Purchase report Done</li>
                     </ul>
                 </div>
                 <div className="widget sales-report">
                     <h4>Sales Report</h4>
                     {/* Placeholder content */}
                      <p>Sales: $6,000</p>
                      {/* Placeholder for sales table */}
                      <table>
                          <thead>
                              <tr>
                                  <th>Name</th>
                                  <th>Status</th>
                                  <th>Date</th>
                                  <th>Price</th>
                              </tr>
                          </thead>
                          <tbody>
                              <tr><td>Item #1 Name</td><td>Unavailable</td><td>Nov 18</td><td>$12</td></tr>
                              <tr><td>Item #2 Name</td><td>New</td><td>Nov 19</td><td>$34</td></tr>
                              <tr><td>Item #3 Name</td><td>New</td><td>Nov 20</td><td>-$45</td></tr>
                              <tr><td>Item #4 Name</td><td>Unavailable</td><td>Nov 21</td><td>$65</td></tr>
                              <tr><td>Item #5 Name</td><td>Used</td><td>Nov 22</td><td>$78</td></tr>
                              <tr><td>Item #6 Name</td><td>Used</td><td>Nov 23</td><td>-$88</td></tr>
                              <tr><td>Item #7 Name</td><td>Old</td><td>Nov 22</td><td>$56</td></tr>
                          </tbody>
                      </table>
                      <p><a href="#">Check all the sales</a></p>
                 </div>
                 <div className="widget weather">
                     <h4>Weather</h4>
                      {/* Placeholder content */}
                      <p>32°F Partly Clouds</p>
                      <p>Monday, Nov 01 2017</p>
                      <p>Wind: 10km/h, Sunrise: 05:00 AM, Pressure: 1B</p>
                 </div>
                 <div className="widget quick-chat">
                     <h4>Quick Chat</h4>
                      {/* Placeholder content */}
                     <div>Chat messages here...</div>
                 </div>
             </div>

        </div>
      </div>
    </div>
  );
};

export default AdminPage; 