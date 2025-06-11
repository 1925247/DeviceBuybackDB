import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const ModelSelectionPage = () => {
  const { deviceType, brand } = useParams();
  const navigate = useNavigate();
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [brandInfo, setBrandInfo] = useState(null);
  const [deviceTypeInfo, setDeviceTypeInfo] = useState(null);

  useEffect(() => {
    fetchModels();
    fetchBrandInfo();
    fetchDeviceTypeInfo();
  }, [deviceType, brand]);

  const fetchModels = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/device-models?brand=${brand}&deviceType=${deviceType}`);
      const data = await response.json();
      setModels(data);
    } catch (error) {
      console.error('Error fetching models:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBrandInfo = async () => {
    try {
      const response = await fetch(`/api/brands`);
      const brands = await response.json();
      const foundBrand = brands.find(b => b.slug === brand);
      setBrandInfo(foundBrand);
    } catch (error) {
      console.error('Error fetching brand info:', error);
    }
  };

  const fetchDeviceTypeInfo = async () => {
    try {
      const response = await fetch(`/api/device-types`);
      const deviceTypes = await response.json();
      const foundDeviceType = deviceTypes.find(dt => dt.slug === deviceType);
      setDeviceTypeInfo(foundDeviceType);
    } catch (error) {
      console.error('Error fetching device type info:', error);
    }
  };

  const handleModelSelect = (model) => {
    navigate(`/sell/${deviceType}/${brand}/${model.slug}/condition`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Select Your {brandInfo?.name} {deviceTypeInfo?.name} Model
          </h1>
          <p className="text-xl text-gray-600">
            Choose the specific model you want to sell
          </p>
        </div>

        {models.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => handleModelSelect(model)}
                className="group bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 p-6 text-left"
              >
                {model.image_url ? (
                  <img
                    src={model.image_url}
                    alt={model.name}
                    className="w-full h-32 object-cover rounded-md mb-4"
                  />
                ) : (
                  <div className="w-full h-32 bg-gray-100 rounded-md flex items-center justify-center mb-4">
                    <span className="text-gray-400 text-sm">No Image</span>
                  </div>
                )}
                
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                  {model.name}
                </h3>
                
                {model.release_year && (
                  <p className="text-sm text-gray-500 mb-2">
                    Released: {model.release_year}
                  </p>
                )}
                
                {model.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {model.description}
                  </p>
                )}
                
                <div className="mt-4 flex items-center text-blue-600">
                  <span className="text-sm font-medium">Select Model →</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">
              No models available for {brandInfo?.name} {deviceTypeInfo?.name}.
            </p>
            <button
              onClick={() => navigate(`/sell/${deviceType}`)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Try a different brand
            </button>
          </div>
        )}

        <div className="text-center mt-8 space-x-4">
          <button
            onClick={() => navigate(`/sell/${deviceType}`)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Brands
          </button>
          <button
            onClick={() => navigate('/sell')}
            className="text-gray-500 hover:text-gray-700 font-medium"
          >
            Back to Device Types
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModelSelectionPage;