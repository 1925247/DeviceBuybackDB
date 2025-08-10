import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Upload, Eye, Image, Camera, Package, IndianRupee } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { ObjectUploader } from '../../components/ObjectUploader';

const AdvancedModelManagementV2 = () => {
  const [models, setModels] = useState([]);
  const [brands, setBrands] = useState([]);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('models');
  const [editingModel, setEditingModel] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [previewImages, setPreviewImages] = useState({});

  // Enhanced form state for model management
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    brandId: '',
    deviceTypeId: '',
    description: '',
    year: '',
    basePrice: '',
    image: '',
    secondaryImage: '',
    active: true,
    featured: false,
    specifications: '',
    priority: 0
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
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

  const handleFormChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'name') {
        updated.slug = generateSlug(value);
      }
      return updated;
    });
  };

  const handleImageUpload = async (imageType) => {
    try {
      const response = await fetch('/api/objects/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      return { method: 'PUT', url: data.uploadURL };
    } catch (error) {
      console.error('Error getting upload URL:', error);
      throw error;
    }
  };

  const handleImageUploadComplete = (imageType, result) => {
    if (result.successful && result.successful.length > 0) {
      const uploadedFile = result.successful[0];
      const imageUrl = uploadedFile.uploadURL.split('?')[0]; // Remove query params
      handleFormChange(imageType, imageUrl);
      
      // Set preview
      setPreviewImages(prev => ({
        ...prev,
        [imageType]: imageUrl
      }));
    }
  };

  const handleSaveModel = async () => {
    try {
      const apiData = {
        ...formData,
        brand_id: parseInt(formData.brandId),
        device_type_id: parseInt(formData.deviceTypeId),
        base_price: parseFloat(formData.basePrice) || 0,
        year: parseInt(formData.year) || null,
        secondary_image: formData.secondaryImage
      };

      const url = editingModel ? `/api/device-models/${editingModel.id}` : '/api/device-models';
      const method = editingModel ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData)
      });

      if (response.ok) {
        await fetchAllData();
        resetForm();
      } else {
        const error = await response.text();
        console.error('Save error:', error);
      }
    } catch (error) {
      console.error('Error saving model:', error);
    }
  };

  const handleEditModel = (model) => {
    setFormData({
      name: model.name,
      slug: model.slug,
      brandId: model.brand_id || model.brandId,
      deviceTypeId: model.device_type_id || model.deviceTypeId,
      description: model.description || '',
      year: model.year || '',
      basePrice: model.base_price || model.basePrice || '',
      image: model.image || '',
      secondaryImage: model.secondary_image || model.secondaryImage || '',
      active: model.active !== false,
      featured: model.featured || false,
      specifications: model.specifications || '',
      priority: model.priority || 0
    });
    
    setPreviewImages({
      image: model.image,
      secondaryImage: model.secondary_image || model.secondaryImage
    });
    
    setEditingModel(model);
    setShowAddForm(true);
  };

  const handleDeleteModel = async (id) => {
    if (window.confirm('Are you sure you want to delete this model?')) {
      try {
        const response = await fetch(`/api/device-models/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          await fetchAllData();
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
      brandId: '',
      deviceTypeId: '',
      description: '',
      year: '',
      basePrice: '',
      image: '',
      secondaryImage: '',
      active: true,
      featured: false,
      specifications: '',
      priority: 0
    });
    setPreviewImages({});
    setEditingModel(null);
    setShowAddForm(false);
  };

  const getBrandName = (brandId) => {
    const brand = brands.find(b => b.id === brandId);
    return brand ? brand.name : 'Unknown';
  };

  const getDeviceTypeName = (deviceTypeId) => {
    const deviceType = deviceTypes.find(dt => dt.id === deviceTypeId);
    return deviceType ? deviceType.name : 'Unknown';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Advanced Model Management</h1>
            <p className="text-gray-600 mt-2">Comprehensive device model management with advanced features</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center gap-2 shadow-lg transition-all"
          >
            <Plus className="h-5 w-5" />
            Add New Model
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setSelectedTab('models')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                selectedTab === 'models'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Models ({models.length})
            </button>
            <button
              onClick={() => setSelectedTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                selectedTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview & Analytics
            </button>
          </nav>
        </div>
      </div>

      {/* Models Tab */}
      {selectedTab === 'models' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {models.map((model) => (
            <div key={model.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              {/* Model Image */}
              <div className="h-48 bg-gray-100 relative">
                {model.image ? (
                  <img
                    src={model.image}
                    alt={model.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  {model.featured && (
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                      Featured
                    </span>
                  )}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    model.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {model.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Model Info */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900 text-lg">{model.name}</h3>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      ₹{(model.base_price || model.basePrice || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">
                  {getBrandName(model.brand_id || model.brandId)} • {getDeviceTypeName(model.device_type_id || model.deviceTypeId)}
                </p>
                
                {model.year && (
                  <p className="text-sm text-gray-500 mb-2">Year: {model.year}</p>
                )}
                
                {model.description && (
                  <p className="text-sm text-gray-700 mb-3 line-clamp-2">{model.description}</p>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditModel(model)}
                    className="flex-1 bg-blue-50 text-blue-700 px-3 py-2 rounded-md hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteModel(model.id)}
                    className="flex-1 bg-red-50 text-red-700 px-3 py-2 rounded-md hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Overview Tab */}
      {selectedTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
            <div className="space-y-2">
              <p>Total Models: <span className="font-semibold">{models.length}</span></p>
              <p>Active Models: <span className="font-semibold">{models.filter(m => m.active).length}</span></p>
              <p>Featured Models: <span className="font-semibold">{models.filter(m => m.featured).length}</span></p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">By Brand</h3>
            <div className="space-y-2">
              {brands.slice(0, 5).map(brand => {
                const count = models.filter(m => (m.brand_id || m.brandId) === brand.id).length;
                return (
                  <div key={brand.id} className="flex justify-between">
                    <span>{brand.name}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">By Category</h3>
            <div className="space-y-2">
              {deviceTypes.slice(0, 5).map(type => {
                const count = models.filter(m => (m.device_type_id || m.deviceTypeId) === type.id).length;
                return (
                  <div key={type.id} className="flex justify-between">
                    <span>{type.name}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Model Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  {editingModel ? 'Edit Model' : 'Add New Model'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Form */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Basic Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Model Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., iPhone 14 Pro"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => handleFormChange('slug', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Auto-generated from name"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                      <select
                        value={formData.brandId}
                        onChange={(e) => handleFormChange('brandId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Device Type</label>
                      <select
                        value={formData.deviceTypeId}
                        onChange={(e) => handleFormChange('deviceTypeId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Select Type</option>
                        {deviceTypes.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                      <input
                        type="number"
                        value={formData.year}
                        onChange={(e) => handleFormChange('year', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="2000"
                        max="2030"
                        placeholder="2024"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (₹)</label>
                      <input
                        type="number"
                        value={formData.basePrice}
                        onChange={(e) => handleFormChange('basePrice', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                        placeholder="45000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleFormChange('description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                      placeholder="Brief description of the device..."
                    />
                  </div>

                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) => handleFormChange('active', e.target.checked)}
                        className="rounded text-blue-600"
                      />
                      <span className="text-sm font-medium text-gray-700">Active</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => handleFormChange('featured', e.target.checked)}
                        className="rounded text-blue-600"
                      />
                      <span className="text-sm font-medium text-gray-700">Featured</span>
                    </label>
                  </div>
                </div>

                {/* Right Column - Images */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Device Images</h3>
                  
                  {/* Primary Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary Image *</label>
                    
                    {/* Current Image Preview */}
                    {(previewImages.image || formData.image) && (
                      <div className="mb-4 relative">
                        <img
                          src={previewImages.image || formData.image}
                          alt="Current primary image"
                          className="w-full h-40 object-cover rounded-lg border"
                        />
                        <button
                          onClick={() => {
                            handleFormChange('image', '');
                            setPreviewImages(prev => ({ ...prev, image: null }));
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-lg"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                          Current Image
                        </div>
                      </div>
                    )}

                    {/* Upload Options */}
                    <div className="space-y-3">
                      {/* Upload Button */}
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
                        <div className="text-center">
                          <ObjectUploader
                            maxNumberOfFiles={1}
                            maxFileSize={5242880} // 5MB
                            onGetUploadParameters={() => handleImageUpload('image')}
                            onComplete={(result) => handleImageUploadComplete('image', result)}
                            buttonClassName="w-full bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-300 py-3"
                          >
                            <div className="flex items-center justify-center gap-2">
                              <Upload className="h-5 w-5" />
                              {formData.image ? 'Replace Image' : 'Upload New Image'}
                            </div>
                          </ObjectUploader>
                          <p className="text-xs text-gray-500 mt-2">Click to browse or drag & drop (Max 5MB)</p>
                        </div>
                      </div>

                      {/* URL Input */}
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-white text-gray-500">OR</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Enter Image URL</label>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={formData.image}
                            onChange={(e) => {
                              handleFormChange('image', e.target.value);
                              if (e.target.value) {
                                setPreviewImages(prev => ({ ...prev, image: e.target.value }));
                              }
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="https://example.com/device-image.jpg"
                          />
                          {formData.image && (
                            <button
                              type="button"
                              onClick={() => setPreviewImages(prev => ({ ...prev, image: formData.image }))}
                              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 border border-gray-300"
                              title="Preview URL"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Secondary Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Image (Optional)</label>
                    
                    {/* Current Secondary Image Preview */}
                    {(previewImages.secondaryImage || formData.secondaryImage) && (
                      <div className="mb-4 relative">
                        <img
                          src={previewImages.secondaryImage || formData.secondaryImage}
                          alt="Current secondary image"
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <button
                          onClick={() => {
                            handleFormChange('secondaryImage', '');
                            setPreviewImages(prev => ({ ...prev, secondaryImage: null }));
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-lg"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                          Secondary Image
                        </div>
                      </div>
                    )}

                    {/* Upload Options */}
                    <div className="space-y-3">
                      {/* Upload Button */}
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 hover:border-green-400 transition-colors">
                        <div className="text-center">
                          <ObjectUploader
                            maxNumberOfFiles={1}
                            maxFileSize={5242880} // 5MB
                            onGetUploadParameters={() => handleImageUpload('secondaryImage')}
                            onComplete={(result) => handleImageUploadComplete('secondaryImage', result)}
                            buttonClassName="w-full bg-green-50 text-green-700 hover:bg-green-100 border border-green-300 py-2"
                          >
                            <div className="flex items-center justify-center gap-2">
                              <Image className="h-4 w-4" />
                              {formData.secondaryImage ? 'Replace Secondary' : 'Upload Secondary'}
                            </div>
                          </ObjectUploader>
                          <p className="text-xs text-gray-500 mt-1">Optional additional device photo</p>
                        </div>
                      </div>

                      {/* URL Input */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Or enter URL</label>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={formData.secondaryImage}
                            onChange={(e) => {
                              handleFormChange('secondaryImage', e.target.value);
                              if (e.target.value) {
                                setPreviewImages(prev => ({ ...prev, secondaryImage: e.target.value }));
                              }
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="https://example.com/secondary-image.jpg"
                          />
                          {formData.secondaryImage && (
                            <button
                              type="button"
                              onClick={() => setPreviewImages(prev => ({ ...prev, secondaryImage: formData.secondaryImage }))}
                              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 border border-gray-300"
                              title="Preview URL"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Image Guidelines */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Image Guidelines</h4>
                    <ul className="text-xs text-blue-800 space-y-1">
                      <li>• Recommended size: 800x600px or higher</li>
                      <li>• Supported formats: JPG, PNG, WebP</li>
                      <li>• Maximum file size: 5MB per image</li>
                      <li>• Use clear, high-quality device photos</li>
                      <li>• Primary image will be used in listings</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                <button
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveModel}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {editingModel ? 'Update Model' : 'Create Model'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedModelManagementV2;