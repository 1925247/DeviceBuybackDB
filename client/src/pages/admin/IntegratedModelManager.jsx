import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Settings, Save, ChevronDown, ChevronRight, 
  MapPin, DollarSign, Target, Layers, AlertCircle, CheckCircle 
} from 'lucide-react';
import SEOHead from '../../components/SEOHead';

const IntegratedModelManager = () => {
  const [models, setModels] = useState([]);
  const [brands, setBrands] = useState([]);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [questionGroups, setQuestionGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState(null);
  const [expandedModels, setExpandedModels] = useState(new Set());
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [mappingData, setMappingData] = useState({});

  const [modelForm, setModelForm] = useState({
    name: '',
    slug: '',
    brandId: '',
    deviceTypeId: '',
    image: '',
    description: '',
    featured: false,
    active: true
  });

  const [variantForm, setVariantForm] = useState({
    name: '',
    basePrice: '',
    storage: '',
    color: '',
    condition: 'excellent'
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [modelsRes, brandsRes, typesRes, groupsRes] = await Promise.all([
        fetch('/api/device-models?includeDetails=true'),
        fetch('/api/brands'),
        fetch('/api/device-types'),
        fetch('/api/flexible-question-groups/stats')
      ]);

      if (modelsRes.ok) setModels(await modelsRes.json());
      if (brandsRes.ok) setBrands(await brandsRes.json());
      if (typesRes.ok) setDeviceTypes(await typesRes.json());
      if (groupsRes.ok) setQuestionGroups(await groupsRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateModel = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modelForm)
      });

      if (response.ok) {
        const newModel = await response.json();
        setModels(prev => [...prev, { ...newModel, variants: [] }]);
        setModelForm({
          name: '', slug: '', brandId: '', deviceTypeId: '', 
          image: '', description: '', featured: false, active: true
        });
        setSelectedModel(newModel.id);
        setExpandedModels(prev => new Set([...prev, newModel.id]));
      }
    } catch (error) {
      console.error('Error creating model:', error);
    }
  };

  const handleAddVariant = async (modelId) => {
    try {
      const response = await fetch(`/api/admin/models/${modelId}/variants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(variantForm)
      });

      if (response.ok) {
        const newVariant = await response.json();
        setModels(prev => prev.map(model => 
          model.id === modelId 
            ? { ...model, variants: [...(model.variants || []), newVariant] }
            : model
        ));
        setVariantForm({
          name: '', basePrice: '', storage: '', color: '', condition: 'excellent'
        });
      }
    } catch (error) {
      console.error('Error adding variant:', error);
    }
  };

  const openMappingModal = (variant, modelId) => {
    setSelectedVariant({ ...variant, modelId });
    setShowMappingModal(true);
    // Load existing mappings for this variant
    fetchVariantMappings(variant.id);
  };

  const fetchVariantMappings = async (variantId) => {
    try {
      const response = await fetch(`/api/admin/variants/${variantId}/mappings`);
      if (response.ok) {
        const mappings = await response.json();
        setMappingData(mappings);
      }
    } catch (error) {
      console.error('Error fetching mappings:', error);
    }
  };

  const handleSaveMappings = async () => {
    try {
      const response = await fetch(`/api/admin/variants/${selectedVariant.id}/map-questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mappingData)
      });

      if (response.ok) {
        setShowMappingModal(false);
        setMappingData({});
        // Refresh the models list to show updated mapping status
        fetchInitialData();
      }
    } catch (error) {
      console.error('Error saving mappings:', error);
    }
  };

  const toggleModelExpansion = (modelId) => {
    setExpandedModels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(modelId)) {
        newSet.delete(modelId);
      } else {
        newSet.add(modelId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <SEOHead 
        title="Integrated Model Manager - Admin Panel"
        description="Manage device models, variants, and question mappings in one integrated workflow"
      />
      
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Integrated Model & Variant Manager
          </h1>
          <p className="text-gray-600">
            Complete workflow: Add Model → Configure Variants → Map Questions → Set Pricing
          </p>
        </div>

        {/* Add New Model Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Step 1: Add New Model</h2>
          
          <form onSubmit={handleCreateModel} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model Name</label>
              <input
                type="text"
                value={modelForm.name}
                onChange={(e) => setModelForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="iPhone 15 Pro"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <select
                value={modelForm.brandId}
                onChange={(e) => setModelForm(prev => ({ ...prev, brandId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Brand</option>
                {brands.map(brand => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Device Type</label>
              <select
                value={modelForm.deviceTypeId}
                onChange={(e) => setModelForm(prev => ({ ...prev, deviceTypeId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Type</option>
                {deviceTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Model
              </button>
            </div>
          </form>
        </div>

        {/* Models List with Variants */}
        <div className="space-y-4">
          {models.map(model => (
            <div key={model.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Model Header */}
              <div 
                className="p-4 cursor-pointer flex items-center justify-between hover:bg-gray-50"
                onClick={() => toggleModelExpansion(model.id)}
              >
                <div className="flex items-center space-x-3">
                  {expandedModels.has(model.id) ? 
                    <ChevronDown className="h-5 w-5 text-gray-400" /> : 
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  }
                  <div>
                    <h3 className="font-semibold text-gray-900">{model.name}</h3>
                    <p className="text-sm text-gray-500">
                      {model.brandName} • {model.deviceTypeName} • 
                      {model.variants?.length || 0} variants
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    model.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {model.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Expandable Variants Section */}
              {expandedModels.has(model.id) && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <h4 className="font-medium text-gray-900 mb-4">Step 2: Variants & Pricing</h4>
                  
                  {/* Add Variant Form */}
                  <div className="bg-white rounded-md p-4 mb-4 border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                      <input
                        type="text"
                        placeholder="Variant name (e.g., 128GB)"
                        value={variantForm.name}
                        onChange={(e) => setVariantForm(prev => ({ ...prev, name: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        placeholder="Base Price (₹)"
                        value={variantForm.basePrice}
                        onChange={(e) => setVariantForm(prev => ({ ...prev, basePrice: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Storage/RAM"
                        value={variantForm.storage}
                        onChange={(e) => setVariantForm(prev => ({ ...prev, storage: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => handleAddVariant(model.id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Variant
                      </button>
                    </div>
                  </div>

                  {/* Variants Table */}
                  <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Variant Name</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Base Price</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Storage</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Questions Mapped</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {(model.variants || []).map(variant => (
                          <tr key={variant.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">{variant.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">₹{variant.basePrice?.toLocaleString()}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{variant.storage || '-'}</td>
                            <td className="px-4 py-3 text-sm">
                              {variant.mappedGroups ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  {variant.mappedGroups} groups
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Not mapped
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => openMappingModal(variant, model.id)}
                                className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 transition-colors flex items-center gap-1"
                              >
                                <MapPin className="h-3 w-3" />
                                Map Questions
                              </button>
                            </td>
                          </tr>
                        ))}
                        {(!model.variants || model.variants.length === 0) && (
                          <tr>
                            <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                              No variants added yet. Add your first variant above.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Question Mapping Modal */}
        {showMappingModal && selectedVariant && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Map Questions - {selectedVariant.name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Select question groups and configure deduction rates for this variant
                </p>
              </div>

              <div className="p-6 space-y-6">
                {questionGroups.map(group => (
                  <div key={group.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id={`group-${group.id}`}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          onChange={(e) => {
                            setMappingData(prev => ({
                              ...prev,
                              [`group-${group.id}`]: e.target.checked
                            }));
                          }}
                        />
                        <label htmlFor={`group-${group.id}`} className="font-medium text-gray-900">
                          {group.name}
                        </label>
                      </div>
                      <span className="text-sm text-gray-500">
                        {group.questionCount} questions
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{group.description}</p>
                    
                    {/* Question details would be loaded here */}
                    <div className="text-xs text-gray-500">
                      Questions and deduction rates can be configured after selecting this group
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowMappingModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveMappings}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Mappings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntegratedModelManager;