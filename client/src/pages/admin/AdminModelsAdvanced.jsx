import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Upload, Link, Tag, Image as ImageIcon,
  Calendar, DollarSign, Package, Filter, Grid, List, Star,
  ChevronDown, ChevronUp, Eye, Copy, MoreHorizontal
} from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AdminModelsAdvanced = () => {
  const [models, setModels] = useState([]);
  const [brands, setBrands] = useState([]);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingModel, setEditingModel] = useState(null);
  const [selectedModels, setSelectedModels] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filters, setFilters] = useState({
    brand: '',
    deviceType: '',
    year: '',
    priceRange: 'all'
  });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    brandId: '',
    deviceTypeId: '',
    year: new Date().getFullYear(),
    basePrice: '',
    image: '',
    imageType: 'url',
    description: '',
    specifications: '',
    featured: false,
    active: true,
    priority: 0
  });
  const [imageFile, setImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    Promise.all([fetchModels(), fetchBrands(), fetchDeviceTypes()]);
  }, []);

  const fetchModels = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/device-models?includeDetails=true');
      if (response.ok) {
        const data = await response.json();
        setModels(Array.isArray(data) ? data : []);
      } else {
        setModels([]);
      }
    } catch (error) {
      console.error('Error fetching models:', error);
      setModels([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await fetch('/api/brands');
      if (response.ok) {
        const data = await response.json();
        setBrands(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
      setBrands([]);
    }
  };

  const fetchDeviceTypes = async () => {
    try {
      const response = await fetch('/api/device-types');
      if (response.ok) {
        const data = await response.json();
        setDeviceTypes(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching device types:', error);
      setDeviceTypes([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'name' && { slug: value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') })
    }));
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setFormData(prev => ({ ...prev, imageType: 'upload' }));
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return null;
    
    setUploadingImage(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('image', imageFile);
      
      const response = await fetch('/api/device-models/upload-image', {
        method: 'POST',
        body: formDataUpload
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.imageUrl;
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploadingImage(false);
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = formData.image;
      
      // Upload image if file is selected
      if (imageFile && formData.imageType === 'upload') {
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }
      
      const submitData = {
        ...formData,
        image: imageUrl,
        brand_id: parseInt(formData.brandId),
        device_type_id: parseInt(formData.deviceTypeId),
        year: parseInt(formData.year),
        base_price: parseFloat(formData.basePrice) || 0,
        priority: parseInt(formData.priority) || 0
      };
      
      const url = editingModel ? `/api/device-models/${editingModel.id}` : '/api/device-models';
      const method = editingModel ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        await fetchModels();
        resetForm();
        alert(editingModel ? 'Model updated successfully!' : 'Model created successfully!');
      } else {
        alert('Failed to save model. Please try again.');
      }
    } catch (error) {
      console.error('Error saving model:', error);
      alert('Error saving model. Please try again.');
    }
  };

  const handleEdit = async (model) => {
    try {
      const response = await fetch(`/api/device-models/${model.id}`);
      if (response.ok) {
        const modelData = await response.json();
        setEditingModel(modelData);
        setFormData({
          name: modelData.name,
          slug: modelData.slug,
          brandId: modelData.brand_id || modelData.brandId || '',
          deviceTypeId: modelData.device_type_id || modelData.deviceTypeId || '',
          year: modelData.year || new Date().getFullYear(),
          basePrice: modelData.base_price || modelData.basePrice || '',
          image: modelData.image || '',
          imageType: 'url',
          description: modelData.description || '',
          specifications: modelData.specifications || '',
          featured: modelData.featured || false,
          active: modelData.active !== false,
          priority: modelData.priority || 0
        });
        setShowForm(true);
      } else {
        alert('Failed to load model details. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching model details:', error);
      alert('Error loading model details. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this model?')) {
      try {
        const response = await fetch(`/api/device-models/${id}`, { method: 'DELETE' });
        if (response.ok) {
          await fetchModels();
          alert('Model deleted successfully!');
        } else {
          alert('Failed to delete model. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting model:', error);
        alert('Error deleting model. Please try again.');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedModels.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedModels.length} models?`)) {
      try {
        const response = await fetch('/api/device-models/bulk-delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: selectedModels })
        });
        
        if (response.ok) {
          await fetchModels();
          setSelectedModels([]);
          alert('Models deleted successfully!');
        } else {
          alert('Failed to delete models. Please try again.');
        }
      } catch (error) {
        console.error('Bulk delete error:', error);
        alert('Error deleting models. Please try again.');
      }
    }
  };

  const handleSelectAll = () => {
    if (selectedModels.length === filteredAndSortedModels.length) {
      setSelectedModels([]);
    } else {
      setSelectedModels(filteredAndSortedModels.map(model => model.id));
    }
  };

  const handleSelectModel = (modelId) => {
    setSelectedModels(prev =>
      prev.includes(modelId)
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId]
    );
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      brandId: '',
      deviceTypeId: '',
      year: new Date().getFullYear(),
      basePrice: '',
      image: '',
      imageType: 'url',
      description: '',
      specifications: '',
      featured: false,
      active: true,
      priority: 0
    });
    setEditingModel(null);
    setShowForm(false);
    setImageFile(null);
  };

  const applyFilters = (models) => {
    return models.filter(model => {
      const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (model.brandName && model.brandName.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesBrand = !filters.brand || model.brandId?.toString() === filters.brand;
      const matchesDeviceType = !filters.deviceType || model.deviceTypeId?.toString() === filters.deviceType;
      const matchesYear = !filters.year || model.year?.toString() === filters.year;
      
      let matchesPrice = true;
      if (filters.priceRange !== 'all') {
        const price = model.basePrice || 0;
        switch (filters.priceRange) {
          case 'low': matchesPrice = price < 20000; break;
          case 'medium': matchesPrice = price >= 20000 && price < 50000; break;
          case 'high': matchesPrice = price >= 50000; break;
        }
      }
      
      return matchesSearch && matchesBrand && matchesDeviceType && matchesYear && matchesPrice;
    });
  };

  const sortModels = (models) => {
    return [...models].sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'brandName') {
        aValue = a.brandName || '';
        bValue = b.brandName || '';
      }
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  const filteredAndSortedModels = sortModels(applyFilters(models));

  const getBrandName = (brandId) => {
    const brand = brands.find(b => b.id === brandId);
    return brand ? brand.name : 'Unknown Brand';
  };

  const getDeviceTypeName = (deviceTypeId) => {
    const deviceType = deviceTypes.find(dt => dt.id === deviceTypeId);
    return deviceType ? deviceType.name : 'Unknown Type';
  };

  const years = Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - i);

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
          <h1 className="text-3xl font-bold text-gray-900">Advanced Model Management</h1>
          <p className="text-gray-600 mt-2">Manage device models with brand mapping, pricing, and advanced features</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Model
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
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
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
            <select
              value={filters.brand}
              onChange={(e) => setFilters(prev => ({ ...prev, brand: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Brands</option>
              {brands.map(brand => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Device Type</label>
            <select
              value={filters.deviceType}
              onChange={(e) => setFilters(prev => ({ ...prev, deviceType: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              {deviceTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <select
              value={filters.year}
              onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Years</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
            <select
              value={filters.priceRange}
              onChange={(e) => setFilters(prev => ({ ...prev, priceRange: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Prices</option>
              <option value="low">Under ₹20,000</option>
              <option value="medium">₹20,000 - ₹50,000</option>
              <option value="high">Above ₹50,000</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name">Name</option>
                <option value="brandName">Brand</option>
                <option value="year">Year</option>
                <option value="basePrice">Price</option>
                <option value="priority">Priority</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{filteredAndSortedModels.length} models found</span>
            {selectedModels.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{selectedModels.length} selected</span>
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                >
                  Delete Selected
                </button>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Models Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedModels.map(model => (
            <div key={model.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={selectedModels.includes(model.id)}
                  onChange={() => handleSelectModel(model.id)}
                  className="absolute top-3 left-3 z-10 rounded border-gray-300"
                />
                {model.featured && (
                  <Star className="absolute top-3 right-3 h-5 w-5 text-yellow-400 fill-current" />
                )}
                <div className="h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                  {model.image ? (
                    <img
                      src={model.image}
                      alt={model.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900 line-clamp-2">{model.name}</h3>
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => handleEdit(model)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(model.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Tag className="h-3 w-3" />
                    <span>{getBrandName(model.brandId)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-3 w-3" />
                    <span>{getDeviceTypeName(model.deviceTypeId)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    <span>{model.year}</span>
                  </div>
                  {model.basePrice && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-3 w-3" />
                      <span>₹{model.basePrice.toLocaleString()}</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-3 flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    model.active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {model.active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-xs text-gray-500">/{model.slug}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedModels.length === filteredAndSortedModels.length && filteredAndSortedModels.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Model
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Brand / Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Year
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Base Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedModels.map(model => (
                <tr key={model.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedModels.includes(model.id)}
                      onChange={() => handleSelectModel(model.id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        {model.image ? (
                          <img
                            src={model.image}
                            alt={model.name}
                            className="h-12 w-12 rounded-lg object-cover border"
                          />
                        ) : (
                          <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium text-gray-900">{model.name}</div>
                          {model.featured && (
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          )}
                        </div>
                        <div className="text-sm text-gray-500">/{model.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{getBrandName(model.brandId)}</div>
                    <div className="text-sm text-gray-500">{getDeviceTypeName(model.deviceTypeId)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {model.year}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {model.basePrice ? `₹${model.basePrice.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      model.active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {model.active ? 'Active' : 'Inactive'}
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

          {filteredAndSortedModels.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No models found</p>
            </div>
          )}
        </div>
      )}

      {/* Advanced Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {editingModel ? 'Edit Model' : 'Add New Model'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                    
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
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Brand *
                      </label>
                      <select
                        name="brandId"
                        value={formData.brandId}
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
                        name="deviceTypeId"
                        value={formData.deviceTypeId}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Device Type</option>
                        {deviceTypes.map(type => (
                          <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Year
                        </label>
                        <select
                          name="year"
                          value={formData.year}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Base Price (₹)
                        </label>
                        <input
                          type="number"
                          name="basePrice"
                          value={formData.basePrice}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Image and Advanced Settings */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Image & Settings</h3>
                    
                    {/* Image Section */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Model Image
                      </label>
                      <div className="space-y-3">
                        <div className="flex gap-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="imageType"
                              value="url"
                              checked={formData.imageType === 'url'}
                              onChange={handleInputChange}
                              className="mr-2"
                            />
                            <Link className="h-4 w-4 mr-1" />
                            URL
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="imageType"
                              value="upload"
                              checked={formData.imageType === 'upload'}
                              onChange={handleInputChange}
                              className="mr-2"
                            />
                            <Upload className="h-4 w-4 mr-1" />
                            Upload
                          </label>
                        </div>

                        {formData.imageType === 'url' ? (
                          <input
                            type="url"
                            name="image"
                            value={formData.image}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="https://example.com/image.jpg"
                          />
                        ) : (
                          <div className="flex items-center gap-3">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageFileChange}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {uploadingImage && <LoadingSpinner size="small" />}
                          </div>
                        )}

                        {/* Image Preview */}
                        {(formData.image || imageFile) && (
                          <div className="flex items-center gap-3">
                            <div className="h-20 w-20 border border-gray-300 rounded-lg overflow-hidden">
                              <img
                                src={imageFile ? URL.createObjectURL(imageFile) : formData.image}
                                alt="Model preview"
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <span className="text-sm text-gray-500">Image preview</span>
                          </div>
                        )}
                      </div>
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

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Specifications
                      </label>
                      <textarea
                        name="specifications"
                        value={formData.specifications}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Technical specifications (JSON format or text)"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Priority
                        </label>
                        <input
                          type="number"
                          name="priority"
                          value={formData.priority}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="featured"
                          checked={formData.featured}
                          onChange={handleInputChange}
                          className="mr-3 rounded border-gray-300"
                        />
                        <Star className="h-4 w-4 mr-2 text-yellow-400" />
                        Featured Model
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="active"
                          checked={formData.active}
                          onChange={handleInputChange}
                          className="mr-3 rounded border-gray-300"
                        />
                        Active Status
                      </label>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingModel ? 'Update Model' : 'Create Model'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminModelsAdvanced;