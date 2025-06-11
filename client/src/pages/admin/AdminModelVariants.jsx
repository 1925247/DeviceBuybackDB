import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, Package, DollarSign } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AdminModelVariants = () => {
  const [models, setModels] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState('');
  
  const [variantForm, setVariantForm] = useState({
    variantName: '',
    storage: '',
    color: '',
    ram: '',
    processor: '',
    displaySize: '',
    basePrice: '',
    currentPrice: '',
    marketValue: '',
    sku: '',
    specifications: {},
    images: [],
    availability: true
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedModel) {
      fetchVariants(selectedModel.id);
    }
  }, [selectedModel]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [modelsRes, brandsRes] = await Promise.all([
        fetch('/api/device-models'),
        fetch('/api/brands')
      ]);

      if (modelsRes.ok && brandsRes.ok) {
        const [modelsData, brandsData] = await Promise.all([
          modelsRes.json(),
          brandsRes.json()
        ]);
        setModels(modelsData);
        setBrands(brandsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVariants = async (modelId) => {
    try {
      const response = await fetch(`/api/device-models/${modelId}/variants`);
      if (response.ok) {
        const data = await response.json();
        setVariants(data);
      }
    } catch (error) {
      console.error('Error fetching variants:', error);
    }
  };

  const handleModelSelect = (model) => {
    setSelectedModel(model);
    setVariants([]);
  };

  const handleVariantSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingVariant 
        ? `/api/device-model-variants/${editingVariant.id}`
        : `/api/device-models/${selectedModel.id}/variants`;
      
      const method = editingVariant ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...variantForm,
          basePrice: parseFloat(variantForm.basePrice),
          currentPrice: parseFloat(variantForm.currentPrice),
          marketValue: parseFloat(variantForm.marketValue) || null
        })
      });

      if (response.ok) {
        await fetchVariants(selectedModel.id);
        setVariantModalOpen(false);
        resetVariantForm();
      }
    } catch (error) {
      console.error('Error saving variant:', error);
    }
  };

  const resetVariantForm = () => {
    setVariantForm({
      variantName: '',
      storage: '',
      color: '',
      ram: '',
      processor: '',
      displaySize: '',
      basePrice: '',
      currentPrice: '',
      marketValue: '',
      sku: '',
      specifications: {},
      images: [],
      availability: true
    });
    setEditingVariant(null);
  };

  const openVariantModal = (variant = null) => {
    if (variant) {
      setVariantForm(variant);
      setEditingVariant(variant);
    } else {
      resetVariantForm();
    }
    setVariantModalOpen(true);
  };

  const filteredModels = selectedBrand 
    ? models.filter(model => model.brandId === parseInt(selectedBrand))
    : models;

  const getModelsByBrand = () => {
    const modelsByBrand = {};
    brands.forEach(brand => {
      modelsByBrand[brand.name] = models.filter(model => model.brandId === brand.id);
    });
    return modelsByBrand;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Device Model Variants</h1>
        <p className="text-gray-600 mt-2">Manage variants for different device models with pricing and specifications</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Brand and Model Selection */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Select Model</h2>
            
            {/* Brand Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Brand</label>
              <select 
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Brands</option>
                {brands.map(brand => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </select>
            </div>

            {/* Brand-wise Model Display */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {Object.entries(getModelsByBrand()).map(([brandName, brandModels]) => (
                brandModels.length > 0 && (
                  <div key={brandName}>
                    <h3 className="font-medium text-gray-900 mb-2">{brandName}</h3>
                    <div className="space-y-2 ml-4">
                      {brandModels
                        .filter(model => !selectedBrand || model.brandId === parseInt(selectedBrand))
                        .map(model => (
                        <button
                          key={model.id}
                          onClick={() => handleModelSelect(model)}
                          className={`w-full text-left p-3 rounded-md border transition-colors ${
                            selectedModel?.id === model.id
                              ? 'border-blue-500 bg-blue-50 text-blue-900'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="font-medium">{model.name}</div>
                          <div className="text-sm text-gray-500">{model.slug}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>

        {/* Variants Management */}
        <div className="lg:col-span-2">
          {selectedModel ? (
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-semibold">{selectedModel.name} Variants</h2>
                    <p className="text-sm text-gray-500">Manage different configurations and pricing</p>
                  </div>
                  <button
                    onClick={() => openVariantModal()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Variant
                  </button>
                </div>
              </div>

              <div className="p-6">
                {variants.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {variants.map(variant => (
                      <div key={variant.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-medium text-gray-900">{variant.variantName}</h3>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openVariantModal(variant)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex justify-between">
                            <span>Storage:</span>
                            <span className="font-medium">{variant.storage}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Color:</span>
                            <span className="font-medium">{variant.color}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>RAM:</span>
                            <span className="font-medium">{variant.ram}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Current Price:</span>
                            <span className="font-medium text-green-600">${variant.currentPrice}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Market Value:</span>
                            <span className="font-medium">${variant.marketValue || 'N/A'}</span>
                          </div>
                        </div>
                        
                        <div className="mt-3 flex items-center justify-between">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            variant.availability 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {variant.availability ? 'Available' : 'Unavailable'}
                          </span>
                          <span className="text-xs text-gray-500">SKU: {variant.sku}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No variants found for this model</p>
                    <button
                      onClick={() => openVariantModal()}
                      className="mt-4 text-blue-600 hover:text-blue-800"
                    >
                      Create first variant
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Model</h3>
              <p className="text-gray-500">Choose a device model from the left to manage its variants</p>
            </div>
          )}
        </div>
      </div>

      {/* Variant Form Modal */}
      {variantModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingVariant ? 'Edit Variant' : 'Add New Variant'}
              </h2>
              <button
                onClick={() => setVariantModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleVariantSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Variant Name</label>
                  <input
                    type="text"
                    value={variantForm.variantName}
                    onChange={(e) => setVariantForm({...variantForm, variantName: e.target.value})}
                    placeholder="e.g., 256GB Space Black"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Storage</label>
                  <input
                    type="text"
                    value={variantForm.storage}
                    onChange={(e) => setVariantForm({...variantForm, storage: e.target.value})}
                    placeholder="e.g., 256GB"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <input
                    type="text"
                    value={variantForm.color}
                    onChange={(e) => setVariantForm({...variantForm, color: e.target.value})}
                    placeholder="e.g., Space Black"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">RAM</label>
                  <input
                    type="text"
                    value={variantForm.ram}
                    onChange={(e) => setVariantForm({...variantForm, ram: e.target.value})}
                    placeholder="e.g., 8GB"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Processor</label>
                  <input
                    type="text"
                    value={variantForm.processor}
                    onChange={(e) => setVariantForm({...variantForm, processor: e.target.value})}
                    placeholder="e.g., A17 Pro"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Size</label>
                  <input
                    type="text"
                    value={variantForm.displaySize}
                    onChange={(e) => setVariantForm({...variantForm, displaySize: e.target.value})}
                    placeholder="e.g., 6.1 inch"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Base Price ($)</label>
                  <input
                    type="number"
                    value={variantForm.basePrice}
                    onChange={(e) => setVariantForm({...variantForm, basePrice: e.target.value})}
                    placeholder="999"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Price ($)</label>
                  <input
                    type="number"
                    value={variantForm.currentPrice}
                    onChange={(e) => setVariantForm({...variantForm, currentPrice: e.target.value})}
                    placeholder="850"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Market Value ($)</label>
                  <input
                    type="number"
                    value={variantForm.marketValue}
                    onChange={(e) => setVariantForm({...variantForm, marketValue: e.target.value})}
                    placeholder="750"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <input
                    type="text"
                    value={variantForm.sku}
                    onChange={(e) => setVariantForm({...variantForm, sku: e.target.value})}
                    placeholder="IPH15P-256-SB"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="availability"
                  checked={variantForm.availability}
                  onChange={(e) => setVariantForm({...variantForm, availability: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="availability" className="text-sm text-gray-700">Available for purchase</label>
              </div>
              
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingVariant ? 'Update Variant' : 'Create Variant'}
                </button>
                <button
                  type="button"
                  onClick={() => setVariantModalOpen(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminModelVariants;