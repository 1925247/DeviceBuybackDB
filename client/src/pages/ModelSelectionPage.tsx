import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { deviceTypes } from '/home/project/src/db/devicetype.ts';
import { brands } from '/home/project/src/db/brands.ts';
import { deviceModels } from '/home/project/src/db/models.ts';

const ModelSelectionPage: React.FC = () => {
  const { deviceType: deviceTypeParam, brand: brandParam } = useParams<{ deviceType: string; brand: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const [selectedModel, setSelectedModel] = useState<any>(null);

  const handleModelClick = (model: any) => {
    setSelectedModel(model);
  };

  const handleVariantSelect = (variant: string) => {
    if (selectedModel) {
      navigate(
        `/sell/${deviceTypeParam}/${brandParam}/${selectedModel.slug}/condition?variant=${variant}`
      );
    }
  };

  const deviceTypeObj = deviceTypes.find(dt => dt.slug === deviceTypeParam);
  const brandObj = brands.find(b => b.slug === brandParam);

  if (!deviceTypeParam || !brandParam || !deviceTypeObj || !brandObj) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Brand Not Found</h2>
          <p className="mb-8">Sorry, we couldn't find the brand you're looking for.</p>
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

  // Filter models that match device type, brand, and are active
  const models = deviceModels.filter(
    model =>
      model.deviceType === deviceTypeParam &&
      model.brand.toLowerCase() === brandParam.toLowerCase() &&
      model.active // only active models
  );

  // Apply search term filter
  const filteredModels = models.filter(model =>
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
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition duration-300 cursor-pointer"
              onClick={() => handleModelClick(model)}
            >
              <div className="w-full h-40 mb-4 overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
                <img
                  src={model.image}
                  alt={model.name}
                  onError={e => {
                    e.currentTarget.src = '/default-image.png';
                  }}
                  className="w-full h-full object-contain p-2"
                />
              </div>
              <h3 className="text-lg font-semibold text-center mb-2">{model.name}</h3>

              {selectedModel?.id === model.id && model.variants && (
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {model.variants.map((variant: string) => (
                    <button
                      key={variant}
                      onClick={e => {
                        e.stopPropagation();
                        handleVariantSelect(variant);
                      }}
                      className="border px-3 py-1 rounded-full text-sm hover:bg-blue-100"
                    >
                      {variant}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No models found matching "{searchTerm}"</p>
          <button onClick={() => setSearchTerm('')} className="text-blue-600 hover:text-blue-800">
            Clear search
          </button>
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
