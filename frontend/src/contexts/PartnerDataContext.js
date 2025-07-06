import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../api/configApi';
const PartnerDataContext = createContext();

export const usePartnerData = () => {
  const context = useContext(PartnerDataContext);
  if (!context) {
    throw new Error('usePartnerData must be used within a PartnerDataProvider');
  }
  return context;
};

export const PartnerDataProvider = ({ children }) => {
  const [partnersData, setPartnersData] = useState([]);
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

  const fetchPartnersData = async (forceRefresh = false) => {
    if (!forceRefresh && !shouldRefetch()) {
      return partnersData;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Fetching partners from API...');
      const response = await axios.get(`${API_URL}/admin/partners`);
      console.log('Partners API response:', response.data);
      
      const data = response.data;
      setPartnersData(data);
      setLastFetchTime(Date.now());
      setIsInitialized(true);
      setLoading(false);
      
      return data;
    } catch (err) {
      console.error('Error fetching partners:', err);
      console.error('Error response:', err.response);
      console.error('Error status:', err.response?.status);
      console.error('Error data:', err.response?.data);
      
      let errorMessage = 'Failed to fetch partners';
      
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

  const refreshPartnersData = () => {
    return fetchPartnersData(true);
  };

  const updatePartnerStatus = async (id, newStatus) => {
    try {
      console.log(`Updating partner status: ${id} to ${newStatus}`);
      await axios.put(`${API_URL}/admin/partners/${id}/status`, { status: newStatus });
      
      // Update local state
      setPartnersData(prev =>
        prev.map(p => (p.id === id ? { ...p, status: newStatus } : p))
      );
      
      return true;
    } catch (err) {
      console.error('Error updating partner status:', err);
      throw err;
    }
  };

  const getPartnerById = (id) => {
    return partnersData.find(partner => partner.id === id);
  };

  const getPartnersByFilter = (filterFn) => {
    return partnersData.filter(filterFn);
  };

  const value = {
    partnersData,
    loading,
    error,
    lastFetchTime,
    isInitialized,
    fetchPartnersData,
    refreshPartnersData,
    updatePartnerStatus,
    getPartnerById,
    getPartnersByFilter,
    shouldRefetch
  };

  return (
    <PartnerDataContext.Provider value={value}>
      {children}
    </PartnerDataContext.Provider>
  );
}; 