import React, { useEffect, useState } from 'react';
import { getNotifications, addNotification } from '../../api/notification';

const AdminNotificationManager = () => {
  const [notifications, setNotifications] = useState([]);
  const [content, setContent] = useState('');
  const [type, setType] = useState('SYSTEM');
  const [sending, setSending] = useState(false);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [refresh]);

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data);
    } catch {
      setNotifications([]);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await addNotification(content, type);
      alert('Đã gửi thông báo đến tất cả user!');
      setContent('');
      setRefresh(r => !r);
    } catch {
      alert('Gửi thông báo thất bại!');
    }
    setSending(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <h2>Quản lý thông báo</h2>
      <form onSubmit={handleSend} style={{ marginBottom: 24 }}>
        <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Nội dung thông báo" rows={3} style={{ width: '100%' }} required />
        <select value={type} onChange={e => setType(e.target.value)} style={{ margin: '8px 0' }}>
          <option value="SYSTEM">Hệ thống</option>
          <option value="PROMO">Khuyến mãi</option>
        </select>
        <button type="submit" disabled={sending} style={{ marginLeft: 8 }}>
          {sending ? 'Đang gửi...' : 'Gửi thông báo'}
        </button>
      </form>
      <h3>Danh sách thông báo đã gửi</h3>
      <div style={{ maxHeight: 400, overflowY: 'auto', border: '1px solid #eee', borderRadius: 8 }}>
        {notifications.length === 0 && <div style={{ padding: 16 }}>Chưa có thông báo nào.</div>}
        {notifications.map(n => (
          <div key={n.notificationId} style={{ padding: 12, borderBottom: '1px solid #f0f0f0', background: n.isRead ? '#fafafa' : '#e3f2fd' }}>
            <div style={{ fontWeight: 'bold' }}>{n.content}</div>
            <div style={{ fontSize: 12, color: '#888' }}>{new Date(n.createdAt).toLocaleString()} - {n.type}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminNotificationManager; 