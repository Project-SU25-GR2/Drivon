import React, { useState, useEffect } from 'react';
import './UserManagement.css';
import { useUserData } from '../../contexts/UserDataContext';
import { showErrorToast, showSuccessToast } from '../notification/notification';

const LoadingSpinner = () => (
  <div className="loading-container">
    <div className="loading-spinner">
      <div className="spinner-circle"></div>
      <div className="spinner-circle"></div>
      <div className="spinner-circle"></div>
    </div>
    <p className="loading-text">Loading users...</p>
  </div>
);

const UserManagementPage = () => {
    const { usersData, loading, error, fetchUsersData, updateUserRole, updateUserStatus, deleteUser } = useUserData();
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Fetch users data using context
        fetchUsersData();
    }, [fetchUsersData]);

    const handleUpdateRole = async (userId, newRole) => {
        try {
            await updateUserRole(userId, newRole);
            showSuccessToast('User role updated successfully!');
        } catch (err) {
            console.error('Error updating role:', err);
            showErrorToast('Unable to update user role: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await deleteUser(userId);
                showSuccessToast('User deleted successfully!');
            } catch (err) {
                console.error('Error deleting user:', err);
                showErrorToast('Failed to delete user: ' + (err.response?.data?.message || err.message));
            }
        }
    };

    const handleUpdateStatus = async (userId, newStatus) => {
        try {
            await updateUserStatus(userId, newStatus);
            showSuccessToast('User status updated successfully!');
        } catch (err) {
            console.error('Error updating user status:', err);
            showErrorToast('Unable to update user status: ' + (err.response?.data?.message || err.message));
        }
    };

    const filteredUsers = usersData.filter(user => 
        (user.fullName || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(searchTerm.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()) ||
        (user.email || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(searchTerm.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase())
    );

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return (
            <div className="admin-content-page">
                <div style={{ 
                    color: 'red', 
                    padding: '20px', 
                    backgroundColor: '#ffe6e6', 
                    border: '1px solid #ff9999',
                    borderRadius: '8px',
                    margin: '20px 0'
                }}>
                    <h3>Error Loading Users</h3>
                    <p>{error}</p>
                    <p><strong>Troubleshooting steps:</strong></p>
                    <ul>
                        <li>Make sure the backend server is running on port 8080</li>
                        <li>Check if the database connection is working</li>
                        <li>Verify that the users table exists and has data</li>
                        <li>Check the backend logs for more detailed error information</li>
                    </ul>
                    <button 
                        onClick={() => fetchUsersData(true)} 
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-content-page">
            <div className="user-management-container">
                <div className="user-management-header">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <div className="user-stats">
                        <span>Total Users: {usersData.length}</span>
                        <span>Active Users: {usersData.filter(u => u.status?.toUpperCase() === 'ACTIVE').length}</span>
                    </div>
                </div>

                <table className="user-table">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Created At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user, index) => (
                            <tr key={`user-${user.userId}-${index}`}>
                                <td>{index + 1}</td>
                                <td>{user.userId}</td>
                                <td>{user.fullName}</td>
                                <td>{user.email}</td>
                                <td>
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleUpdateRole(user.userId, e.target.value)}
                                        className="role-select"
                                    >
                                        <option value="renter">Renter</option>
                                        <option value="owner">Owner</option>
                                        <option value="admin">Admin</option>
                                        <option value="verify_owner">Verify Owner</option>
                                        <option value="verify_user">Verify User</option>
                                    </select>
                                </td>
                                <td>
                                    <div className="toggle-container">
                                        <label className="toggle-switch">
                                            <input
                                                type="checkbox"
                                                checked={user.status === 'active'}
                                                onChange={() => handleUpdateStatus(user.userId, user.status === 'active' ? 'banned' : 'active')}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                        <span className="toggle-label">
                                            {user.status === 'active' ? 'Active' : (user.status === 'banned' ? 'Banned' : 'Inactive')}
                                        </span>
                                    </div>
                                </td>
                                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            onClick={() => handleDeleteUser(user.userId)}
                                            className="delete-button"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagementPage; 