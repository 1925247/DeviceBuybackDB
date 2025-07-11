import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Grid, List, Filter, Search, ArrowRight, Star, Calendar, IndianRupee } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const DeviceModelsPage = () => {
  const { deviceType, brand } = useParams();
  const navigate = useNavigate();
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
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
      const response = await fetch(`/api/device-models?deviceType=${deviceType}&brand=${brand}&includeDetails=true`);
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
      const response = await fetch(`/api/brands?slug=${brand}`);
      const data = await response.json();
      if (data.length > 0) {
        setBrandInfo(data[0]);
      }
    } catch (error) {
      console.error('Error fetching brand info:', error);
    }
  };

  const fetchDeviceTypeInfo = async () => {
    try {
      const response = await fetch(`/api/device-types?slug=${deviceType}`);
      const data = await response.json();
      if (data.length > 0) {
        setDeviceTypeInfo(data[0]);
      }
    } catch (error) {
      console.error('Error fetching device type info:', error);
    }
  };

  const filteredModels = models
    .filter(model => 
      model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.brandName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'basePrice') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleModelSelect = (model) => {
    const url = `/sell/${deviceType}/${brand}/${model.slug}/condition`;
    navigate(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <nav className="flex mb-4" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm text-gray-500">
              <li>
                <Link to="/sell" className="hover:text-gray-700">Sell Device</Link>
              </li>
              <li>
                <ArrowRight className="h-4 w-4" />
              </li>
              <li>
                <Link to={`/sell/${deviceType}`} className="hover:text-gray-700 capitalize">
                  {deviceTypeInfo?.name || deviceType}
                </Link>
              </li>
              <li>
                <ArrowRight className="h-4 w-4" />
              </li>
              <li className="text-gray-900 font-medium capitalize">
                {brandInfo?.name || brand}
              </li>
            </ol>
          </nav>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 capitalize">
                {brandInfo?.name || brand} {deviceTypeInfo?.name || deviceType}
              </h1>
              <p className="mt-2 text-gray-600">
                Choose your device model to get an instant quote
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">
                {filteredModels.length} models available
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search models..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Sort and View Controls */}
            <div className="flex items-center gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="name">Name</option>
                <option value="year">Year</option>
                <option value="basePrice">Price</option>
                <option value="priority">Priority</option>
              </select>

              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>

              <div className="flex border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-500'}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-500'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Models Grid/List */}
        {filteredModels.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              No models found for {brandInfo?.name || brand} {deviceTypeInfo?.name || deviceType}
            </div>
            <Link
              to="/sell"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Try Different Brand
            </Link>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
            {filteredModels.map((model) => (
              <div
                key={model.id}
                onClick={() => handleModelSelect(model)}
                className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200 hover:border-blue-300 ${
                  viewMode === 'list' ? 'flex items-center p-4' : 'p-6'
                }`}
              >
                {viewMode === 'grid' ? (
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
                      {model.image ? (
                        <img
                          src={model.image}
                          alt={model.name}
                          className="w-20 h-20 object-contain rounded-lg"
                        />
                      ) : (
                        <div className="text-gray-400 text-sm">No Image</div>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{model.name}</h3>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-2">
                      {model.year && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {model.year}
                        </span>
                      )}
                      {model.featured && (
                        <span className="flex items-center gap-1 text-yellow-600">
                          <Star className="h-3 w-3 fill-current" />
                          Featured
                        </span>
                      )}
                    </div>
                    
                    {/* Variants Display */}
                    {model.variants && model.variants.length > 0 ? (
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600 mb-2">Available variants:</div>
                        {model.variants.map((variant) => (
                          <button
                            key={variant.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleModelSelect(model, variant);
                            }}
                            className="w-full flex items-center justify-between p-2 text-sm border border-gray-200 rounded hover:border-blue-300 hover:bg-blue-50 transition-colors"
                          >
                            <span className="font-medium">{variant.storage}</span>
                            <span className="flex items-center gap-1 text-green-600 font-semibold">
                              <IndianRupee className="h-3 w-3" />
                              {variant.price.toLocaleString('en-IN')}
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : model.basePrice > 0 && (
                      <div className="flex items-center justify-center gap-1 text-green-600 font-semibold">
                        <IndianRupee className="h-4 w-4" />
                        {model.basePrice.toLocaleString('en-IN')}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        {model.image ? (
                          <img
                            src={model.image}
                            alt={model.name}
                            className="w-14 h-14 object-contain rounded-lg"
                          />
                        ) : (
                          <div className="text-gray-400 text-xs">No Image</div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{model.name}</h3>
                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                          {model.year && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {model.year}
                            </span>
                          )}
                          {model.featured && (
                            <span className="flex items-center gap-1 text-yellow-600">
                              <Star className="h-3 w-3 fill-current" />
                              Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {model.basePrice > 0 && (
                        <div className="flex items-center gap-1 text-green-600 font-semibold">
                          <IndianRupee className="h-4 w-4" />
                          {model.basePrice.toLocaleString('en-IN')}
                        </div>
                      )}
                      <ArrowRight className="h-4 w-4 text-gray-400 mt-1" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeviceModelsPage;