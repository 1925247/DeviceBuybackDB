import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Smartphone, Filter } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AdminModels = () => {
  const [models, setModels] = useState([]);
  const [brands, setBrands] = useState([]);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedDeviceType, setSelectedDeviceType] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingModel, setEditingModel] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    brand_id: '',
    device_type_id: '',
    release_year: new Date().getFullYear(),
    image_url: '',
    description: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [modelsRes, brandsRes, deviceTypesRes] = await Promise.all([
        fetch('/api/device-models'),
        fetch('/api/brands'),
        fetch('/api/device-types')
      ]);

      if (modelsRes.ok && brandsRes.ok && deviceTypesRes.ok) {
        const [modelsData, brandsData, deviceTypesData] = await Promise.all([
          modelsRes.json(),
          brandsRes.json(),
          deviceTypesRes.json()
        ]);

        setModels(modelsData);
        setBrands(brandsData);
        setDeviceTypes(deviceTypesData);
      } else {
        setModels([]);
        setBrands([]);
        setDeviceTypes([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'name' && { slug: value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') })
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingModel ? `/api/device-models/${editingModel.id}` : '/api/device-models';
      const method = editingModel ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchData();
        resetForm();
      }
    } catch (error) {
      console.error('Error saving model:', error);
    }
  };

  const handleEdit = (model) => {
    setEditingModel(model);
    setFormData({
      name: model.name,
      slug: model.slug,
      brand_id: model.brand_id,
      device_type_id: model.device_type_id,
      release_year: model.release_year,
      image_url: model.image_url || '',
      description: model.description || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this model?')) {
      try {
        const response = await fetch(`/api/device-models/${id}`, { method: 'DELETE' });
        if (response.ok) {
          await fetchData();
        }
      } catch (error) {
        console.error('Error deleting model:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      brand_id: '',
      device_type_id: '',
      release_year: new Date().getFullYear(),
      image_url: '',
      description: ''
    });
    setEditingModel(null);
    setShowForm(false);
  };

  const getBrandName = (brandId) => {
    const brand = brands.find(b => b.id === brandId);
    return brand ? brand.name : 'Unknown';
  };

  const getDeviceTypeName = (deviceTypeId) => {
    const deviceType = deviceTypes.find(dt => dt.id === deviceTypeId);
    return deviceType ? deviceType.name : 'Unknown';
  };

  const filteredModels = models.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (model.description && model.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesBrand = !selectedBrand || model.brand_id.toString() === selectedBrand;
    const matchesDeviceType = !selectedDeviceType || model.device_type_id.toString() === selectedDeviceType;
    
    return matchesSearch && matchesBrand && matchesDeviceType;
  });

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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Device Models</h1>
          <p className="text-gray-600 mt-2">Manage specific device models and variants</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Model
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search models..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Brands</option>
            {brands.map(brand => (
              <option key={brand.id} value={brand.id}>{brand.name}</option>
            ))}
          </select>

          <select
            value={selectedDeviceType}
            onChange={(e) => setSelectedDeviceType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Device Types</option>
            {deviceTypes.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>

          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedBrand('');
              setSelectedDeviceType('');
            }}
            className="flex items-center justify-center px-3 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Filter className="h-4 w-4 mr-2" />
            Clear
          </button>
        </div>
      </div>

      {/* Models Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Model
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Brand
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Year
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Slug
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredModels.map(model => (
              <tr key={model.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                      {model.image_url ? (
                        <img
                          src={model.image_url}
                          alt={model.name}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Smartphone className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{model.name}</div>
                      {model.description && (
                        <div className="text-xs text-gray-500 max-w-xs truncate">{model.description}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {getBrandName(model.brand_id)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {getDeviceTypeName(model.device_type_id)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {model.release_year}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                    /{model.slug}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(model)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(model.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredModels.length === 0 && (
          <div className="text-center py-12">
            <Smartphone className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No models found</p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingModel ? 'Edit Model' : 'Add Model'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">Auto-generated from name</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand *
                  </label>
                  <select
                    name="brand_id"
                    value={formData.brand_id}
                    onChange={handleInputChange}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Device Type *
                  </label>
                  <select
                    name="device_type_id"
                    value={formData.device_type_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Type</option>
                    {deviceTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Release Year
                </label>
                <input
                  type="number"
                  name="release_year"
                  value={formData.release_year}
                  onChange={handleInputChange}
                  min="2000"
                  max="2030"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of the model"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingModel ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminModels;