import axios from 'axios';

export const getBackendUrl = () => {
  const host = window.location.hostname;
  const port = '8080';
  return `http://${host}:${port}`;
};

export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getNotifications = async () => {
  try {
    console.log('Calling getNotifications API...');
    const response = await axios.get(`${getBackendUrl()}/api/notifications`, {
      headers: getAuthHeader()
    });
    console.log('getNotifications response:', response);
    return response;
  } catch (error) {
    console.error('getNotifications error:', error);
    throw error;
  }
};

export const getUnreadCount = async () => {
  try {
    console.log('Calling getUnreadCount API...');
    const response = await axios.get(`${getBackendUrl()}/api/notifications/unread-count`, {
      headers: getAuthHeader()
    });
    console.log('getUnreadCount response:', response);
    return response;
  } catch (error) {
    console.error('getUnreadCount error:', error);
    throw error;
  }
};

export const markAsRead = async (id) => {
  try {
    console.log('Calling markAsRead API for id:', id);
    const response = await axios.put(`${getBackendUrl()}/api/notifications/${id}/read`, {}, {
      headers: getAuthHeader()
    });
    console.log('markAsRead response:', response);
    return response;
  } catch (error) {
    console.error('markAsRead error:', error);
    throw error;
  }
};

export const markAllAsRead = async () => {
  try {
    console.log('Calling markAllAsRead API...');
    const response = await axios.put(`${getBackendUrl()}/api/notifications/mark-all-read`, {}, {
      headers: getAuthHeader()
    });
    console.log('markAllAsRead response:', response);
    return response;
  } catch (error) {
    console.error('markAllAsRead error:', error);
    throw error;
  }
};

export const getReadNotificationIds = async () => {
  try {
    console.log('Calling getReadNotificationIds API...');
    const response = await axios.get(`${getBackendUrl()}/api/notifications/read-ids`, {
      headers: getAuthHeader()
    });
    console.log('getReadNotificationIds response:', response);
    return response;
  } catch (error) {
    console.error('getReadNotificationIds error:', error);
    throw error;
  }
};

export const createNotification = async (content, type = 'SYSTEM', targetType = 'ALL_USERS', targetUserId = null) => {
  try {
    const payload = { content, type, targetType };
    if (targetUserId) {
      payload.targetUserId = targetUserId;
    }
    console.log('Calling createNotification API with payload:', payload);
    const response = await axios.post(`${getBackendUrl()}/api/notifications`, payload, {
      headers: getAuthHeader()
    });
    console.log('createNotification response:', response);
    return response;
  } catch (error) {
    console.error('createNotification error:', error);
    throw error;
  }
};

export const getAllNotifications = async () => {
  try {
    console.log('Calling getAllNotifications API...');
    const response = await axios.get(`${getBackendUrl()}/api/notifications/admin/all`, {
      headers: getAuthHeader()
    });
    console.log('getAllNotifications response:', response);
    return response;
  } catch (error) {
    console.error('getAllNotifications error:', error);
    throw error;
  }
};

export const deleteNotification = async (id) => {
  try {
    const response = await axios.delete(`${getBackendUrl()}/api/notifications/${id}`, {
      headers: getAuthHeader()
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateNotification = async (id, data) => {
  try {
    const response = await axios.put(`${getBackendUrl()}/api/notifications/${id}`, data, {
      headers: getAuthHeader()
    });
    return response;
  } catch (error) {
    throw error;
  }
}; 