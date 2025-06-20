import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Upload, Link, Tag, 
  Globe, Star, ArrowUp, ArrowDown, Check, X,
  Image as ImageIcon, ExternalLink, Settings
} from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AdminBrandsEnhanced = () => {
  const [brands, setBrands] = useState([]);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [bulkOperation, setBulkOperation] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    logo: '',
    logoType: 'url',
    description: '',
    website: '',
    active: true,
    featured: false,
    priority: 0,
    deviceTypeIds: []
  });
  const [logoFile, setLogoFile] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    Promise.all([fetchBrands(), fetchDeviceTypes()]);
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/brands?includeDeviceTypes=true');
      if (response.ok) {
        const data = await response.json();
        setBrands(Array.isArray(data) ? data : []);
      } else {
        setBrands([]);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeviceTypes = async () => {
    try {
      const response = await fetch('/api/device-types');
      if (response.ok) {
        const data = await response.json();
        setDeviceTypes(data);
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

  const handleDeviceTypeChange = (deviceTypeId) => {
    setFormData(prev => ({
      ...prev,
      deviceTypeIds: prev.deviceTypeIds.includes(deviceTypeId)
        ? prev.deviceTypeIds.filter(id => id !== deviceTypeId)
        : [...prev.deviceTypeIds, deviceTypeId]
    }));
  };

  const handleLogoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setFormData(prev => ({ ...prev, logoType: 'upload' }));
    }
  };

  const uploadLogo = async () => {
    if (!logoFile) return null;
    
    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('image', logoFile);
      
      const response = await fetch('/api/brands/upload-logo', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.logoUrl;
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
    } finally {
      setUploadingLogo(false);
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let logoUrl = formData.logo;
      
      // Upload logo if file is selected
      if (logoFile && formData.logoType === 'upload') {
        const uploadedUrl = await uploadLogo();
        if (uploadedUrl) {
          logoUrl = uploadedUrl;
        }
      }
      
      const submitData = {
        ...formData,
        logo: logoUrl,
        deviceTypeIds: formData.deviceTypeIds
      };
      
      const url = editingBrand ? `/api/brands/${editingBrand.id}` : '/api/brands';
      const method = editingBrand ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        await fetchBrands();
        resetForm();
      }
    } catch (error) {
      console.error('Error saving brand:', error);
    }
  };

  const handleEdit = async (brand) => {
    try {
      const response = await fetch(`/api/brands/${brand.id}`);
      if (response.ok) {
        const brandData = await response.json();
        setEditingBrand(brandData);
        setFormData({
          name: brandData.name,
          slug: brandData.slug,
          logo: brandData.logo || '',
          logoType: brandData.logoType || 'url',
          description: brandData.description || '',
          website: brandData.website || '',
          active: brandData.active,
          featured: brandData.featured || false,
          priority: brandData.priority || 0,
          deviceTypeIds: brandData.device_type_ids || []
        });
        setShowForm(true);
      }
    } catch (error) {
      console.error('Error fetching brand details:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this brand?')) {
      try {
        const response = await fetch(`/api/brands/${id}`, { method: 'DELETE' });
        if (response.ok) {
          await fetchBrands();
        }
      } catch (error) {
        console.error('Error deleting brand:', error);
      }
    }
  };

  const handleBulkOperation = async () => {
    if (selectedBrands.length === 0) return;
    
    try {
      if (bulkOperation === 'delete') {
        if (window.confirm(`Are you sure you want to delete ${selectedBrands.length} brands?`)) {
          const response = await fetch('/api/brands/bulk-delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: selectedBrands })
          });
          
          if (response.ok) {
            await fetchBrands();
            setSelectedBrands([]);
          }
        }
      }
    } catch (error) {
      console.error('Bulk operation error:', error);
    }
    
    setBulkOperation('');
  };

  const handleSelectAll = () => {
    if (selectedBrands.length === filteredBrands.length) {
      setSelectedBrands([]);
    } else {
      setSelectedBrands(filteredBrands.map(brand => brand.id));
    }
  };

  const handleSelectBrand = (brandId) => {
    setSelectedBrands(prev =>
      prev.includes(brandId)
        ? prev.filter(id => id !== brandId)
        : [...prev, brandId]
    );
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      logo: '',
      logoType: 'url',
      description: '',
      website: '',
      active: true,
      featured: false,
      priority: 0,
      deviceTypeIds: []
    });
    setEditingBrand(null);
    setShowForm(false);
    setLogoFile(null);
  };

  const filteredBrands = Array.isArray(brands) ? brands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (brand.description && brand.description.toLowerCase().includes(searchTerm.toLowerCase()))
  ) : [];

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
          <h1 className="text-3xl font-bold text-gray-900">Enhanced Brands Management</h1>
          <p className="text-gray-600 mt-2">Manage device brands with device type mapping and multi-selection</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Brand
        </button>
      </div>

      {/* Search and Bulk Operations */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search brands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        {selectedBrands.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{selectedBrands.length} selected</span>
            <select
              value={bulkOperation}
              onChange={(e) => setBulkOperation(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Bulk Actions</option>
              <option value="delete">Delete Selected</option>
            </select>
            <button
              onClick={handleBulkOperation}
              disabled={!bulkOperation}
              className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              Execute
            </button>
          </div>
        )}
      </div>

      {/* Brands Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedBrands.length === filteredBrands.length && filteredBrands.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Brand
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Device Types
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBrands.map(brand => (
              <tr key={brand.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand.id)}
                    onChange={() => handleSelectBrand(brand.id)}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                      {brand.logo ? (
                        <img
                          src={brand.logo}
                          alt={brand.name}
                          className="h-12 w-12 rounded-lg object-cover border"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Tag className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium text-gray-900">{brand.name}</div>
                        {brand.featured && (
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        )}
                      </div>
                      <div className="text-sm text-gray-500">/{brand.slug}</div>
                      {brand.website && (
                        <a
                          href={brand.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <Globe className="h-3 w-3" />
                          Website
                        </a>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {brand.device_types && brand.device_types.length > 0 ? (
                      brand.device_types.map((dt, index) => (
                        <span
                          key={index}
                          className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                        >
                          {dt.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-400">No device types</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      brand.active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {brand.active ? 'Active' : 'Inactive'}
                    </span>
                    {brand.featured && (
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                        Featured
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium">{brand.priority}</span>
                    <div className="flex flex-col">
                      <button className="text-gray-400 hover:text-gray-600">
                        <ArrowUp className="h-3 w-3" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600">
                        <ArrowDown className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(brand)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(brand.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredBrands.length === 0 && (
          <div className="text-center py-12">
            <Tag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No brands found</p>
          </div>
        )}
      </div>

      {/* Enhanced Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {editingBrand ? 'Edit Brand' : 'Add Brand'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brand Name *
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
                </div>

                {/* Logo Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand Logo
                  </label>
                  <div className="space-y-3">
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="logoType"
                          value="url"
                          checked={formData.logoType === 'url'}
                          onChange={handleInputChange}
                          className="mr-2"
                        />
                        <Link className="h-4 w-4 mr-1" />
                        URL
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="logoType"
                          value="upload"
                          checked={formData.logoType === 'upload'}
                          onChange={handleInputChange}
                          className="mr-2"
                        />
                        <Upload className="h-4 w-4 mr-1" />
                        Upload
                      </label>
                    </div>

                    {formData.logoType === 'url' ? (
                      <input
                        type="url"
                        name="logo"
                        value={formData.logo}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://example.com/logo.png"
                      />
                    ) : (
                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoFileChange}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {uploadingLogo && <LoadingSpinner size="small" />}
                      </div>
                    )}

                    {/* Logo Preview */}
                    {(formData.logo || logoFile) && (
                      <div className="flex items-center gap-3">
                        <div className="h-16 w-16 border border-gray-300 rounded-lg overflow-hidden">
                          <img
                            src={logoFile ? URL.createObjectURL(logoFile) : formData.logo}
                            alt="Logo preview"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <span className="text-sm text-gray-500">Logo preview</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description and Website */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      placeholder="Brief description of the brand"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                {/* Device Types Multi-Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supported Device Types
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-3">
                    {deviceTypes.map(deviceType => (
                      <label key={deviceType.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.deviceTypeIds.includes(deviceType.id)}
                          onChange={() => handleDeviceTypeChange(deviceType.id)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{deviceType.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Settings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="active"
                        checked={formData.active}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 mr-2"
                      />
                      Active
                    </label>
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="featured"
                        checked={formData.featured}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 mr-2"
                      />
                      Featured
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploadingLogo}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {uploadingLogo ? 'Uploading...' : editingBrand ? 'Update' : 'Create'}
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

export default AdminBrandsEnhanced;