import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const CarManagementContext = createContext();

export const useCarManagement = () => {
  const context = useContext(CarManagementContext);
  if (!context) {
    throw new Error('useCarManagement must be used within a CarManagementProvider');
  }
  return context;
};

export const CarManagementProvider = ({ children }) => {
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

  const fetchCarsData = async (userId, forceRefresh = false) => {
    if (!userId) {
      setError('User ID is required');
      return [];
    }

    if (!forceRefresh && !shouldRefetch()) {
      return carsData;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`http://localhost:8080/api/cars/owner/${userId}/with-contracts`);
      const data = response.data;
      
      // Process the data to combine images and ensure pricePerDay is available
      const carsWithProcessedData = data.map((car) => ({
        ...car,
        images: car.mainImage
          ? [car.mainImage, ...(car.otherImages || [])]
          : car.otherImages || [],
      }));
      
      setCarsData(carsWithProcessedData);
      setLastFetchTime(Date.now());
      setIsInitialized(true);
      setLoading(false);
      
      return carsWithProcessedData;
    } catch (err) {
      setError('Failed to fetch cars data');
      setLoading(false);
      throw err;
    }
  };

  const refreshCarsData = (userId) => {
    return fetchCarsData(userId, true);
  };

  const deleteCar = async (licensePlate) => {
    try {
      await axios.delete(`http://localhost:8080/api/cars/${licensePlate}`);
      setCarsData(prev => prev.filter(car => car.licensePlate !== licensePlate));
      return true;
    } catch (err) {
      setError('Failed to delete car');
      throw err;
    }
  };

  const updateCarStatus = async (licensePlate, newStatus) => {
    try {
      await axios.patch(
        `http://localhost:8080/api/cars/${licensePlate}/status`,
        { status: newStatus }
      );
      
      setCarsData(prev => 
        prev.map(car => 
          car.licensePlate === licensePlate 
            ? { ...car, status: newStatus }
            : car
        )
      );
      
      return true;
    } catch (err) {
      setError('Failed to update car status');
      throw err;
    }
  };

  const addCar = (newCar) => {
    const carWithImages = {
      ...newCar,
      pricePerDay: newCar.pricePerDay || null,
      contract: newCar.contract || null,
      images: newCar.mainImage
        ? [newCar.mainImage, ...(newCar.otherImages || [])]
        : newCar.otherImages || [],
    };
    
    setCarsData(prev => [...prev, carWithImages]);
  };

  const updateCar = (updatedCar) => {
    const updatedCarWithImages = {
      ...updatedCar,
      pricePerDay: updatedCar.pricePerDay || null,
      contract: updatedCar.contract || null,
      images: updatedCar.mainImage
        ? [updatedCar.mainImage, ...(updatedCar.otherImages || [])]
        : updatedCar.otherImages || [],
    };

    setCarsData(prev => 
      prev.map(car => 
        car.licensePlate === updatedCarWithImages.licensePlate
          ? updatedCarWithImages
          : car
      )
    );
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
    deleteCar,
    updateCarStatus,
    addCar,
    updateCar,
    getCarByLicensePlate,
    getCarsByFilter,
    shouldRefetch
  };

  return (
    <CarManagementContext.Provider value={value}>
      {children}
    </CarManagementContext.Provider>
  );
}; 