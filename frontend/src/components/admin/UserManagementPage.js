import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserManagement.css';

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
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get('http://localhost:8080/api/admin/users');
            setUsers(response.data);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to fetch users: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleUpdateRole = async (userId, newRole) => {
        try {
            // Đảm bảo role được gửi đúng định dạng (chữ hoa)
            const formattedRole = newRole.toUpperCase();
            
            console.log('Đang cập nhật vai trò:', {
                userId,
                newRole: formattedRole
            });

            const response = await axios.put(`http://localhost:8080/api/admin/users/${userId}/role`, { 
                role: formattedRole 
            });
            
            console.log('Phản hồi từ server:', response.data);
            alert('Cập nhật vai trò người dùng thành công!');
            fetchUsers();
        } catch (err) {
            console.error('Lỗi khi cập nhật vai trò:', err);
            console.error('Chi tiết lỗi:', err.response?.data);
            alert('Không thể cập nhật vai trò người dùng: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await axios.delete(`http://localhost:8080/api/admin/users/${userId}`);
                alert('User deleted successfully!');
                fetchUsers();
            } catch (err) {
                console.error('Error deleting user:', err);
                alert('Failed to delete user: ' + (err.response?.data?.message || err.message));
            }
        }
    };

    const handleToggleStatus = async (userId, currentStatus) => {
        try {
            // Đảm bảo trạng thái luôn là ACTIVE hoặc BANNED
            const newStatus = currentStatus?.toUpperCase() === 'ACTIVE' ? 'BANNED' : 'ACTIVE';
            
            console.log('Đang cập nhật trạng thái:', {
                userId,
                currentStatus: currentStatus?.toUpperCase(),
                newStatus
            });

            const response = await axios.put(`http://localhost:8080/api/admin/users/${userId}/status`, { 
                status: newStatus 
            });
            
            console.log('Phản hồi từ server:', response.data);
            alert(`Người dùng đã được ${newStatus === 'ACTIVE' ? 'mở khóa' : 'khóa'} thành công!`);
            fetchUsers();
        } catch (err) {
            console.error('Lỗi khi cập nhật trạng thái người dùng:', err);
            console.error('Chi tiết lỗi:', err.response?.data);
            alert('Không thể cập nhật trạng thái người dùng: ' + (err.response?.data?.message || err.message));
        }
    };

    const filteredUsers = users.filter(user => 
        (user.fullName || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(searchTerm.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()) ||
        (user.email || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(searchTerm.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase())
    );

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <div className="admin-content-page" style={{ color: 'red' }}>Error: {error}</div>;
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
                        <span>Total Users: {users.length}</span>
                        <span>Active Users: {users.filter(u => u.status?.toUpperCase() === 'ACTIVE').length}</span>
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
                                        <option value="RENTER">Renter</option>
                                        <option value="OWNER">Owner</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                </td>
                                <td>
                                    <div className="toggle-container">
                                        <label className="toggle-switch">
                                            <input
                                                type="checkbox"
                                                checked={user.status?.toUpperCase() === 'ACTIVE'}
                                                onChange={() => handleToggleStatus(user.userId, user.status)}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                        <span className="toggle-label">
                                            {user.status?.toUpperCase() === 'ACTIVE' ? 'Active' : 'Banned'}
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