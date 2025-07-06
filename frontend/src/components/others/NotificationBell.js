import React, { useState, useEffect, useCallback } from 'react';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '../../api/notification';
import webSocketService from '../../services/WebSocketService';
import './NotificationList.css';
import { showErrorToast } from '../toast/notification';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Tách riêng các function để tránh re-render
  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Loading notifications...');
      const response = await getNotifications();
      console.log('Notifications loaded:', response.data);
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
      showErrorToast('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUnreadCount = useCallback(async () => {
    try {
      console.log('Loading unread count...');
      const response = await getUnreadCount();
      console.log('Unread count loaded:', response.data.count);
      setUnreadCount(response.data.count || 0);
    } catch (error) {
      console.error('Error loading unread count:', error);
      setUnreadCount(0);
      // showErrorToast('Failed to load unread count');
    }
  }, []);

  // Load data khi component mount
  useEffect(() => {
    console.log('NotificationBell mounted, loading data...');
    loadNotifications();
    loadUnreadCount();
  }, [loadNotifications, loadUnreadCount]);

  // Setup WebSocket subscriptions
  useEffect(() => {
    console.log('Setting up WebSocket subscriptions...');

    const handleNewNotification = (data) => {
      console.log('Received new notification:', data);
      
      // Add new notification to the list
      const newNotification = {
        notificationId: data.notificationId,
        content: data.content,
        type: data.type,
        targetType: data.targetType,
        isRead: false,
        createdAt: data.createdAt
      };

      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    const handleBroadcastNotification = (data) => {
      console.log('Received broadcast notification:', data);
      
      // Add new notification to the list
      const newNotification = {
        notificationId: data.notificationId,
        content: data.content,
        type: data.type,
        targetType: data.targetType,
        isRead: false,
        createdAt: data.createdAt
      };

      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    // Subscribe to both personal and broadcast notifications
    webSocketService.subscribe('notifications', handleNewNotification);
    webSocketService.subscribe('notifications_broadcast', handleBroadcastNotification);

    return () => {
      console.log('Cleaning up WebSocket subscriptions...');
      webSocketService.unsubscribe('notifications', handleNewNotification);
      webSocketService.unsubscribe('notifications_broadcast', handleBroadcastNotification);
    };
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notif =>
          notif.notificationId === notificationId
            ? { ...notif, isRead: true }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      showErrorToast('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      showErrorToast('Failed to mark all notifications as read');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'SYSTEM':
        return '🔔';
      case 'PROMO':
        return '🎉';
      default:
        return '📢';
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

  const handleBellClick = () => {
    console.log('Bell clicked, current state:', { isOpen, notificationsCount: notifications.length });
    setIsOpen(!isOpen);
    
    // Load fresh data when opening
    if (!isOpen) {
      loadNotifications();
      loadUnreadCount();
    }
  };

  return (
    <div className="notification-bell">
      <div className="notification-icon" onClick={handleBellClick}>
        <i className="bi bi-bell-fill bell-icon"></i>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </div>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Thông báo ({notifications.length})</h3>
            {unreadCount > 0 && (
              <button 
                className="mark-all-read-btn"
                onClick={handleMarkAllAsRead}
              >
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          <div className="notification-list">
            {loading ? (
              <div className="loading">Đang tải...</div>
            ) : notifications.length === 0 ? (
              <div className="no-notifications">Không có thông báo nào</div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.notificationId}
                  className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                  onClick={() => !notification.isRead && handleMarkAsRead(notification.notificationId)}
                >
                  <div className="notification-content">
                    <div className="notification-header-item">
                      <span className="notification-icon-item">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <span className={`notification-type${notification.type === 'PROMO' ? ' promotion' : ''}`}>
                        {getTypeLabel(notification.type)}
                      </span>
                      {!notification.isRead && (
                        <span className="unread-indicator">●</span>
                      )}
                    </div>
                    <div className="notification-text">
                      {notification.content}
                    </div>
                    <div className="notification-time">
                      {formatDate(notification.createdAt)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell; 