import axios from 'axios';

const getAuthHeader = () => {
  const userData = JSON.parse(localStorage.getItem('user'));
  const token = userData?.token;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getNotifications = () => {
  return axios.get('/api/notifications', {
    headers: getAuthHeader()
  });
};

export const markAsRead = (id) => {
  return axios.put(`/api/notifications/${id}/read`, {}, {
    headers: getAuthHeader()
  });
};

export const addNotification = (content, type = 'SYSTEM') => {
  return axios.post('/api/notifications', { content, type }, {
    headers: getAuthHeader()
  });
}; 