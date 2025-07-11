import React, { useState, useEffect } from 'react';
import { Plus, Save, Package, Smartphone, Laptop, Tablet, Watch } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AdminModelCreation = () => {
  const [brands, setBrands] = useState([]);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modelForm, setModelForm] = useState({
    name: '',
    brandId: '',
    deviceTypeId: '',
    image: '',
    basePrice: '',
    releaseYear: '',
    active: true,
    featured: false
  });


  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [brandsRes, deviceTypesRes] = await Promise.all([
        fetch('/api/brands'),
        fetch('/api/device-types')
      ]);

      if (brandsRes.ok && deviceTypesRes.ok) {
        const [brandsData, deviceTypesData] = await Promise.all([
          brandsRes.json(),
          deviceTypesRes.json()
        ]);
        setBrands(brandsData.filter(b => b.active));
        setDeviceTypes(deviceTypesData.filter(dt => dt.active));
      }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Create the model
      const modelData = {
        ...modelForm,
        slug: generateSlug(modelForm.name),
        brandId: parseInt(modelForm.brandId),
        deviceTypeId: parseInt(modelForm.deviceTypeId),
        basePrice: parseFloat(modelForm.basePrice) || 0,
        releaseYear: parseInt(modelForm.releaseYear) || null
      };

      const modelResponse = await fetch('/api/device-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modelData)
      });

      if (modelResponse.ok) {
        // Reset form
        setModelForm({
          name: '',
          brandId: '',
          deviceTypeId: '',
          image: '',
          basePrice: '',
          releaseYear: '',
          active: true,
          featured: false
        });
          basePrice: '',
          currentPrice: '',
          marketValue: '',
          sku: '',
          availability: true
        }]);

        alert('Model and variants created successfully!');
      }
    } catch (error) {
      console.error('Error creating model:', error);
      alert('Error creating model. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getCategoryIcon = (slug) => {
    switch (slug) {
      case 'smartphones': return Smartphone;
      case 'laptops': return Laptop;
      case 'tablets': case 'tablet': return Tablet;
      case 'watchs': case 'watches': return Watch;
      default: return Package;
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Device Model</h1>
        <p className="text-gray-600 mt-2">Add a new device model to the buyback platform</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Model Information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Model Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model Name *</label>
              <input
                type="text"
                value={modelForm.name}
                onChange={(e) => setModelForm({...modelForm, name: e.target.value})}
                placeholder="e.g., iPhone 15 Pro"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
              <select
                value={modelForm.brandId}
                onChange={(e) => setModelForm({...modelForm, brandId: e.target.value})}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Device Category *</label>
              <select
                value={modelForm.deviceTypeId}
                onChange={(e) => setModelForm({...modelForm, deviceTypeId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Category</option>
                {deviceTypes.map(type => {
                  const IconComponent = getCategoryIcon(type.slug);
                  return (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  );
                })}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Base Price ($)</label>
              <input
                type="number"
                value={modelForm.basePrice}
                onChange={(e) => setModelForm({...modelForm, basePrice: e.target.value})}
                placeholder="999"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Release Year</label>
              <input
                type="number"
                value={modelForm.releaseYear}
                onChange={(e) => setModelForm({...modelForm, releaseYear: e.target.value})}
                placeholder="2024"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input
                type="url"
                value={modelForm.image}
                onChange={(e) => setModelForm({...modelForm, image: e.target.value})}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4 mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={modelForm.active}
                onChange={(e) => setModelForm({...modelForm, active: e.target.checked})}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Active (visible on frontend)</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={modelForm.featured}
                onChange={(e) => setModelForm({...modelForm, featured: e.target.checked})}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Featured</span>
            </label>
          </div>
        </div>


        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 flex items-center disabled:opacity-50"
          >
            {saving ? (
              <LoadingSpinner size="small" className="mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {saving ? 'Creating...' : 'Create Model'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminModelCreation;