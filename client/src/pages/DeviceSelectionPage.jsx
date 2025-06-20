import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import DeviceIcon from '../components/ui/DeviceIcon';

const DeviceSelectionPage = () => {
  const { deviceType } = useParams();
  const navigate = useNavigate();
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState(null);

  useEffect(() => {
    fetchDeviceTypes();
    if (deviceType) {
      fetchBrands(deviceType);
    }
  }, [deviceType]);

  const handleDeviceSelect = (device) => {
    setSelectedDevice(device);
    navigate(`/sell/${device.slug}`);
  };

  const handleBrandSelect = (brand) => {
    navigate(`/sell/${deviceType}/${brand.slug}`);
  };

  const fetchDeviceTypes = async () => {
    try {
      const response = await fetch('/api/device-types');
      const data = await response.json();
      setDeviceTypes(data);
      
      if (deviceType) {
        const selected = data.find(dt => dt.slug === deviceType);
        setSelectedDevice(selected);
      }
    } catch (error) {
      console.error('Error fetching device types:', error);
    }
  };

  const fetchBrands = async (deviceTypeSlug) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/brands?deviceType=${deviceTypeSlug}`);
      const data = await response.json();
      setBrands(data);
    } catch (error) {
      console.error('Error fetching brands:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && deviceType) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!deviceType ? (
          // Device Type Selection
          <div>
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                What Type of Device Are You Selling?
              </h1>
              <p className="text-xl text-gray-600">
                Select your device category to get started
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {deviceTypes.map((device) => (
                <button
                  key={device.id}
                  onClick={() => handleDeviceSelect(device)}
                  className="group relative overflow-hidden rounded-xl bg-white border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 p-8 text-center"
                >
                  <DeviceIcon 
                    deviceType={device} 
                    size="md"
                    className="mx-auto mb-4 group-hover:scale-110 transition-transform"
                  />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{device.name}</h3>
                  <p className="text-gray-600">{device.description || `Get instant quotes for your ${device.name.toLowerCase()}`}</p>
                  <ArrowRight className="h-5 w-5 text-blue-600 mx-auto mt-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          // Brand Selection
          <div>
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Select Your {selectedDevice?.name} Brand
              </h1>
              <p className="text-xl text-gray-600">
                Choose the manufacturer of your device
              </p>
            </div>

            {brands.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {brands.map((brand) => (
                  <button
                    key={brand.id}
                    onClick={() => handleBrandSelect(brand)}
                    className="group bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 p-6 text-center"
                  >
                    {brand.logo ? (
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        className="w-12 h-12 mx-auto mb-3 object-contain"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-gray-500 font-semibold text-sm">
                          {brand.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      {brand.name}
                    </h3>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No brands available for this device type.</p>
              </div>
            )}

            <div className="text-center mt-8">
              <button
                onClick={() => navigate('/sell')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Back to Device Types
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeviceSelectionPage;