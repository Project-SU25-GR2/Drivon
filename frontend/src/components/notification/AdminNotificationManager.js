import React, { useState, useEffect } from 'react';
import { createNotification, getAllNotifications, deleteNotification, updateNotification } from '../../api/notification';
import { getAllUsers } from '../../api/config';
import '../admin/AdminPage.css';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { API_URL } from '../../api/configApi';
import { showErrorToast, showSuccessToast } from './notification';

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
      showErrorToast('Please enter the notification content');
      return;
    }

    if (formData.targetType === 'USER_SPECIFIC' && !formData.targetUserId) {
      showErrorToast('Please select a specific user');
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

      showSuccessToast('Notification sent successfully!');
    } catch (error) {
      console.error('Error sending notification:', error);
      showErrorToast('An error occurred while sending the notification');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US');
  };

  const getTargetTypeLabel = (targetType) => {
    switch (targetType) {
      case 'ALL_USERS':
        return 'All users';
      case 'OWNER_ONLY':
        return 'Car owners only';
      case 'USER_SPECIFIC':
        return 'Specific user';
      case 'ADMIN_ONLY':
        return 'Admins only';
      default:
        return targetType;
    }
  };

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

  const handleEditClick = (notification) => {
    setEditingId(notification.notificationId);
    setEditData({
      content: notification.content,
      type: notification.type,
      targetType: notification.targetType,
      targetUserId: notification.targetUserId ? notification.targetUserId.toString() : ''
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSave = async (notificationId) => {
    try {
      const targetUserId = editData.targetUserId ? parseInt(editData.targetUserId) : null;
      await updateNotification(notificationId, {
        content: editData.content,
        type: editData.type,
        targetType: editData.targetType,
        targetUserId: targetUserId
      });
      
      setEditingId(null);
      await loadNotifications();
      showSuccessToast('Notification updated successfully!');
    } catch (error) {
      console.error('Error updating notification:', error);
      showErrorToast('Failed to update notification');
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditData({ content: '', type: 'SYSTEM', targetType: 'ALL_USERS', targetUserId: '' });
  };

  const handleDelete = async (notificationId) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        await deleteNotification(notificationId);
        await loadNotifications();
        showSuccessToast('Notification deleted successfully!');
      } catch (error) {
        console.error('Error deleting notification:', error);
        showErrorToast('Failed to delete notification');
      }
    }
  };

  return (
    <div className="admin-notification-manager">
      <div className="notification-form-container">
        <h3>Send New Notification</h3>
        <form onSubmit={handleSubmit} className="notification-form">
          <div className="form-group">
            <label htmlFor="content">Notification Content:</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows="4"
              required
              placeholder="Enter notification content..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="type">Type:</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
              >
                <option value="SYSTEM">System</option>
                <option value="PROMO">Promotion</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="targetType">Target:</label>
              <select
                id="targetType"
                name="targetType"
                value={formData.targetType}
                onChange={handleInputChange}
              >
                <option value="ALL_USERS">All users</option>
                <option value="OWNER_ONLY">Car owners only</option>
                <option value="USER_SPECIFIC">Specific user</option>
                <option value="ADMIN_ONLY">Admins only</option>
              </select>
            </div>
          </div>

          {formData.targetType === 'USER_SPECIFIC' && (
            <div className="form-group">
              <label htmlFor="targetUserId">Select User:</label>
              <select
                id="targetUserId"
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

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Sending...' : 'Send Notification'}
          </button>
        </form>

        {message && <div className="message">{message}</div>}
      </div>

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
                      <option value="ADMIN_ONLY">Admins only</option>
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
                    
                    <div className="edit-actions">
                      <button onClick={() => handleEditSave(notification.notificationId)} className="save-btn">Save</button>
                      <button onClick={handleEditCancel} className="cancel-btn">Cancel</button>
                    </div>
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