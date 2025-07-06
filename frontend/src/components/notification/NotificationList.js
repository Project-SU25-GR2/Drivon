import React from 'react';
import { markAsRead } from '../../api/notification';

const NotificationList = ({ notifications, onRefresh }) => {
  const handleMarkAsRead = async (id) => {
    await markAsRead(id);
    onRefresh();
  };

  return (
    <div style={{ position: 'absolute', right: 0, top: 40, background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', width: 320, zIndex: 1000, borderRadius: 8, maxHeight: 400, overflowY: 'auto' }}>
      <div style={{ padding: 12, borderBottom: '1px solid #eee', fontWeight: 'bold', color: '#000' }}>Thông báo</div>
      {notifications.length === 0 && <div style={{ padding: 16, color: '#000' }}>Không có thông báo nào.</div>}
      {notifications.map(n => (
        <div key={n.notificationId} style={{ padding: 12, borderBottom: '1px solid #f0f0f0', background: n.isRead ? '#fafafa' : '#e3f2fd' }}>
          <div style={{ fontWeight: n.isRead ? 'normal' : 'bold', color: '#111' }}>{n.content}</div>
          <div style={{ fontSize: 12, color: '#111' }}>{new Date(n.createdAt).toLocaleString()}</div>
          {!n.isRead && <button style={{ marginTop: 6, fontSize: 12 }} onClick={() => handleMarkAsRead(n.notificationId)}>Đánh dấu đã đọc</button>}
        </div>
      ))}
    </div>
  );
};

export default NotificationList; 