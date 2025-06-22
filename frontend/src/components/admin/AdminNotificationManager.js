import React, { useState, useEffect } from 'react';
import { createNotification, getAllNotifications } from '../../api/notification';
import { getAllUsers } from '../../api/config';
import './AdminPage.css';

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
      setMessage('Vui lòng nhập nội dung thông báo');
      return;
    }

    if (formData.targetType === 'USER_SPECIFIC' && !formData.targetUserId) {
      setMessage('Vui lòng chọn người dùng cụ thể');
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

      setMessage('Thông báo đã được gửi thành công!');
    } catch (error) {
      console.error('Error sending notification:', error);
      setMessage('Có lỗi xảy ra khi gửi thông báo');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
  };

  const getTargetTypeLabel = (targetType) => {
    switch (targetType) {
      case 'ALL_USERS':
        return 'Tất cả người dùng';
      case 'OWNER_ONLY':
        return 'Chỉ chủ xe';
      case 'USER_SPECIFIC':
        return 'Người dùng cụ thể';
      default:
        return targetType;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'SYSTEM':
        return 'Hệ thống';
      case 'PROMO':
        return 'Khuyến mãi';
      default:
        return type;
    }
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.userId === userId);
    return user ? `${user.fullName} (${user.email})` : `User ID: ${userId}`;
  };

  return (
    <div className="admin-notification-manager">
      <h2>Quản lý thông báo</h2>

      {/* Form tạo thông báo */}
      <div className="notification-form-container">
        <h3>Tạo thông báo mới</h3>
        <form onSubmit={handleSubmit} className="notification-form">
          <div className="form-group">
            <label>Nội dung thông báo:</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="Nhập nội dung thông báo..."
              required
              rows="4"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Loại thông báo:</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
              >
                <option value="SYSTEM">Hệ thống</option>
                <option value="PROMO">Khuyến mãi</option>
              </select>
            </div>

            <div className="form-group">
              <label>Đối tượng nhận:</label>
              <select
                name="targetType"
                value={formData.targetType}
                onChange={handleInputChange}
              >
                <option value="ALL_USERS">Tất cả người dùng</option>
                <option value="OWNER_ONLY">Chỉ chủ xe</option>
                <option value="USER_SPECIFIC">Người dùng cụ thể</option>
              </select>
            </div>
          </div>

          {formData.targetType === 'USER_SPECIFIC' && (
            <div className="form-group">
              <label>Chọn người dùng:</label>
              <select
                name="targetUserId"
                value={formData.targetUserId}
                onChange={handleInputChange}
                required
              >
                <option value="">Chọn người dùng...</option>
                {users.map(user => (
                  <option key={user.userId} value={user.userId}>
                    {user.fullName} ({user.email}) - {user.role}
                  </option>
                ))}
              </select>
            </div>
          )}

          {message && (
            <div className={`message ${message.includes('thành công') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Đang gửi...' : 'Gửi thông báo'}
          </button>
        </form>
      </div>

      {/* Danh sách thông báo */}
      <div className="notifications-list-container">
        <h3>Lịch sử thông báo</h3>
        <div className="notifications-list">
          {notifications.length === 0 ? (
            <p>Chưa có thông báo nào</p>
          ) : (
            notifications.map(notification => (
              <div key={notification.notificationId} className="notification-item">
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
                    {notification.isRead ? 'Đã đọc' : 'Chưa đọc'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNotificationManager; 