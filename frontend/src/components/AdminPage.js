import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios'; // Assuming you'll use axios for API calls

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
        fetchUsers();
    } else {
        // If no user, set error and stop loading
        setError('User not logged in.'); // Changed message for clarity
        setLoading(false);
    }

  }, [user]); // Refetch users if user data changes (e.g., re-login)

  // Implement update role and delete user functions
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

  if (loading) {
    return <div className="admin-page-container">Loading users...</div>;
  }

  if (error) {
    return <div className="admin-page-container" style={{ color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div className="admin-page-container">
      <h2>Trang Quản Trị</h2>

      <h3>Danh sách Tài khoản</h3>
      {users.length === 0 ? (
          <p>Không có tài khoản nào trong hệ thống.</p>
      ) : (
          <table className="users-table">
              <thead>
                  <tr>
                      <th>ID</th>
                      <th>Email</th>
                      <th>Họ tên</th>
                      <th>Số điện thoại</th>
                      <th>Vai trò</th>
                      <th>Hành động</th>
                  </tr>
              </thead>
              <tbody>
                  {users.map(u => (
                      <tr key={u.id}>
                          <td>{u.id}</td>
                          <td>{u.email}</td>
                          <td>{u.fullName}</td>
                          <td>{u.phone}</td>
                          <td>{u.role}</td> {/* Display current role */}
                          <td>
                              {/* Example buttons - Implement functionality */}
                              {/* Buttons visible for all users except the currently logged-in user for testing */}
                              {user && u.userId !== user.userId && (
                                  <button onClick={() => handleUpdateRole(u.userId, 'ADMIN')}>Nâng cấp lên Admin</button>
                              )}
                               {/* Add more role options if needed */}
                              {user && u.userId !== user.userId && (
                                  <button onClick={() => handleDeleteUser(u.userId)}>Xóa</button>
                              )}
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
      )}

    </div>
  );
};

export default AdminPage; 