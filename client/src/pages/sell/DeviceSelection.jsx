import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import DeviceIcon from '../../components/ui/DeviceIcon';

const DeviceSelection = () => {
  const navigate = useNavigate();
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeviceTypes();
  }, []);

  const fetchDeviceTypes = async () => {
    try {
      const response = await fetch('/api/device-types');
      const data = await response.json();
      setDeviceTypes(data.filter(dt => dt.active));
    } catch (error) {
      console.error('Error fetching device types:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceSelect = (device) => {
    navigate(`/sell/${device.slug}`);
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
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DeviceSelection;