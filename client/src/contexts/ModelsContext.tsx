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
        // Temporary hardcoded data until API is ready
        const mockDeviceTypes: DeviceType[] = [
          {
            id: 1,
            name: "Smartphone",
            slug: "smartphone",
            description: "Mobile phones with advanced features",
            icon: "smartphone"
          },
          {
            id: 2,
            name: "Laptop",
            slug: "laptop",
            description: "Portable computers",
            icon: "laptop"
          },
          {
            id: 3,
            name: "Tablet",
            slug: "tablet",
            description: "Mobile devices larger than smartphones",
            icon: "tablet"
          },
          {
            id: 4,
            name: "Smart Watch",
            slug: "smartwatch",
            description: "Wearable computing devices",
            icon: "watch"
          }
        ];

        const mockBrands: Brand[] = [
          {
            id: 1,
            name: "Apple",
            logo: "https://cdn-icons-png.flaticon.com/128/0/747.png",
            slug: "apple"
          },
          {
            id: 2,
            name: "Samsung",
            logo: "https://cdn-icons-png.flaticon.com/128/882/882747.png",
            slug: "samsung"
          },
          {
            id: 3,
            name: "Google",
            logo: "https://cdn-icons-png.flaticon.com/128/300/300221.png",
            slug: "google"
          },
          {
            id: 4,
            name: "OnePlus",
            logo: "https://cdn.worldvectorlogo.com/logos/oneplus-2.svg",
            slug: "oneplus"
          }
        ];

        const mockDeviceModels: DeviceModel[] = [
          {
            id: 1,
            name: "iPhone 13",
            brand_id: 1,
            device_type_id: 1,
            release_year: 2021,
            image_url: "https://example.com/iphone13.jpg",
            slug: "iphone-13"
          },
          {
            id: 2,
            name: "iPhone 14",
            brand_id: 1,
            device_type_id: 1,
            release_year: 2022,
            image_url: "https://example.com/iphone14.jpg",
            slug: "iphone-14"
          },
          {
            id: 3,
            name: "Galaxy S22",
            brand_id: 2,
            device_type_id: 1,
            release_year: 2022,
            image_url: "https://example.com/galaxys22.jpg",
            slug: "galaxy-s22"
          },
          {
            id: 4,
            name: "MacBook Pro",
            brand_id: 1,
            device_type_id: 2,
            release_year: 2021,
            image_url: "https://example.com/macbookpro.jpg",
            slug: "macbook-pro"
          }
        ];

        setDeviceTypes(mockDeviceTypes);
        setBrands(mockBrands);
        setDeviceModels(mockDeviceModels);
        setIsLoading(false);
      } catch (err) {
        setError("Failed to fetch device models data");
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