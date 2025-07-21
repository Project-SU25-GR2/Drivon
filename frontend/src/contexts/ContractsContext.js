import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_URL } from '../api/configApi';

const ContractsContext = createContext();

export const useContracts = () => {
  const context = useContext(ContractsContext);
  if (!context) {
    throw new Error('useContracts must be used within a ContractsProvider');
  }
  return context;
};

export const ContractsProvider = ({ children }) => {
  const [contractsData, setContractsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const abortControllerRef = useRef(null);

  // Cache timeout: 5 phút
  const CACHE_TIMEOUT = 5 * 60 * 1000;

  const shouldRefetch = () => {
    if (!lastFetchTime) return true;
    if (!isInitialized) return true;
    return Date.now() - lastFetchTime > CACHE_TIMEOUT;
  };

  // Load contracts data ngay khi app khởi động (nếu đã đăng nhập)
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.userId) {
      fetchContractsData(user.userId);
    }
    // eslint-disable-next-line
  }, []);

  const fetchContractsData = async (userId, forceRefresh = false) => {
    if (!userId) {
      setError('User ID is required');
      return [];
    }

    // Không fetch lại nếu đã có data và chưa hết hạn cache
    if (!forceRefresh && !shouldRefetch()) {
      setLoading(false);
      return contractsData;
    }

    setLoading(true);
    setError(null);

    // Hủy request cũ nếu có
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      const response = await axios.get(`${API_URL}/contracts/user/${userId}`, {
        signal: controller.signal,
        timeout: 10000
      });
      clearTimeout(timeoutId);
      const data = response.data || [];
      setContractsData(data);
      setLastFetchTime(Date.now());
      setIsInitialized(true);
      setLoading(false);
      return data;
    } catch (err) {
      // Không hiển thị lỗi canceled lên UI
      if (
        err.code === 'ERR_CANCELED' ||
        err.name === 'CanceledError' ||
        err.message === 'canceled' ||
        err.code === 'ECONNABORTED' ||
        err.name === 'AbortError'
      ) {
        setLoading(false);
        // Không setError
        return;
      }
      if (err.response?.status === 404) {
        setError('Không tìm thấy hợp đồng nào cho người dùng này.');
      } else if (err.response?.status >= 500) {
        setError('Lỗi server. Vui lòng thử lại sau.');
      } else if (err.code === 'ERR_NETWORK') {
        setError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
      } else {
        setError(err.response?.data?.error || 'Không thể tải danh sách hợp đồng');
      }
      setContractsData([]);
      setLoading(false);
      throw err;
    }
  };

  const refreshContractsData = (userId) => {
    return fetchContractsData(userId, true);
  };

  const updateContractStatus = async (contractId, newStatus) => {
    try {
      await axios.put(`${API_URL}/admin/partners/${contractId}/status`, { status: newStatus });
      // Update local state
      setContractsData(prev =>
        prev.map(contract =>
          contract.id === contractId
            ? { ...contract, status: newStatus }
            : contract
        )
      );
      return true;
    } catch (err) {
      setError('Failed to update contract status');
      throw err;
    }
  };

  const getContractById = (contractId) => {
    return contractsData.find(contract => contract.id === contractId);
  };

  const getContractsByFilter = (filterFn) => {
    return contractsData.filter(filterFn);
  };

  const value = {
    contractsData,
    loading,
    error,
    lastFetchTime,
    isInitialized,
    fetchContractsData,
    refreshContractsData,
    updateContractStatus,
    getContractById,
    getContractsByFilter,
    shouldRefetch
  };

  return (
    <ContractsContext.Provider value={value}>
      {children}
    </ContractsContext.Provider>
  );
}; 