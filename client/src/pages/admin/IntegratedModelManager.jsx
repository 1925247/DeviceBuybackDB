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

  const [editingVariant, setEditingVariant] = useState(null);
  const [editingPrice, setEditingPrice] = useState('');

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
        body: JSON.stringify({
          name: variantForm.name,
          basePrice: parseFloat(variantForm.basePrice),
          storage: variantForm.storage,
          color: variantForm.color,
          condition: variantForm.condition
        })
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
        alert('Variant added successfully! Price will be displayed on frontend.');
      } else {
        throw new Error('Failed to create variant');
      }
    } catch (error) {
      console.error('Error adding variant:', error);
      alert('Error adding variant. Please try again.');
    }
  };

  const handleUpdateVariant = async (variantId, updatedData) => {
    try {
      const response = await fetch(`/api/admin/variants/${variantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });

      if (response.ok) {
        // Refresh the models list to show updated prices
        fetchInitialData();
        alert('Variant pricing updated! Changes will be reflected on frontend.');
      } else {
        throw new Error('Failed to update variant');
      }
    } catch (error) {
      console.error('Error updating variant:', error);
      alert('Error updating variant pricing. Please try again.');
    }
  };

  const handleDeleteVariant = async (variantId) => {
    try {
      const response = await fetch(`/api/admin/variants/${variantId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Refresh the models list
        fetchInitialData();
        alert('Variant deleted successfully!');
      } else {
        throw new Error('Failed to delete variant');
      }
    } catch (error) {
      console.error('Error deleting variant:', error);
      alert('Error deleting variant. Please try again.');
    }
  };

  const startPriceEdit = (variant) => {
    setEditingVariant(variant.id);
    setEditingPrice(variant.base_price || variant.basePrice || variant.currentPrice || variant.current_price || '');
  };

  const cancelPriceEdit = () => {
    setEditingVariant(null);
    setEditingPrice('');
  };

  const savePriceEdit = async (variantId) => {
    if (!editingPrice || isNaN(editingPrice) || parseFloat(editingPrice) <= 0) {
      alert('Please enter a valid price greater than 0');
      return;
    }

    try {
      const response = await fetch(`/api/admin/variants/${variantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          base_price: parseFloat(editingPrice),
          current_price: parseFloat(editingPrice)
        })
      });

      if (response.ok) {
        // Update the local state immediately for better UX
        setModels(prev => prev.map(model => ({
          ...model,
          variants: model.variants?.map(v => 
            v.id === variantId 
              ? { ...v, base_price: parseFloat(editingPrice), basePrice: parseFloat(editingPrice) }
              : v
          ) || []
        })));
        
        setEditingVariant(null);
        setEditingPrice('');
        alert('Frontend price updated successfully! Changes are now live on your website.');
      } else {
        throw new Error('Failed to update price');
      }
    } catch (error) {
      console.error('Error updating price:', error);
      alert('Error updating price. Please try again.');
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
                  <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 mb-4 border-2 border-dashed border-blue-200">
                    <div className="flex items-center gap-2 mb-3">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <h5 className="font-medium text-gray-900">Add New Variant & Set Frontend Price</h5>
                      <div className="ml-auto bg-blue-100 px-2 py-1 rounded text-xs text-blue-700 font-medium">
                        💡 Prices are editable in table below
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Variant Name *</label>
                        <input
                          type="text"
                          placeholder="256GB Pro Max"
                          value={variantForm.name}
                          onChange={(e) => setVariantForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Frontend Price (₹) *</label>
                        <input
                          type="number"
                          placeholder="45000"
                          value={variantForm.basePrice}
                          onChange={(e) => setVariantForm(prev => ({ ...prev, basePrice: e.target.value }))}
                          className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          required
                        />
                        <p className="text-xs text-green-600 mt-1">Price shown to customers</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Storage</label>
                        <input
                          type="text"
                          placeholder="256GB"
                          value={variantForm.storage}
                          onChange={(e) => setVariantForm(prev => ({ ...prev, storage: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Color</label>
                        <input
                          type="text"
                          placeholder="Deep Purple"
                          value={variantForm.color}
                          onChange={(e) => setVariantForm(prev => ({ ...prev, color: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Action</label>
                        <button
                          onClick={() => handleAddVariant(model.id)}
                          disabled={!variantForm.name || !variantForm.basePrice}
                          className="w-full bg-gradient-to-r from-green-600 to-blue-600 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-2 rounded-md hover:from-green-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2 font-medium"
                        >
                          <Plus className="h-4 w-4" />
                          Add Variant
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 p-2 bg-blue-100 rounded text-xs text-blue-800">
                      <strong>💡 Impact:</strong> This variant will appear on your website with the frontend price. Assessment deductions will be calculated from this base price.
                    </div>
                  </div>

                  {/* Variants Table */}
                  <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Variant Details</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                            <div className="flex items-center gap-1">
                              Frontend Price
                              <div className="bg-green-100 px-1 rounded text-xs text-green-700">Click to Edit</div>
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Storage</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Assessment Setup</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {(model.variants || []).map(variant => (
                          <tr key={variant.id} className="hover:bg-blue-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{variant.name || variant.variant_name}</div>
                                  <div className="text-xs text-gray-500">
                                    {variant.storage} {variant.color && ` • ${variant.color}`}
                                  </div>
                                </div>
                                {variant.active !== false && <CheckCircle className="h-4 w-4 text-green-500" title="Active on Frontend" />}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {editingVariant === variant.id ? (
                                <div className="flex flex-col gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">₹</span>
                                    <input
                                      type="number"
                                      value={editingPrice}
                                      onChange={(e) => setEditingPrice(e.target.value)}
                                      className="w-24 px-2 py-1 border border-green-400 rounded text-sm font-bold text-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                                      placeholder="45000"
                                      autoFocus
                                      onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                          savePriceEdit(variant.id);
                                        } else if (e.key === 'Escape') {
                                          cancelPriceEdit();
                                        }
                                      }}
                                    />
                                  </div>
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => savePriceEdit(variant.id)}
                                      className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 transition-colors flex items-center gap-1"
                                    >
                                      <CheckCircle className="h-3 w-3" />
                                      Save
                                    </button>
                                    <button
                                      onClick={cancelPriceEdit}
                                      className="bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600 transition-colors"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div 
                                  className="flex flex-col cursor-pointer hover:bg-green-50 p-1 rounded transition-colors"
                                  onClick={() => startPriceEdit(variant)}
                                  title="Click to edit frontend price"
                                >
                                  <span className="text-lg font-bold text-green-600">
                                    ₹{(variant.basePrice || variant.base_price || variant.currentPrice || variant.current_price || 0).toLocaleString()}
                                  </span>
                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    Frontend Display Price
                                    <Edit className="h-3 w-3 opacity-50" />
                                  </span>
                                </div>
                              )}
                            </td>
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
                                  No questions mapped
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1">
                                <button
                                  onClick={() => openMappingModal(variant, model.id)}
                                  className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 transition-colors flex items-center gap-1"
                                  title="Configure Assessment Questions"
                                >
                                  <Settings className="h-3 w-3" />
                                  Questions
                                </button>
                                <button
                                  onClick={() => startPriceEdit(variant)}
                                  className="bg-amber-600 text-white px-2 py-1 rounded text-xs hover:bg-amber-700 transition-colors flex items-center gap-1"
                                  title="Edit Frontend Price"
                                  disabled={editingVariant === variant.id}
                                >
                                  <Edit className="h-3 w-3" />
                                  {editingVariant === variant.id ? 'Editing...' : 'Price'}
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Delete variant "${variant.name || variant.variant_name}"?\n\nThis will remove it from your website and all customer pricing.`)) {
                                      handleDeleteVariant(variant.id);
                                    }
                                  }}
                                  className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 transition-colors flex items-center gap-1"
                                  title="Delete Variant"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {(!model.variants || model.variants.length === 0) && (
                          <tr>
                            <td colSpan="5" className="px-4 py-12 text-center">
                              <div className="flex flex-col items-center text-gray-500">
                                <Target className="h-12 w-12 mb-3 opacity-30" />
                                <h4 className="font-medium text-gray-700 mb-1">No Variants Configured</h4>
                                <p className="text-sm">Add your first variant above to start frontend pricing management.</p>
                                <p className="text-xs text-blue-600 mt-2">Variants will automatically appear on your customer website once added.</p>
                              </div>
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