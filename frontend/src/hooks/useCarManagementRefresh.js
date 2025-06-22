import { useCallback } from 'react';
import { useCarManagement } from '../contexts/CarManagementContext';

export const useCarManagementRefresh = () => {
  const { refreshCarsData } = useCarManagement();

  const refreshData = useCallback(async (userId) => {
    try {
      await refreshCarsData(userId);
      console.log('Car management data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing car management data:', error);
    }
  }, [refreshCarsData]);

  return { refreshData };
}; 