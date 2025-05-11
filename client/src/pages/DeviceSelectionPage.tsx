import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useModels } from '../contexts/ModelsContext';

const DeviceSelectionPage: React.FC = () => {
  // Retrieve the deviceType parameter from the URL.
  const { deviceType: deviceTypeParam } = useParams<{ deviceType: string }>();
  
  // Get data from context
  const { deviceTypes, brands, isLoading, isError } = useModels();

  // Find the matching device type object using the slug.
  const deviceTypeObj = deviceTypes.find(dt => dt.slug === deviceTypeParam);

  // Show loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-medium">Loading device information...</h2>
        </div>
      </div>
    );
  }

  // Show error state
  if (isError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Error Loading Data</h2>
          <p className="mb-8">There was a problem loading the device information. Please try again later.</p>
          <Link 
            to="/" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition duration-300"
          >
            Go Back Home
          </Link>
        </div>
      </div>
    );
  }

  // If deviceType is missing or invalid, show an error message.
  if (!deviceTypeParam || !deviceTypeObj) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Device Type Not Found</h2>
          <p className="mb-8">Sorry, we couldn't find the device type you're looking for.</p>
          <Link 
            to="/" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition duration-300"
          >
            Go Back Home
          </Link>
        </div>
      </div>
    );
  }

  // For now, we'll display all brands as we don't have the device-type association yet in the database
  // Later, this can be filtered by device type when that relationship is established
  const filteredBrands = brands;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-2">Sell Your {deviceTypeObj.name}</h1>
      <p className="text-gray-600 mb-8">
        Select the brand of your {deviceTypeObj.name.toLowerCase()} to continue
      </p>

      {filteredBrands.length === 0 ? (
        <p className="text-center text-gray-600">
          No active brands available for {deviceTypeObj.name}. Please try another device type.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {filteredBrands.map(brand => (
            <Link 
              key={brand.id}
              to={`/sell/${deviceTypeParam}/${brand.slug}`}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition duration-300 flex flex-col items-center"
            >
              <div className="w-24 h-24 mb-4 overflow-hidden rounded-full bg-gray-100 flex items-center justify-center">
                <img 
                  src={brand.logo} 
                  alt={`${brand.name} logo`} 
                  className="w-16 h-16 object-contain"
                />
              </div>
              <h3 className="text-lg font-semibold text-center">{brand.name}</h3>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-12 bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">
          Why Sell Your {deviceTypeObj.name} With Us?
        </h2>
        <ul className="space-y-2">
          <li className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            <span>Best price guarantee for your {deviceTypeObj.name.toLowerCase()}</span>
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            <span>Free doorstep pickup at your convenience</span>
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            <span>Instant payment via your preferred method</span>
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            <span>Safe and secure data deletion</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default DeviceSelectionPage;
