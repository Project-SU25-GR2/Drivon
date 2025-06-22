import { useCallback } from 'react';
import { useCarData } from '../contexts/CarDataContext';

export const useCarDataRefresh = () => {
  const { refreshCarsData } = useCarData();

  const refreshData = useCallback(async () => {
    try {
      await refreshCarsData();
      console.log('Car data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing car data:', error);
    }
  }, [refreshCarsData]);

  return { refreshData };
}; 