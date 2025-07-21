import { useCallback } from 'react';
import { useContracts } from '../contexts/ContractsContext';

export const useContractsRefresh = () => {
  const { refreshContractsData } = useContracts();

  const refreshData = useCallback(async (userId) => {
    try {
      await refreshContractsData(userId);
      console.log('Contracts data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing contracts data:', error);
    }
  }, [refreshContractsData]);

  return { refreshData };
}; 