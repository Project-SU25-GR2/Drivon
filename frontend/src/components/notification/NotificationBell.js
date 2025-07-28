import React, { useState, useEffect, useCallback } from 'react';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, getReadNotificationIds } from '../../api/notification';
import webSocketService from '../../services/WebSocketService';
import './NotificationList.css';
import { showErrorToast, showSuccessToast } from './notification';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState(new Set());

  // Lấy userId hiện tại từ localStorage
  let currentUserId = null;
  try {
    const userData = JSON.parse(localStorage.getItem('user'));
    currentUserId = userData?.userId;
  } catch (e) {
    currentUserId = null;
  }

  // Separate functions to avoid re-render
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
      // showErrorToast('Failed to load notifications');
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

  const loadReadNotificationIds = useCallback(async () => {
    try {
      console.log('Loading read notification ids...');
      const response = await getReadNotificationIds();
      console.log('Read notification ids loaded:', response.data.readIds);
      setReadNotificationIds(new Set(response.data.readIds || []));
    } catch (error) {
      console.error('Error loading read notification ids:', error);
      setReadNotificationIds(new Set());
    }
  }, []);

  // Load data when component mounts
  useEffect(() => {
    console.log('NotificationBell mounted, loading data...');
    loadNotifications();
    loadUnreadCount();
    loadReadNotificationIds();
  }, [loadNotifications, loadUnreadCount, loadReadNotificationIds]);

  // Setup WebSocket subscriptions
  useEffect(() => {
    console.log('Setting up WebSocket subscriptions...');

    const handleNewNotification = (data) => {
      console.log('Received new notification:', data);
      const newNotification = {
        notificationId: data.notificationId,
        content: data.content,
        type: data.type,
        targetType: data.targetType,
        createdAt: data.createdAt,
        senderId: data.senderId // cần backend gửi kèm senderId
      };
      setNotifications(prev => {
        if (prev.some(n => n.notificationId === newNotification.notificationId)) {
          return prev;
        }
        return [newNotification, ...prev];
      });
      setUnreadCount(prev => prev + 1);
      // Nếu notification do chính mình gửi thì không hiện toast realtime
      // if (newNotification.senderId && newNotification.senderId === currentUserId) return;
      // window.toast && window.toast({
      //   title: 'Notification',
      //   message: data.content,
      //   type: 'info',
      //   duration: 5000,
      //   position: 'left'
      // });
    };

    const handleBroadcastNotification = (data) => {
      console.log('Received broadcast notification:', data);
      const newNotification = {
        notificationId: data.notificationId,
        content: data.content,
        type: data.type,
        targetType: data.targetType,
        createdAt: data.createdAt,
        senderId: data.senderId // cần backend gửi kèm senderId
      };
      setNotifications(prev => {
        if (prev.some(n => n.notificationId === newNotification.notificationId)) {
          return prev;
        }
        return [newNotification, ...prev];
      });
      setUnreadCount(prev => prev + 1);
      // Nếu notification do chính mình gửi thì không hiện toast realtime
      if (newNotification.senderId && newNotification.senderId === currentUserId) return;
      window.toast && window.toast({
        title: 'Notification',
        message: data.content,
        type: 'info',
        duration: 5000,
        position: 'left'
      });
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

  useEffect(() => {
    window.reloadNotifications = loadNotifications;
    return () => {
      window.reloadNotifications = null;
    };
  }, [loadNotifications]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
      // Reload data to ensure consistency
      await loadUnreadCount();
      await loadReadNotificationIds();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      showErrorToast('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      // Reload data from server to ensure consistency
      await loadNotifications();
      await loadUnreadCount();
      await loadReadNotificationIds();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      showErrorToast('Failed to mark all notifications as read');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US');
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
      loadReadNotificationIds();
    }
  };

  const isNotificationRead = (notificationId) => {
    return readNotificationIds.has(notificationId);
  };

  return (
    <div className="notification-bell">
      <div className="notification-icon" onClick={handleBellClick}>
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </div>

      {isOpen && (
        <div className="notification-dropdown-custom">
          <div className="notification-header-custom">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button className="mark-all-read-btn-custom" onClick={handleMarkAllAsRead}>
                Mark all read
              </button>
            )}
          </div>
          <div className="notification-list-custom">
            {loading ? (
              <div className="notification-empty-custom">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="notification-empty-custom">No notifications</div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.notificationId}
                  className={`notification-item-custom ${!isNotificationRead(notification.notificationId) ? 'unread-custom' : ''}`}
                  onClick={() => !isNotificationRead(notification.notificationId) && handleMarkAsRead(notification.notificationId)}
                >
                  <div className="notification-icon-type-custom">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content-custom">
                    <div className="notification-type-row-custom">
                      <span className={`notification-type-custom${notification.type === 'PROMO' ? ' promotion-custom' : ''}`}>
                        {getTypeLabel(notification.type)}
                      </span>
                      {!isNotificationRead(notification.notificationId) && (
                        <span className="unread-indicator-custom" title="Chưa đọc"></span>
                      )}
                    </div>
                    <div className="notification-text-custom">
                      {notification.content}
                    </div>
                    <div className="notification-time-custom">
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