import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../api/configApi';
const UserDataContext = createContext();

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
};

export const UserDataProvider = ({ children }) => {
  const [usersData, setUsersData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Cache timeout: 5 phút
  const CACHE_TIMEOUT = 5 * 60 * 1000;

  const shouldRefetch = () => {
    if (!lastFetchTime) return true;
    if (!isInitialized) return true;
    return Date.now() - lastFetchTime > CACHE_TIMEOUT;
  };

  const fetchUsersData = async (forceRefresh = false) => {
    if (!forceRefresh && !shouldRefetch()) {
      return usersData;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Fetching users from API...');
      const response = await axios.get(`${API_URL}/admin/users`);
      console.log('Users API response:', response.data);
      
      const data = response.data;
      setUsersData(data);
      setLastFetchTime(Date.now());
      setIsInitialized(true);
      setLoading(false);
      
      return data;
    } catch (err) {
      console.error('Error fetching users:', err);
      console.error('Error response:', err.response);
      console.error('Error status:', err.response?.status);
      console.error('Error data:', err.response?.data);
      
      let errorMessage = 'Failed to fetch users';
      
      if (err.response?.status === 500) {
        errorMessage = 'Server error (500) - Backend service might be down or database connection issue';
      } else if (err.response?.status === 404) {
        errorMessage = 'API endpoint not found (404) - Check if backend is running';
      } else if (err.code === 'ERR_NETWORK') {
        errorMessage = 'Network error - Backend server is not running or not accessible';
      } else if (err.response?.data?.message) {
        errorMessage = `Server error: ${err.response.data.message}`;
      } else {
        errorMessage = `Error: ${err.message}`;
      }
      
      setError(errorMessage);
      setLoading(false);
      throw err;
    }
  };

  const refreshUsersData = () => {
    return fetchUsersData(true);
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      // Đảm bảo role được gửi đúng định dạng (chữ thường)
      const formattedRole = newRole.toLowerCase();
      
      console.log('Đang cập nhật vai trò:', {
        userId,
        newRole: formattedRole
      });

      const response = await axios.put(`${API_URL}/admin/users/${userId}/role`, { 
        role: formattedRole 
      });
      
      console.log('Phản hồi từ server:', response.data);
      
      // Update local state
      setUsersData(prev =>
        prev.map(u => (u.userId === userId ? { ...u, role: formattedRole } : u))
      );
      
      return true;
    } catch (err) {
      console.error('Lỗi khi cập nhật vai trò:', err);
      console.error('Chi tiết lỗi:', err.response?.data);
      throw err;
    }
  };

  const updateUserStatus = async (userId, newStatus) => {
    try {
      const response = await axios.put(`${API_URL}/admin/users/${userId}/status`, {
        status: newStatus
      });
      
      // Update local state
      setUsersData(prev =>
        prev.map(u => (u.userId === userId ? { ...u, status: newStatus } : u))
      );
      
      return true;
    } catch (err) {
      console.error('Lỗi khi cập nhật trạng thái người dùng:', err);
      throw err;
    }
  };

  const deleteUser = async (userId) => {
    try {
        await axios.delete(`${API_URL}/admin/users/${userId}`);
      
      // Update local state
      setUsersData(prev => prev.filter(u => u.userId !== userId));
      
      return true;
    } catch (err) {
      console.error('Error deleting user:', err);
      throw err;
    }
  };

  const getUserById = (userId) => {
    return usersData.find(user => user.userId === userId);
  };

  const getUsersByFilter = (filterFn) => {
    return usersData.filter(filterFn);
  };

  const value = {
    usersData,
    loading,
    error,
    lastFetchTime,
    isInitialized,
    fetchUsersData,
    refreshUsersData,
    updateUserRole,
    updateUserStatus,
    deleteUser,
    getUserById,
    getUsersByFilter,
    shouldRefetch
  };

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
}; 