import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../api/configApi';
const CarDataContext = createContext();

export const useCarData = () => {
  const context = useContext(CarDataContext);
  if (!context) {
    throw new Error('useCarData must be used within a CarDataProvider');
  }
  return context;
};

export const CarDataProvider = ({ children }) => {
  const [carsData, setCarsData] = useState([]);
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

  const fetchCarsData = async (forceRefresh = false) => {
    if (!forceRefresh && !shouldRefetch()) {
      return carsData;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_URL}/cars/active-lease-with-details`);
      const data = response.data;
      
      setCarsData(data);
      setLastFetchTime(Date.now());
      setIsInitialized(true);
      setLoading(false);
      
      return data;
    } catch (err) {
      setError('Failed to fetch cars data');
      setLoading(false);
      throw err;
    }
  };

  const refreshCarsData = () => {
    return fetchCarsData(true);
  };

  const getCarByLicensePlate = (licensePlate) => {
    return carsData.find(car => car.licensePlate === licensePlate);
  };

  const getCarsByFilter = (filterFn) => {
    return carsData.filter(filterFn);
  };

  const value = {
    carsData,
    loading,
    error,
    lastFetchTime,
    isInitialized,
    fetchCarsData,
    refreshCarsData,
    getCarByLicensePlate,
    getCarsByFilter,
    shouldRefetch
  };

  return (
    <CarDataContext.Provider value={value}>
      {children}
    </CarDataContext.Provider>
  );
}; 