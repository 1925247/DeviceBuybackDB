import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, Laptop, Watch, Tablet } from 'lucide-react';

const DeviceSelection = () => {
  const navigate = useNavigate();

  const deviceTypes = [
    { id: 1, name: 'Smartphones', icon: Smartphone, path: '/sell/smartphone', color: 'bg-blue-500' },
    { id: 2, name: 'Laptops', icon: Laptop, path: '/sell/laptop', color: 'bg-green-500' },
    { id: 3, name: 'Tablets', icon: Tablet, path: '/sell/tablet', color: 'bg-purple-500' },
    { id: 4, name: 'Smartwatches', icon: Watch, path: '/sell/smartwatch', color: 'bg-orange-500' }
  ];

  const handleDeviceSelect = (path) => {
    navigate(path);
  };

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
          {deviceTypes.map((device) => {
            const IconComponent = device.icon;
            return (
              <button
                key={device.id}
                onClick={() => handleDeviceSelect(device.path)}
                className="group relative overflow-hidden rounded-xl bg-white border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 p-8 text-center"
              >
                <div className={`${device.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <IconComponent className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{device.name}</h3>
                <p className="text-gray-600">Get instant quotes for your {device.name.toLowerCase()}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DeviceSelection;