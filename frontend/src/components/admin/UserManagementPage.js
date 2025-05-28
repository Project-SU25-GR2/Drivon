import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({
        fullName: '',
        email: '',
        role: ''
    });

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
            await axios.put(`http://localhost:8080/api/admin/users/${userId}/role`, { "role": newRole });
            alert('User role updated successfully!');
            fetchUsers();
        } catch (err) {
            console.error('Error updating role:', err);
            alert('Failed to update user role: ' + (err.response?.data?.message || err.message));
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

    const handleEditUser = (user) => {
        setEditingUser(user);
        setEditForm({
            fullName: user.fullName,
            email: user.email,
            role: user.role
        });
    };

    const handleSaveEdit = async () => {
        try {
            await axios.put(`http://localhost:8080/api/admin/users/${editingUser.id}`, editForm);
            alert('User updated successfully!');
            setEditingUser(null);
            fetchUsers();
        } catch (err) {
            console.error('Error updating user:', err);
            alert('Failed to update user: ' + (err.response?.data?.message || err.message));
        }
    };

    const filteredUsers = users.filter(user => 
        (user.fullName || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(searchTerm.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()) ||
        (user.email || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(searchTerm.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase())
    );

    if (loading) {
        return <div className="admin-content-page">Loading users...</div>;
    }

    if (error) {
        return <div className="admin-content-page" style={{ color: 'red' }}>Error: {error}</div>;
    }

    return (
        <div className="admin-content-page">
            <h2>User Management</h2>
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
                        <span>Active Users: {users.filter(u => u.status === 'ACTIVE').length}</span>
                    </div>
                </div>

                {editingUser && (
                    <div className="edit-user-modal">
                        <div className="edit-user-form">
                            <h3>Edit User</h3>
                            <div className="form-group">
                                <label>Username:</label>
                                <input
                                    type="text"
                                    value={editForm.fullName}
                                    onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Email:</label>
                                <input
                                    type="email"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Role:</label>
                                <select
                                    value={editForm.role}
                                    onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                                >
                                    <option value="renter">Renter</option>
                                    <option value="owner">Owner</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="form-actions">
                                <button onClick={handleSaveEdit} className="save-button">Save</button>
                                <button onClick={() => setEditingUser(null)} className="cancel-button">Cancel</button>
                            </div>
                        </div>
                    </div>
                )}

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
                            <tr key={user.id}>
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
                                    </select>
                                </td>
                                <td>
                                    <span className={`status-badge ${user.status?.toLowerCase()}`}>
                                        {user.status || 'ACTIVE'}
                                    </span>
                                </td>
                                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            onClick={() => handleEditUser(user)}
                                            className="edit-button"
                                        >
                                            Edit
                                        </button>
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