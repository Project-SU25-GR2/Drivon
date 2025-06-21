import React, { useState, useEffect, useRef } from 'react';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Badge from '@mui/material/Badge';
import NotificationList from './NotificationList';
import { getNotifications } from '../../api/notification';

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const bellRef = useRef();

  useEffect(() => {
    fetchNotifications();
    // Đóng dropdown khi click ngoài
    const handleClickOutside = (event) => {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data);
    } catch (err) {
      setNotifications([]);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} ref={bellRef}>
      <Badge badgeContent={unreadCount} color="error">
        <NotificationsIcon style={{ cursor: 'pointer' }} onClick={() => setOpen(!open)} />
      </Badge>
      {open && <NotificationList notifications={notifications} onRefresh={fetchNotifications} />}
    </div>
  );
};

export default NotificationBell; 