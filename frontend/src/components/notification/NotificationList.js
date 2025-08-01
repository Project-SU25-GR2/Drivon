import React from 'react';
import { markAsRead } from '../../api/notification';

const NotificationList = ({ notifications, onRefresh, readNotificationIds = new Set() }) => {
  const handleMarkAsRead = async (id) => {
    await markAsRead(id);
    onRefresh();
  };

  const isNotificationRead = (notificationId) => {
    return readNotificationIds.has(notificationId);
  };

  return (
    <div style={{ position: 'absolute', right: 0, top: 40, background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', width: 320, zIndex: 1000, borderRadius: 8, maxHeight: 400, overflowY: 'auto' }}>
      <div style={{ padding: 12, borderBottom: '1px solid #eee', fontWeight: 'bold', color: '#000' }}>Notifications</div>
      {notifications.length === 0 && <div style={{ padding: 16, color: '#000' }}>No notifications.</div>}
      {notifications.map(n => (
        <div key={n.notificationId} style={{ padding: 12, borderBottom: '1px solid #f0f0f0', background: isNotificationRead(n.notificationId) ? '#fafafa' : '#e3f2fd' }}>
          <div style={{ fontWeight: isNotificationRead(n.notificationId) ? 'normal' : 'bold', color: '#111' }}>{n.content}</div>
          <div style={{ fontSize: 12, color: '#111' }}>{new Date(n.createdAt).toLocaleString()}</div>
          {!isNotificationRead(n.notificationId) && <button style={{ marginTop: 6, fontSize: 12 }} onClick={() => handleMarkAsRead(n.notificationId)}>Mark as read</button>}
        </div>
      ))}
    </div>
  );
};

export default NotificationList; 