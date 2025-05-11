import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { Loader2 } from 'lucide-react';

// Define interface for models
interface DeviceModel {
  id: number;
  name: string;
  slug: string;
  brand_id: number;
  device_type_id: number;
  image: string;
  active: boolean;
  featured: boolean;
  variants: string[];
  brand?: {
    id: number;
    name: string;
    slug: string;
    logo: string;
  };
  deviceType?: {
    id: number;
    name: string;
    slug: string;
    icon: string;
  };
}

interface DeviceType {
  id: number;
  name: string;
  slug: string;
  icon: string;
}

interface Brand {
  id: number;
  name: string;
  slug: string;
  logo: string;
}

const ModelSelectionPage: React.FC = () => {
  const { deviceType: deviceTypeParam, brand: brandParam } = useParams<{ deviceType: string; brand: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [deviceModels, setDeviceModels] = useState<DeviceModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<DeviceModel | null>(null);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch device types, brands, and models in parallel
        const [deviceTypesResponse, brandsResponse, modelsResponse] = await Promise.all([
          fetch('/api/device-types'),
          fetch('/api/brands'),
          fetch('/api/device-models')
        ]);
        
        if (!deviceTypesResponse.ok) throw new Error('Failed to fetch device types');
        if (!brandsResponse.ok) throw new Error('Failed to fetch brands');
        if (!modelsResponse.ok) throw new Error('Failed to fetch device models');
        
        const deviceTypesData = await deviceTypesResponse.json();
        const brandsData = await brandsResponse.json();
        const modelsData = await modelsResponse.json();
        
        setDeviceTypes(deviceTypesData);
        setBrands(brandsData);
        setDeviceModels(modelsData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleModelClick = (model: DeviceModel) => {
    setSelectedModel(model);
  };

  const handleVariantSelect = (variant: string) => {
    if (selectedModel) {
      navigate(
        `/sell/${deviceTypeParam}/${brandParam}/${selectedModel.slug}/condition?variant=${variant}`
      );
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-medium">Loading device models...</h2>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center bg-red-50 p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Error Loading Data</h2>
          <p className="mb-4 text-red-700">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  // Find the device type and brand objects
  const deviceTypeObj = deviceTypes.find(dt => dt.slug === deviceTypeParam);
  const brandObj = brands.find(b => b.slug === brandParam);

  // Return error UI if the device type or brand is not found
  if (!deviceTypeParam || !brandParam || !deviceTypeObj || !brandObj) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Brand or Device Type Not Found</h2>
          <p className="mb-8">Sorry, we couldn't find the brand or device type you're looking for.</p>
          <Link
            to="/sell/device-selection"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition duration-300"
          >
            Go Back to Device Selection
          </Link>
        </div>
      </div>
    );
  }

  // Filter models that match the device type and brand
  const filteredModelsByType = deviceModels.filter(model => {
    const matchesDeviceType = model.deviceType?.slug === deviceTypeParam || 
                             (model.device_type_id === deviceTypeObj.id);
    const matchesBrand = model.brand?.slug === brandParam || 
                         (model.brand_id === brandObj.id);
    const isActive = model.active !== false; // Default to true if not specified
    
    return matchesDeviceType && matchesBrand && isActive;
  });
  
  console.log('Device Type ID:', deviceTypeObj.id);
  console.log('Brand ID:', brandObj.id);
  console.log('Filtered Models:', filteredModelsByType);

  // Apply search term filter
  const filteredModels = filteredModelsByType.filter(model =>
    model.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Link
          to={`/sell/${deviceTypeParam}`}
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to {deviceTypeObj.name} Brands
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-2">
        Sell Your {brandObj.name} {deviceTypeObj.name}
      </h1>
      <p className="text-gray-600 mb-8">
        Select your {brandObj.name} {deviceTypeObj.name.toLowerCase()} model to get a price estimate
      </p>

      <div className="mb-8 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder={`Search ${brandObj.name} models...`}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredModels.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {filteredModels.map(model => (
            <div
              key={model.id}
              className={`bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition duration-300 cursor-pointer ${
                selectedModel?.id === model.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => handleModelClick(model)}
            >
              <div className="w-full h-40 mb-4 overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
                <img
                  src={model.image}
                  alt={model.name}
                  onError={e => {
                    const imgElement = e.currentTarget;
                    imgElement.src = 'https://placehold.co/300x200?text=' + encodeURIComponent(model.name);
                    imgElement.onerror = null; // Prevent infinite loop
                  }}
                  className="w-full h-full object-contain p-2"
                />
              </div>
              <h3 className="text-lg font-semibold text-center mb-2">{model.name}</h3>
              
              {model.featured && (
                <div className="flex justify-center mb-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Featured
                  </span>
                </div>
              )}

              {selectedModel?.id === model.id && model.variants && model.variants.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  <p className="w-full text-center text-sm text-gray-500 mb-2">Select storage option:</p>
                  {model.variants.map((variant) => (
                    <button
                      key={variant}
                      onClick={e => {
                        e.stopPropagation();
                        handleVariantSelect(variant);
                      }}
                      className="border border-gray-300 px-3 py-1 rounded-full text-sm hover:bg-blue-100 hover:border-blue-300 transition duration-200"
                    >
                      {variant}
                    </button>
                  ))}
                </div>
              )}
              
              {selectedModel?.id === model.id && (!model.variants || model.variants.length === 0) && (
                <div className="mt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/sell/${deviceTypeParam}/${brandParam}/${model.slug}/condition`);
                    }}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
                  >
                    Continue
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">No {brandObj.name} {deviceTypeObj.name.toLowerCase()} models found{searchTerm ? ` matching "${searchTerm}"` : ''}.</p>
          {searchTerm ? (
            <button onClick={() => setSearchTerm('')} className="text-blue-600 hover:text-blue-800">
              Clear search
            </button>
          ) : (
            <p className="text-sm text-gray-500">
              Try selecting a different brand or contact support if you need assistance.
            </p>
          )}
        </div>
      )}

      <div className="mt-12 bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Can't find your model?</h2>
        <p className="text-gray-600 mb-4">
          If you can't find your specific {brandObj.name} {deviceTypeObj.name.toLowerCase()} model, please contact our customer support. We're constantly updating our database with new models.
        </p>
        <Link to="/contact" className="text-blue-600 hover:text-blue-800 font-medium">
          Contact Support
        </Link>
      </div>
    </div>
  );
};

export default ModelSelectionPage;
