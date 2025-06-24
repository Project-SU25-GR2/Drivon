import React, { useState, useEffect } from 'react';
import { createNotification, getAllNotifications, deleteNotification, updateNotification } from '../../api/notification';
import { getAllUsers } from '../../api/config';
import './AdminPage.css';
import { FaEdit, FaTrash } from 'react-icons/fa';

const AdminNotificationManager = () => {
  const [formData, setFormData] = useState({
    content: '',
    type: 'SYSTEM',
    targetType: 'ALL_USERS',
    targetUserId: ''
  });
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ content: '', type: 'SYSTEM', targetType: 'ALL_USERS', targetUserId: '' });

  useEffect(() => {
    loadUsers();
    loadNotifications();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await getAllUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await getAllNotifications();
      setNotifications(response.data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.content.trim()) {
      setMessage('Please enter the notification content');
      return;
    }

    if (formData.targetType === 'USER_SPECIFIC' && !formData.targetUserId) {
      setMessage('Please select a specific user');
      return;
    }

    try {
      setLoading(true);
      setMessage('');

      const targetUserId = formData.targetUserId ? parseInt(formData.targetUserId) : null;
      
      await createNotification(
        formData.content,
        formData.type,
        formData.targetType,
        targetUserId
      );

      // Reset form
      setFormData({
        content: '',
        type: 'SYSTEM',
        targetType: 'ALL_USERS',
        targetUserId: ''
      });

      // Reload notifications
      await loadNotifications();

      setMessage('Notification sent successfully!');
    } catch (error) {
      console.error('Error sending notification:', error);
      setMessage('An error occurred while sending the notification');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US');
  };

  const getTargetTypeLabel = (targetType) => '';

  const getTypeLabel = (type) => {
    switch (type) {
      case 'SYSTEM':
        return 'System';
      case 'PROMO':
        return 'Promotion';
      default:
        return type;
    }
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.userId === userId);
    return user ? `${user.fullName} (${user.email})` : `User ID: ${userId}`;
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        await deleteNotification(id);
        await loadNotifications();
      } catch (error) {
        alert('Error deleting notification');
      }
    }
  };

  const handleEditClick = (notification) => {
    setEditingId(notification.notificationId);
    setEditData({
      content: notification.content,
      type: notification.type,
      targetType: notification.targetType,
      targetUserId: notification.targetUserId || ''
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async (id) => {
    try {
      const data = { ...editData };
      if (data.targetType !== 'USER_SPECIFIC') data.targetUserId = null;
      await updateNotification(id, data);
      setEditingId(null);
      await loadNotifications();
    } catch (error) {
      alert('Error updating notification');
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
  };

  return (
    <div className="admin-notification-manager">
      <h2>Notification Management</h2>

      {/* Notification creation form */}
      <div className="notification-form-container">
        <h3>Create New Notification</h3>
        <form onSubmit={handleSubmit} className="notification-form">
          <div className="form-group">
            <label>Notification Content:</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="Enter notification content..."
              required
              rows="4"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Notification Type:</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
              >
                <option value="SYSTEM">System</option>
                <option value="PROMO">Promotion</option>
              </select>
            </div>

            <div className="form-group">
              <label>Recipient:</label>
              <select
                name="targetType"
                value={formData.targetType}
                onChange={handleInputChange}
              >
                <option value="ALL_USERS">All users</option>
                <option value="OWNER_ONLY">Car owners only</option>
                <option value="USER_SPECIFIC">Specific user</option>
              </select>
            </div>
          </div>

          {formData.targetType === 'USER_SPECIFIC' && (
            <div className="form-group">
              <label>Select User:</label>
              <select
                name="targetUserId"
                value={formData.targetUserId}
                onChange={handleInputChange}
                required
              >
                <option value="">Select user...</option>
                {users.map(user => (
                  <option key={user.userId} value={user.userId}>
                    {user.fullName} ({user.email}) - {user.role}
                  </option>
                ))}
              </select>
            </div>
          )}

          {message && (
            <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Sending...' : 'Send Notification'}
          </button>
        </form>
      </div>

      {/* Notification history */}
      <div className="notifications-list-container">
        <h3>Notification History</h3>
        <div className="notifications-list">
          {notifications.length === 0 ? (
            <p>No notifications yet</p>
          ) : (
            notifications.map(notification => (
              <div key={notification.notificationId} className="notification-item">
                {editingId === notification.notificationId ? (
                  <div className="notification-edit-form">
                    <textarea
                      name="content"
                      value={editData.content}
                      onChange={handleEditChange}
                      rows="3"
                    />
                    <select name="type" value={editData.type} onChange={handleEditChange}>
                      <option value="SYSTEM">System</option>
                      <option value="PROMO">Promotion</option>
                    </select>
                    <select name="targetType" value={editData.targetType} onChange={handleEditChange}>
                      <option value="ALL_USERS">All users</option>
                      <option value="OWNER_ONLY">Car owners only</option>
                      <option value="USER_SPECIFIC">Specific user</option>
                    </select>
                    {editData.targetType === 'USER_SPECIFIC' && (
                      <select name="targetUserId" value={editData.targetUserId} onChange={handleEditChange}>
                        <option value="">Select user...</option>
                        {users.map(user => (
                          <option key={user.userId} value={user.userId}>
                            {user.fullName} ({user.email}) - {user.role}
                          </option>
                        ))}
                      </select>
                    )}
                    <button onClick={() => handleEditSave(notification.notificationId)} className="save-btn">Save</button>
                    <button onClick={handleEditCancel} className="cancel-btn">Cancel</button>
                  </div>
                ) : (
                  <>
                    <div className="notification-header">
                      <span className="notification-type">
                        {getTypeLabel(notification.type)}
                      </span>
                      <span className="notification-target">
                        {getTargetTypeLabel(notification.targetType)}
                      </span>
                      {notification.targetUserId && (
                        <span className="notification-user">
                          → {getUserName(notification.targetUserId)}
                        </span>
                      )}
                    </div>
                    <div className="notification-content">
                      {notification.content}
                    </div>
                    <div className="notification-meta">
                      <span className="notification-time">
                        {formatDate(notification.createdAt)}
                      </span>
                      <span className="notification-status">
                        {notification.isRead ? 'Read' : 'Unread'}
                      </span>
                    </div>
                    <div className="notification-actions">
                      <button onClick={() => handleEditClick(notification)} className="icon-btn edit-btn" title="Edit">
                        <FaEdit size={14} />
                      </button>
                      <button onClick={() => handleDelete(notification.notificationId)} className="icon-btn delete-btn" title="Delete">
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNotificationManager; 