import { useCallback } from 'react';
import { useRentalHistory } from '../contexts/RentalHistoryContext';

export const useRentalHistoryRefresh = () => {
  const { refreshRentalsData } = useRentalHistory();

  const refreshData = useCallback(async (userId) => {
    try {
      await refreshRentalsData(userId);
      console.log('Rental history data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing rental history data:', error);
    }
  }, [refreshRentalsData]);

  return { refreshData };
}; 