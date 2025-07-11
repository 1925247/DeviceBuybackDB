import React, { useState, useEffect } from 'react';
import { Search, Edit2, Save, X, Plus, Trash2, IndianRupee, Filter, Download, Upload } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AdminVariantPricing = () => {
  const [variants, setVariants] = useState([]);
  const [deviceModels, setDeviceModels] = useState([]);
  const [brands, setBrands] = useState([]);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingVariant, setEditingVariant] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    brandId: '',
    deviceTypeId: '',
    modelId: ''
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (filters.brandId || filters.deviceTypeId || filters.modelId || searchTerm) {
      fetchVariants();
    }
  }, [filters, searchTerm]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // Fetch all required data
      const [brandsRes, deviceTypesRes, modelsRes] = await Promise.all([
        fetch('/api/brands'),
        fetch('/api/device-types'),
        fetch('/api/device-models')
      ]);

      if (!brandsRes.ok || !deviceTypesRes.ok || !modelsRes.ok) {
        throw new Error('Failed to fetch initial data');
      }

      const [brandsData, deviceTypesData, modelsData] = await Promise.all([
        brandsRes.json(),
        deviceTypesRes.json(),
        modelsRes.json()
      ]);

      setBrands(brandsData || []);
      setDeviceTypes(deviceTypesData || []);
      setDeviceModels(modelsData || []);
      
      // Fetch all variants
      await fetchVariants();
    } catch (error) {
      console.error('Error fetching initial data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchVariants = async () => {
    try {
      // Build query params
      const params = new URLSearchParams();
      if (filters.brandId) params.append('brandId', filters.brandId);
      if (filters.deviceTypeId) params.append('deviceTypeId', filters.deviceTypeId);
      if (filters.modelId) params.append('modelId', filters.modelId);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/admin/variant-pricing?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch variants');
      }
      
      const data = await response.json();
      setVariants(data || []);
    } catch (error) {
      console.error('Error fetching variants:', error);
      setError(error.message);
    }
  };

  const handleEditVariant = (variant) => {
    setEditingVariant({
      ...variant,
      newBasePrice: variant.basePrice || 0,
      newCurrentPrice: variant.currentPrice || 0,
      newMarketValue: variant.marketValue || 0
    });
  };

  const handleSaveVariant = async () => {
    if (!editingVariant) return;

    try {
      const updateData = {
        basePrice: parseFloat(editingVariant.newBasePrice) || 0,
        currentPrice: parseFloat(editingVariant.newCurrentPrice) || 0,
        marketValue: parseFloat(editingVariant.newMarketValue) || 0
      };

      const response = await fetch(`/api/admin/variant-pricing/${editingVariant.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error('Failed to update variant pricing');
      }

      // Update local state
      setVariants(variants.map(v => 
        v.id === editingVariant.id 
          ? { ...v, ...updateData }
          : v
      ));

      setEditingVariant(null);
    } catch (error) {
      console.error('Error updating variant:', error);
      setError(error.message);
    }
  };

  const handleBulkPriceUpdate = async (percentage, operation) => {
    try {
      const response = await fetch('/api/admin/variant-pricing/bulk-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          percentage,
          operation, // 'increase' or 'decrease'
          filters
        })
      });

      if (!response.ok) {
        throw new Error('Failed to perform bulk update');
      }

      // Refresh data
      await fetchVariants();
    } catch (error) {
      console.error('Error in bulk update:', error);
      setError(error.message);
    }
  };

  const filteredVariants = variants.filter(variant => {
    const matchesSearch = searchTerm === '' || 
      variant.modelName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      variant.variantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      variant.brandName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVariants = filteredVariants.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredVariants.length / itemsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Variant Pricing Management</h1>
        <p className="text-gray-600">Manage pricing for device model variants</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Filters and Search */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search variants..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Device Type</label>
            <select
              value={filters.deviceTypeId}
              onChange={(e) => setFilters({...filters, deviceTypeId: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Device Types</option>
              {deviceTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
            <select
              value={filters.brandId}
              onChange={(e) => setFilters({...filters, brandId: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Brands</option>
              {brands.map(brand => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
            <select
              value={filters.modelId}
              onChange={(e) => setFilters({...filters, modelId: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Models</option>
              {deviceModels
                .filter(model => !filters.brandId || model.brandId === parseInt(filters.brandId))
                .filter(model => !filters.deviceTypeId || model.deviceTypeId === parseInt(filters.deviceTypeId))
                .map(model => (
                  <option key={model.id} value={model.id}>{model.name}</option>
                ))}
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="flex gap-2 pt-4 border-t border-gray-200">
          <button
            onClick={() => handleBulkPriceUpdate(10, 'increase')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
          >
            +10% Price
          </button>
          <button
            onClick={() => handleBulkPriceUpdate(10, 'decrease')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
          >
            -10% Price
          </button>
          <button
            onClick={() => handleBulkPriceUpdate(5, 'increase')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            +5% Price
          </button>
        </div>
      </div>

      {/* Variants Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Model & Variant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Specifications
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Base Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Market Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentVariants.map((variant) => (
                <tr key={variant.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {variant.modelName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {variant.variantName}
                      </div>
                      <div className="text-xs text-gray-400">
                        {variant.brandName}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {variant.storage && <div>Storage: {variant.storage}</div>}
                      {variant.ram && <div>RAM: {variant.ram}</div>}
                      {variant.color && <div>Color: {variant.color}</div>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingVariant?.id === variant.id ? (
                      <div className="flex items-center">
                        <IndianRupee className="h-4 w-4 text-gray-500 mr-1" />
                        <input
                          type="number"
                          value={editingVariant.newBasePrice}
                          onChange={(e) => setEditingVariant({
                            ...editingVariant,
                            newBasePrice: e.target.value
                          })}
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center text-sm font-medium text-gray-900">
                        <IndianRupee className="h-4 w-4 mr-1" />
                        {variant.basePrice?.toLocaleString('en-IN') || 0}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingVariant?.id === variant.id ? (
                      <div className="flex items-center">
                        <IndianRupee className="h-4 w-4 text-gray-500 mr-1" />
                        <input
                          type="number"
                          value={editingVariant.newCurrentPrice}
                          onChange={(e) => setEditingVariant({
                            ...editingVariant,
                            newCurrentPrice: e.target.value
                          })}
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center text-sm font-medium text-green-600">
                        <IndianRupee className="h-4 w-4 mr-1" />
                        {variant.currentPrice?.toLocaleString('en-IN') || 0}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingVariant?.id === variant.id ? (
                      <div className="flex items-center">
                        <IndianRupee className="h-4 w-4 text-gray-500 mr-1" />
                        <input
                          type="number"
                          value={editingVariant.newMarketValue}
                          onChange={(e) => setEditingVariant({
                            ...editingVariant,
                            newMarketValue: e.target.value
                          })}
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center text-sm text-gray-600">
                        <IndianRupee className="h-4 w-4 mr-1" />
                        {variant.marketValue?.toLocaleString('en-IN') || 0}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {editingVariant?.id === variant.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveVariant}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditingVariant(null)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEditVariant(variant)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredVariants.length)} of {filteredVariants.length} variants
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminVariantPricing;