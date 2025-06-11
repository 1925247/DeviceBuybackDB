import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Smartphone, Laptop, Tablet, Watch, Filter, Star, ChevronRight } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const DeviceListing = () => {
  const [selectedCategory, setSelectedCategory] = useState('smartphones');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState(null);
  const [variants, setVariants] = useState([]);
  
  // Fetch device types
  const { data: deviceTypes = [], isLoading: loadingTypes } = useQuery({
    queryKey: ['/api/device-types'],
    enabled: true
  });

  // Fetch brands
  const { data: brands = [], isLoading: loadingBrands } = useQuery({
    queryKey: ['/api/brands'],
    enabled: true
  });

  // Fetch models based on category and brand
  const { data: models = [], isLoading: loadingModels } = useQuery({
    queryKey: ['/api/device-models', selectedCategory, selectedBrand],
    queryFn: async () => {
      let url = '/api/device-models';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch models');
      const allModels = await response.json();
      
      // Filter by category and brand
      const deviceType = deviceTypes.find(dt => dt.slug === selectedCategory);
      let filteredModels = allModels;
      
      if (deviceType) {
        filteredModels = allModels.filter(model => model.device_type_id === deviceType.id);
      }
      
      if (selectedBrand) {
        filteredModels = filteredModels.filter(model => model.brand_id === parseInt(selectedBrand));
      }
      
      return filteredModels;
    },
    enabled: !!deviceTypes.length
  });

  // Fetch variants for selected model
  useEffect(() => {
    if (selectedModel) {
      fetchVariants(selectedModel.id);
    }
  }, [selectedModel]);

  const fetchVariants = async (modelId) => {
    try {
      const response = await fetch(`/api/device-models/${modelId}/variants`);
      if (response.ok) {
        const data = await response.json();
        setVariants(data);
      }
    } catch (error) {
      console.error('Error fetching variants:', error);
      setVariants([]);
    }
  };

  const getCategoryIcon = (slug) => {
    switch (slug) {
      case 'smartphones': return Smartphone;
      case 'laptops': return Laptop;
      case 'tablets': case 'tablet': return Tablet;
      case 'watchs': case 'watches': return Watch;
      default: return Smartphone;
    }
  };

  const getBrandForModel = (brandId) => {
    return brands.find(brand => brand.id === brandId);
  };

  const activeDeviceTypes = deviceTypes.filter(dt => dt.active);
  const activeBrands = brands.filter(b => b.active);

  if (loadingTypes || loadingBrands) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Sell Your Device</h1>
          <p className="text-gray-600 mt-2">Choose your device category and get an instant quote</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Category Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Device Categories</h2>
              <div className="space-y-2">
                {activeDeviceTypes.map(type => {
                  const IconComponent = getCategoryIcon(type.slug);
                  return (
                    <button
                      key={type.id}
                      onClick={() => {
                        setSelectedCategory(type.slug);
                        setSelectedModel(null);
                        setVariants([]);
                      }}
                      className={`w-full flex items-center p-3 rounded-md border transition-colors ${
                        selectedCategory === type.slug
                          ? 'border-blue-500 bg-blue-50 text-blue-900'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <IconComponent className="h-5 w-5 mr-3" />
                      <span className="font-medium">{type.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Brand Filter */}
              <div className="mt-6">
                <h3 className="text-md font-medium mb-3">Filter by Brand</h3>
                <select
                  value={selectedBrand}
                  onChange={(e) => {
                    setSelectedBrand(e.target.value);
                    setSelectedModel(null);
                    setVariants([]);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Brands</option>
                  {activeBrands.map(brand => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Models Grid */}
          <div className="lg:col-span-3">
            {loadingModels ? (
              <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="large" />
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Selected Category Header */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    {React.createElement(getCategoryIcon(selectedCategory), { className: "h-6 w-6 mr-3 text-blue-600" })}
                    <h2 className="text-xl font-semibold">
                      {deviceTypes.find(dt => dt.slug === selectedCategory)?.name || 'Devices'}
                    </h2>
                    <span className="ml-3 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
                      {models.length} models
                    </span>
                  </div>
                </div>

                {/* Models List */}
                {models.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {models.map(model => {
                      const brand = getBrandForModel(model.brand_id);
                      return (
                        <div 
                          key={model.id} 
                          className={`bg-white rounded-lg shadow-sm border cursor-pointer transition-all hover:shadow-md ${
                            selectedModel?.id === model.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                          }`}
                          onClick={() => setSelectedModel(model)}
                        >
                          <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center">
                                {brand?.logo && (
                                  <img 
                                    src={brand.logo} 
                                    alt={brand.name}
                                    className="h-8 w-8 mr-3 object-contain"
                                  />
                                )}
                                <div>
                                  <h3 className="font-semibold text-gray-900">{model.name}</h3>
                                  <p className="text-sm text-gray-500">{brand?.name}</p>
                                </div>
                              </div>
                              {model.featured && (
                                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                              )}
                            </div>
                            
                            {model.image && (
                              <img 
                                src={model.image} 
                                alt={model.name}
                                className="w-full h-32 object-contain mb-4"
                              />
                            )}
                            
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-green-600">
                                Starting from ₹{model.base_price ? Math.round(model.base_price * 83).toLocaleString('en-IN') : 'TBD'}
                              </span>
                              <ChevronRight className="h-5 w-5 text-gray-400" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                    <div className="text-gray-400 mb-4">
                      {React.createElement(getCategoryIcon(selectedCategory), { className: "h-12 w-12 mx-auto" })}
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No models found</h3>
                    <p className="text-gray-500">
                      {selectedBrand 
                        ? `No ${deviceTypes.find(dt => dt.slug === selectedCategory)?.name.toLowerCase()} models found for the selected brand.`
                        : `No ${deviceTypes.find(dt => dt.slug === selectedCategory)?.name.toLowerCase()} models available yet.`
                      }
                    </p>
                  </div>
                )}

                {/* Variants Display */}
                {selectedModel && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold mb-4">
                      {selectedModel.name} - Available Variants
                    </h3>
                    
                    {variants.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {variants.map(variant => (
                          <div key={variant.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="font-medium text-gray-900">{variant.variant_name}</h4>
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                variant.availability 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {variant.availability ? 'Available' : 'Out of Stock'}
                              </span>
                            </div>
                            
                            <div className="space-y-2 text-sm text-gray-600 mb-4">
                              {variant.storage && (
                                <div className="flex justify-between">
                                  <span>Storage:</span>
                                  <span className="font-medium">{variant.storage}</span>
                                </div>
                              )}
                              {variant.ram && (
                                <div className="flex justify-between">
                                  <span>RAM:</span>
                                  <span className="font-medium">{variant.ram}</span>
                                </div>
                              )}
                              {variant.color && (
                                <div className="flex justify-between">
                                  <span>Color:</span>
                                  <span className="font-medium">{variant.color}</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="border-t pt-3">
                              <div className="flex justify-between items-center">
                                <span className="text-lg font-bold text-green-600">
                                  ₹{Math.round(variant.current_price * 83).toLocaleString('en-IN')}
                                </span>
                                <button 
                                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                                  disabled={!variant.availability}
                                >
                                  Get Quote
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No variants available for this model yet.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceListing;