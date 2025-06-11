import React, { createContext, useContext, useState, useEffect } from 'react';

// Initial state
const initialState = {
  deviceTypes: [],
  brands: [],
  deviceModels: [],
  isLoading: true,
  error: null,
  getDeviceTypeById: () => undefined,
  getBrandById: () => undefined,
  getModelById: () => undefined,
  getModelsByBrandId: () => [],
  getModelsByDeviceTypeId: () => [],
  getBrandsByDeviceTypeId: () => []
};

// Create context
const ModelsContext = createContext(initialState);

// Provider component
export const ModelsProvider = ({ children }) => {
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [brands, setBrands] = useState([]);
  const [deviceModels, setDeviceModels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch device types
        const deviceTypesResponse = await fetch('/api/device-types');
        if (!deviceTypesResponse.ok) {
          throw new Error('Failed to fetch device types');
        }
        const deviceTypesData = await deviceTypesResponse.json();

        // Fetch brands
        const brandsResponse = await fetch('/api/brands');
        if (!brandsResponse.ok) {
          throw new Error('Failed to fetch brands');
        }
        const brandsData = await brandsResponse.json();

        // Fetch device models
        const modelsResponse = await fetch('/api/device-models');
        if (!modelsResponse.ok) {
          throw new Error('Failed to fetch device models');
        }
        const modelsData = await modelsResponse.json();

        setDeviceTypes(deviceTypesData);
        setBrands(brandsData);
        setDeviceModels(modelsData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper functions
  const getDeviceTypeById = (id) => {
    return deviceTypes.find(dt => dt.id === id);
  };

  const getBrandById = (id) => {
    return brands.find(b => b.id === id);
  };

  const getModelById = (id) => {
    return deviceModels.find(m => m.id === id);
  };

  const getModelsByBrandId = (brandId) => {
    return deviceModels.filter(m => m.brand_id === brandId);
  };

  const getModelsByDeviceTypeId = (deviceTypeId) => {
    return deviceModels.filter(m => m.device_type_id === deviceTypeId);
  };

  const getBrandsByDeviceTypeId = (deviceTypeId) => {
    const modelsForDeviceType = deviceModels.filter(m => m.device_type_id === deviceTypeId);
    const brandIds = [...new Set(modelsForDeviceType.map(m => m.brand_id))];
    return brands.filter(b => brandIds.includes(b.id));
  };

  const value = {
    deviceTypes,
    brands,
    deviceModels,
    isLoading,
    error,
    getDeviceTypeById,
    getBrandById,
    getModelById,
    getModelsByBrandId,
    getModelsByDeviceTypeId,
    getBrandsByDeviceTypeId
  };

  return (
    <ModelsContext.Provider value={value}>
      {children}
    </ModelsContext.Provider>
  );
};

// Hook to use the context
export const useModels = () => {
  const context = useContext(ModelsContext);
  if (context === undefined) {
    throw new Error('useModels must be used within a ModelsProvider');
  }
  return context;
};

export default ModelsContext;