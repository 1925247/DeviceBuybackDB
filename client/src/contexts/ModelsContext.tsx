import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types
interface DeviceType {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
}

interface Brand {
  id: number;
  name: string;
  logo: string;
  slug: string;
}

interface DeviceModel {
  id: number;
  name: string;
  brand_id: number;
  device_type_id: number;
  release_year: number;
  image_url: string;
  description?: string;
  slug: string;
}

interface ModelsContextType {
  deviceTypes: DeviceType[];
  brands: Brand[];
  deviceModels: DeviceModel[];
  isLoading: boolean;
  error: string | null;
  getDeviceTypeById: (id: number) => DeviceType | undefined;
  getBrandById: (id: number) => Brand | undefined;
  getModelById: (id: number) => DeviceModel | undefined;
  getModelsByBrandId: (brandId: number) => DeviceModel[];
  getModelsByDeviceTypeId: (deviceTypeId: number) => DeviceModel[];
  getBrandsByDeviceTypeId: (deviceTypeId: number) => Brand[];
}

// Initial state
const initialState: ModelsContextType = {
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
  getBrandsByDeviceTypeId: () => [],
};

// Context creation
const ModelsContext = createContext<ModelsContextType>(initialState);

// Provider Component
interface ModelsProviderProps {
  children: ReactNode;
}

export const ModelsProvider: React.FC<ModelsProviderProps> = ({ children }) => {
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [deviceModels, setDeviceModels] = useState<DeviceModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch device types
        const deviceTypesResponse = await fetch('/api/device-types');
        if (!deviceTypesResponse.ok) {
          throw new Error('Failed to fetch device types');
        }
        const deviceTypesData = await deviceTypesResponse.json();
        
        // Map the API data structure to our interface
        const mappedDeviceTypes: DeviceType[] = deviceTypesData.map((type: any) => ({
          id: type.id,
          name: type.name,
          slug: type.slug,
          description: type.description || `${type.name} devices`,
          icon: type.icon
        }));
        
        // Fetch brands
        const brandsResponse = await fetch('/api/brands');
        if (!brandsResponse.ok) {
          throw new Error('Failed to fetch brands');
        }
        const brandsData = await brandsResponse.json();
        
        // Map the API data structure to our interface
        const mappedBrands: Brand[] = brandsData.map((brand: any) => ({
          id: brand.id,
          name: brand.name,
          logo: brand.logo,
          slug: brand.slug
        }));
        
        // Fetch device models
        const deviceModelsResponse = await fetch('/api/device-models');
        if (!deviceModelsResponse.ok) {
          throw new Error('Failed to fetch device models');
        }
        const deviceModelsData = await deviceModelsResponse.json();
        
        // Map the API data structure to our interface
        const mappedDeviceModels: DeviceModel[] = deviceModelsData.map((model: any) => ({
          id: model.id,
          name: model.name,
          brand_id: model.brand_id,
          device_type_id: model.device_type_id,
          release_year: model.release_year || new Date().getFullYear(),
          image_url: model.image || `https://placehold.co/300x200?text=${encodeURIComponent(model.name)}`,
          description: model.description,
          slug: model.slug
        }));

        setDeviceTypes(mappedDeviceTypes);
        setBrands(mappedBrands);
        setDeviceModels(mappedDeviceModels);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching models data:', err);
        setError(err instanceof Error ? err.message : "Failed to fetch device models data");
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper functions
  const getDeviceTypeById = (id: number): DeviceType | undefined => {
    return deviceTypes.find(type => type.id === id);
  };

  const getBrandById = (id: number): Brand | undefined => {
    return brands.find(brand => brand.id === id);
  };

  const getModelById = (id: number): DeviceModel | undefined => {
    return deviceModels.find(model => model.id === id);
  };

  const getModelsByBrandId = (brandId: number): DeviceModel[] => {
    return deviceModels.filter(model => model.brand_id === brandId);
  };

  const getModelsByDeviceTypeId = (deviceTypeId: number): DeviceModel[] => {
    return deviceModels.filter(model => model.device_type_id === deviceTypeId);
  };

  const getBrandsByDeviceTypeId = (deviceTypeId: number): Brand[] => {
    // Get unique brand IDs for this device type
    const brandIdsArray = deviceModels
      .filter(model => model.device_type_id === deviceTypeId)
      .map(model => model.brand_id);
    
    // Use object to track unique IDs
    const uniqueBrandIds: Record<number, boolean> = {};
    brandIdsArray.forEach(id => {
      uniqueBrandIds[id] = true;
    });
    
    // Return brands that match these IDs
    return brands.filter(brand => uniqueBrandIds[brand.id]);
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

// Custom hook to use the context
export const useModels = () => {
  const context = useContext(ModelsContext);
  if (context === undefined) {
    throw new Error('useModels must be used within a ModelsProvider');
  }
  return context;
};

export default ModelsContext;