import { useEffect } from 'react';
import { usePartnerData } from '../contexts/PartnerDataContext';

export const usePartnerDataRefresh = () => {
  const { fetchPartnersData, shouldRefetch } = usePartnerData();

  useEffect(() => {
    if (shouldRefetch()) {
      fetchPartnersData();
    }
  }, [fetchPartnersData, shouldRefetch]);

  return { fetchPartnersData };
}; 