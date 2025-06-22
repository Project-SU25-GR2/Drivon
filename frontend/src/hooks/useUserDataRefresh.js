import { useEffect } from 'react';
import { useUserData } from '../contexts/UserDataContext';

export const useUserDataRefresh = () => {
  const { fetchUsersData, shouldRefetch } = useUserData();

  useEffect(() => {
    if (shouldRefetch()) {
      fetchUsersData();
    }
  }, [fetchUsersData, shouldRefetch]);

  return { fetchUsersData };
}; 