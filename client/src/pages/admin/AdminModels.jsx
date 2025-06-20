import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, IndianRupee } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AdminModels = () => {
  const [models, setModels] = useState([]);
  const [brands, setBrands] = useState([]);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModel, setShowAddModel] = useState(false);
  const [editingModel, setEditingModel] = useState(null);

  // Form states
  const [newModel, setNewModel] = useState({
    name: '',
    slug: '',
    brandId: '',
    deviceTypeId: '',
    description: '',
    year: '',
    basePrice: '',
    image: '',
    active: true,
    featured: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [modelsRes, brandsRes, deviceTypesRes] = await Promise.all([
        fetch('/api/device-models?includeDetails=true'),
        fetch('/api/brands'),
        fetch('/api/device-types')
      ]);

      const [modelsData, brandsData, deviceTypesData] = await Promise.all([
        modelsRes.json(),
        brandsRes.json(),
        deviceTypesRes.json()
      ]);

      setModels(Array.isArray(modelsData) ? modelsData : []);
      setBrands(Array.isArray(brandsData) ? brandsData : []);
      setDeviceTypes(Array.isArray(deviceTypesData) ? deviceTypesData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name) => {
    return name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleModelNameChange = (value) => {
    setNewModel(prev => ({
      ...prev,
      name: value,
      slug: generateSlug(value)
    }));
  };

  const handleAddModel = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/device-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newModel,
          brand_id: parseInt(newModel.brandId),
          device_type_id: parseInt(newModel.deviceTypeId),
          base_price: parseFloat(newModel.basePrice) || 0,
          year: parseInt(newModel.year) || null
        })
      });

      if (response.ok) {
        await fetchData();
        setShowAddModel(false);
        setNewModel({
          name: '', slug: '', brandId: '', deviceTypeId: '',
          description: '', year: '', basePrice: '', image: '',
          active: true, featured: false
        });
      }
    } catch (error) {
      console.error('Error adding model:', error);
    }
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
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Device Models</h1>
        <button
          onClick={() => setShowAddModel(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add New Model
        </button>
      </div>

      {/* Add Model Modal */}
      {showAddModel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New Model</h2>
              <button
                onClick={() => setShowAddModel(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleAddModel} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Model Name
                  </label>
                  <input
                    type="text"
                    value={newModel.name}
                    onChange={(e) => handleModelNameChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={newModel.slug}
                    onChange={(e) => setNewModel(prev => ({ ...prev, slug: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand
                  </label>
                  <select
                    value={newModel.brandId}
                    onChange={(e) => setNewModel(prev => ({ ...prev, brandId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Brand</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Device Type
                  </label>
                  <select
                    value={newModel.deviceTypeId}
                    onChange={(e) => setNewModel(prev => ({ ...prev, deviceTypeId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Device Type</option>
                    {deviceTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year
                  </label>
                  <input
                    type="number"
                    value={newModel.year}
                    onChange={(e) => setNewModel(prev => ({ ...prev, year: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="2000"
                    max="2030"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Base Price (₹)
                  </label>
                  <input
                    type="number"
                    value={newModel.basePrice}
                    onChange={(e) => setNewModel(prev => ({ ...prev, basePrice: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={newModel.image}
                    onChange={(e) => setNewModel(prev => ({ ...prev, image: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newModel.description}
                  onChange={(e) => setNewModel(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newModel.active}
                    onChange={(e) => setNewModel(prev => ({ ...prev, active: e.target.checked }))}
                    className="rounded"
                  />
                  Active
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newModel.featured}
                    onChange={(e) => setNewModel(prev => ({ ...prev, featured: e.target.checked }))}
                    className="rounded"
                  />
                  Featured
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModel(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Model
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Models List */}
      <div className="space-y-6">
        {models.map((model) => (
          <div key={model.id} className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                {model.image && (
                  <img
                    src={model.image}
                    alt={model.name}
                    className="w-16 h-16 object-contain rounded-lg bg-gray-100"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{model.name}</h3>
                  <p className="text-gray-600">
                    {model.brandName} • {model.deviceTypeName}
                    {model.year && ` • ${model.year}`}
                  </p>
                  {model.basePrice > 0 && (
                    <p className="text-green-600 font-semibold flex items-center gap-1">
                      <IndianRupee className="h-4 w-4" />
                      {model.basePrice.toLocaleString('en-IN')}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  model.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {model.active ? 'Active' : 'Inactive'}
                </span>
                {model.featured && (
                  <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                    Featured
                  </span>
                )}
                <button
                  onClick={() => setEditingModel(model.id === editingModel ? null : model.id)}
                  className="text-blue-600 hover:text-blue-700 text-sm p-1"
                  title="Edit Model"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={async () => {
                    if (confirm('Are you sure you want to delete this model?')) {
                      try {
                        const response = await fetch(`/api/device-models/${model.id}`, {
                          method: 'DELETE'
                        });
                        if (response.ok) {
                          await fetchData();
                        }
                      } catch (error) {
                        console.error('Error deleting model:', error);
                      }
                    }
                  }}
                  className="text-red-600 hover:text-red-700 text-sm p-1"
                  title="Delete Model"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Edit Model Form */}
            {editingModel === model.id && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <input
                    type="text"
                    defaultValue={model.name}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Model Name"
                    onBlur={async (e) => {
                      try {
                        const response = await fetch(`/api/device-models/${model.id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ name: e.target.value })
                        });
                        if (response.ok) {
                          await fetchData();
                        }
                      } catch (error) {
                        console.error('Error updating model:', error);
                      }
                    }}
                  />
                  <input
                    type="number"
                    defaultValue={model.basePrice}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Base Price"
                    onBlur={async (e) => {
                      try {
                        const response = await fetch(`/api/device-models/${model.id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ base_price: parseFloat(e.target.value) })
                        });
                        if (response.ok) {
                          await fetchData();
                        }
                      } catch (error) {
                        console.error('Error updating model:', error);
                      }
                    }}
                  />
                </div>
                <button
                  onClick={() => setEditingModel(null)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Done Editing
                </button>
              </div>
            )}

            {model.description && (
              <div className="mt-2 text-sm text-gray-600">
                {model.description}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminModels;