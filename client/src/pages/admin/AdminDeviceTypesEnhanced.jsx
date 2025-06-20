import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Search, Smartphone, Laptop, Tablet, Watch, 
  Headphones, Camera, Monitor, Speaker, Mouse, Keyboard, Gamepad2,
  Palette, Upload, Code, Smile, Wand2, Save, X, Eye, EyeOff
} from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AdminDeviceTypesEnhanced = () => {
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [showIconGenerator, setShowIconGenerator] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: 'smartphone',
    iconType: 'lucide',
    customIcon: '',
    iconColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
    active: true,
    priority: 0
  });

  // Icon mappings for different types
  const lucideIcons = {
    smartphone: Smartphone,
    laptop: Laptop,
    tablet: Tablet,
    watch: Watch,
    headphones: Headphones,
    camera: Camera,
    monitor: Monitor,
    speaker: Speaker,
    mouse: Mouse,
    keyboard: Keyboard,
    gamepad: Gamepad2
  };

  const iconOptions = [
    { value: 'smartphone', label: 'Smartphone', icon: Smartphone },
    { value: 'laptop', label: 'Laptop', icon: Laptop },
    { value: 'tablet', label: 'Tablet', icon: Tablet },
    { value: 'watch', label: 'Watch', icon: Watch },
    { value: 'headphones', label: 'Headphones', icon: Headphones },
    { value: 'camera', label: 'Camera', icon: Camera },
    { value: 'monitor', label: 'Monitor', icon: Monitor },
    { value: 'speaker', label: 'Speaker', icon: Speaker },
    { value: 'mouse', label: 'Mouse', icon: Mouse },
    { value: 'keyboard', label: 'Keyboard', icon: Keyboard },
    { value: 'gamepad', label: 'Gaming', icon: Gamepad2 }
  ];

  const emojiOptions = [
    '📱', '💻', '🖥️', '⌚', '🎧', '📷', '🖱️', '⌨️', '🎮', '📟', 
    '💾', '🔌', '🔋', '📺', '📻', '☎️', '📞', '📠', '💿', '💽'
  ];

  const colorPresets = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ];

  useEffect(() => {
    fetchDeviceTypes();
  }, []);

  const fetchDeviceTypes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/device-types');
      if (response.ok) {
        const data = await response.json();
        setDeviceTypes(data);
      }
    } catch (error) {
      console.error('Error fetching device types:', error);
      setDeviceTypes([]);
    } finally {
      setLoading(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingType ? `/api/device-types/${editingType.id}` : '/api/device-types';
      const method = editingType ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchDeviceTypes();
        resetForm();
      }
    } catch (error) {
      console.error('Error saving device type:', error);
    }
  };

  const handleEdit = (deviceType) => {
    setEditingType(deviceType);
    setFormData({
      name: deviceType.name,
      slug: deviceType.slug,
      description: deviceType.description || '',
      icon: deviceType.icon || 'smartphone',
      iconType: deviceType.iconType || 'lucide',
      customIcon: deviceType.customIcon || '',
      iconColor: deviceType.iconColor || '#3B82F6',
      backgroundColor: deviceType.backgroundColor || '#EFF6FF',
      active: deviceType.active !== false,
      priority: deviceType.priority || 0
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this device type?')) {
      try {
        const response = await fetch(`/api/device-types/${id}`, { method: 'DELETE' });
        if (response.ok) {
          await fetchDeviceTypes();
        }
      } catch (error) {
        console.error('Error deleting device type:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      icon: 'smartphone',
      iconType: 'lucide',
      customIcon: '',
      iconColor: '#3B82F6',
      backgroundColor: '#EFF6FF',
      active: true,
      priority: 0
    });
    setEditingType(null);
    setShowForm(false);
    setShowIconGenerator(false);
  };

  const generateIcon = (deviceName) => {
    const suggestions = {
      phone: { icon: 'smartphone', emoji: '📱' },
      smartphone: { icon: 'smartphone', emoji: '📱' },
      mobile: { icon: 'smartphone', emoji: '📱' },
      laptop: { icon: 'laptop', emoji: '💻' },
      computer: { icon: 'laptop', emoji: '💻' },
      tablet: { icon: 'tablet', emoji: '🖥️' },
      ipad: { icon: 'tablet', emoji: '🖥️' },
      watch: { icon: 'watch', emoji: '⌚' },
      smartwatch: { icon: 'watch', emoji: '⌚' },
      headphone: { icon: 'headphones', emoji: '🎧' },
      headphones: { icon: 'headphones', emoji: '🎧' },
      earphone: { icon: 'headphones', emoji: '🎧' },
      camera: { icon: 'camera', emoji: '📷' },
      gaming: { icon: 'gamepad', emoji: '🎮' },
      console: { icon: 'gamepad', emoji: '🎮' },
      speaker: { icon: 'speaker', emoji: '📻' },
      monitor: { icon: 'monitor', emoji: '🖥️' },
      display: { icon: 'monitor', emoji: '🖥️' }
    };

    const deviceLower = deviceName.toLowerCase();
    for (const [key, value] of Object.entries(suggestions)) {
      if (deviceLower.includes(key)) {
        return value;
      }
    }
    return { icon: 'smartphone', emoji: '📱' };
  };

  const handleGenerateIcon = () => {
    const suggestion = generateIcon(formData.name);
    setFormData(prev => ({
      ...prev,
      icon: suggestion.icon,
      customIcon: suggestion.emoji
    }));
  };

  const renderIcon = (deviceType) => {
    const { 
      icon = 'smartphone', 
      iconType = 'lucide', 
      customIcon = '', 
      iconColor = '#3B82F6', 
      backgroundColor = '#EFF6FF' 
    } = deviceType;
    
    if (iconType === 'emoji' && customIcon) {
      return (
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
          style={{ backgroundColor }}
        >
          {customIcon}
        </div>
      );
    }
    
    if (iconType === 'custom' && customIcon) {
      return (
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor }}
          dangerouslySetInnerHTML={{ __html: customIcon }}
        />
      );
    }
    
    const IconComponent = lucideIcons[icon] || Smartphone;
    return (
      <div 
        className="w-12 h-12 rounded-full flex items-center justify-center"
        style={{ backgroundColor }}
      >
        <IconComponent className="h-6 w-6" style={{ color: iconColor }} />
      </div>
    );
  };

  const filteredDeviceTypes = deviceTypes.filter(type =>
    type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (type.description && type.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
          <h1 className="text-3xl font-bold text-gray-900">Device Types</h1>
          <p className="text-gray-600 mt-2">Manage device categories with custom icons and styling</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Device Type
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search device types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Device Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filteredDeviceTypes.map(type => (
          <div key={type.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              {renderIcon(type)}
              <div className="flex items-center space-x-2">
                {!type.active && (
                  <EyeOff className="h-4 w-4 text-gray-400" title="Inactive" />
                )}
                <button
                  onClick={() => handleEdit(type)}
                  className="text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(type.id)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{type.name}</h3>
            <p className="text-sm text-gray-600 mb-3">{type.description || 'No description'}</p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="bg-gray-100 px-2 py-1 rounded">/{type.slug}</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded capitalize">
                {type.iconType || 'lucide'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingType ? 'Edit Device Type' : 'Add Device Type'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name *
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
                    placeholder="Brief description of this device type"
                  />
                </div>

                {/* Icon Configuration */}
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Icon Configuration</h3>
                    <button
                      type="button"
                      onClick={handleGenerateIcon}
                      className="flex items-center text-sm text-blue-600 hover:text-blue-700"
                    >
                      <Wand2 className="h-4 w-4 mr-1" />
                      Auto Generate
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Icon Type
                      </label>
                      <select
                        name="iconType"
                        value={formData.iconType}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="lucide">Lucide Icons</option>
                        <option value="emoji">Emoji</option>
                        <option value="custom">Custom SVG</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Icon Color
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="color"
                          name="iconColor"
                          value={formData.iconColor}
                          onChange={handleInputChange}
                          className="w-12 h-9 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          name="iconColor"
                          value={formData.iconColor}
                          onChange={handleInputChange}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Background Color
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="color"
                          name="backgroundColor"
                          value={formData.backgroundColor}
                          onChange={handleInputChange}
                          className="w-12 h-9 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          name="backgroundColor"
                          value={formData.backgroundColor}
                          onChange={handleInputChange}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Icon Selection based on type */}
                  {formData.iconType === 'lucide' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Icon
                      </label>
                      <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                        {iconOptions.map(option => {
                          const IconComponent = option.icon;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, icon: option.value }))}
                              className={`p-3 border rounded-md flex items-center justify-center transition-colors ${
                                formData.icon === option.value
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-300 hover:border-gray-400'
                              }`}
                            >
                              <IconComponent className="h-5 w-5" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {formData.iconType === 'emoji' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Emoji or Enter Custom
                      </label>
                      <div className="grid grid-cols-10 gap-2 mb-3">
                        {emojiOptions.map(emoji => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, customIcon: emoji }))}
                            className={`p-2 border rounded text-xl transition-colors ${
                              formData.customIcon === emoji
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        name="customIcon"
                        value={formData.customIcon}
                        onChange={handleInputChange}
                        placeholder="Or enter custom emoji"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  {formData.iconType === 'custom' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Custom SVG Code
                      </label>
                      <textarea
                        name="customIcon"
                        value={formData.customIcon}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder="Paste your SVG code here..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                      />
                    </div>
                  )}

                  {/* Preview */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preview
                    </label>
                    <div className="flex items-center space-x-4">
                      {renderIcon(formData)}
                      <div>
                        <p className="font-medium">{formData.name || 'Device Type Name'}</p>
                        <p className="text-sm text-gray-600">{formData.description || 'Description'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Settings */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priority (0-100)
                      </label>
                      <input
                        type="number"
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        min="0"
                        max="100"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Higher priority items appear first</p>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="active"
                        checked={formData.active}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        Active (visible to users)
                      </label>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center transition-colors"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {editingType ? 'Update' : 'Create'}
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

export default AdminDeviceTypesEnhanced;