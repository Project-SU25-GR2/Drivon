import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { API_URL } from '../api/configApi';
const RentalHistoryContext = createContext();

export const useRentalHistory = () => {
  const context = useContext(RentalHistoryContext);
  if (!context) {
    throw new Error('useRentalHistory must be used within a RentalHistoryProvider');
  }
  return context;
};

export const RentalHistoryProvider = ({ children }) => {
  const [rentalsData, setRentalsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Cache timeout: 5 phút
  const CACHE_TIMEOUT = 5 * 60 * 1000;

  const shouldRefetch = useCallback(() => {
    if (!lastFetchTime) return true;
    if (!isInitialized) return true;
    return Date.now() - lastFetchTime > CACHE_TIMEOUT;
  }, [lastFetchTime, isInitialized]);

  const fetchPaymentStatus = async (bookingId) => {
    try {
      const response = await axios.get(`${API_URL}/payments/booking/${bookingId}`);
      return response.data.status || 'Unknown';
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return 'Not Paid';
      }
      console.error(`Failed to fetch payment status for booking ${bookingId}`, error);
      return 'Error';
    }
  };

  const fetchRentalsData = useCallback(async (userId, forceRefresh = false) => {
    if (!userId) {
      setError('User ID is required');
      return;
    }

    if (!forceRefresh && !shouldRefetch()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_URL}/bookings/owner/${userId}`);
      const rentals = response.data;

      const rentalsWithPaymentStatus = await Promise.all(
        rentals.map(async (rental) => {
          const paymentStatus = await fetchPaymentStatus(rental.id);
          return { ...rental, paymentStatus };
        })
      );
      
      setRentalsData(rentalsWithPaymentStatus);
      setLastFetchTime(Date.now());
      setIsInitialized(true);
      
    } catch (err) {
      setError('Failed to fetch rentals data');
      throw err;
    } finally {
        setLoading(false);
    }
  }, [shouldRefetch]);

  const refreshRentalsData = useCallback((userId) => {
    return fetchRentalsData(userId, true);
  }, [fetchRentalsData]);

  const updateRentalStatus = useCallback(async (rentalId, newStatus) => {
    try {
      await axios.put(
      `${API_URL}/bookings/status/${rentalId}`,
        { status: newStatus },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      
      // Update local state
      setRentalsData(prev => 
        prev.map(rental => 
          rental.id === rentalId 
            ? { ...rental, status: newStatus }
            : rental
        )
      );
      
      return true;
    } catch (err) {
      setError('Failed to update rental status');
      throw err;
    }
  }, []);

  const getRentalsByFilter = useCallback((filterFn) => {
    return rentalsData.filter(filterFn);
  }, [rentalsData]);

  const value = useMemo(() => ({
    rentalsData,
    loading,
    error,
    fetchRentalsData,
    refreshRentalsData,
    updateRentalStatus,
  }), [
    rentalsData,
    loading,
    error,
    fetchRentalsData,
    refreshRentalsData,
    updateRentalStatus,
  ]);

  return (
    <RentalHistoryContext.Provider value={value}>
      {children}
    </RentalHistoryContext.Provider>
  );
};
