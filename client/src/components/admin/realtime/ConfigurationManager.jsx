import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Plus, Save, Trash2, Edit, Code, Database, Palette, Globe } from 'lucide-react';
import { TextEditor } from './RealtimeEditor';

const ConfigurationManager = () => {
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newConfig, setNewConfig] = useState({
    configKey: '',
    configValue: '',
    configType: 'general',
    description: ''
  });

  const queryClient = useQueryClient();

  // Fetch configurations
  const { data: configurations = [], isLoading } = useQuery({
    queryKey: ['admin-configurations'],
    queryFn: async () => {
      const response = await fetch('/api/admin-configurations');
      if (!response.ok) throw new Error('Failed to fetch configurations');
      return response.json();
    }
  });

  // Create configuration mutation
  const createConfigMutation = useMutation({
    mutationFn: async (configData) => {
      const response = await fetch('/api/admin-configurations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...configData,
          configValue: JSON.parse(configData.configValue)
        })
      });
      if (!response.ok) throw new Error('Failed to create configuration');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-configurations']);
      setShowAddForm(false);
      setNewConfig({ configKey: '', configValue: '', configType: 'general', description: '' });
    }
  });

  // Delete configuration mutation
  const deleteConfigMutation = useMutation({
    mutationFn: async (configId) => {
      const response = await fetch(`/api/admin-configurations/${configId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete configuration');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-configurations']);
    }
  });

  const configCategories = [
    { key: 'general', name: 'General', icon: Settings },
    { key: 'pricing', name: 'Pricing', icon: Database },
    { key: 'ui', name: 'UI/Theme', icon: Palette },
    { key: 'api', name: 'API Settings', icon: Code },
    { key: 'localization', name: 'Localization', icon: Globe }
  ];

  const filteredConfigs = configurations.filter(config => 
    selectedCategory === 'general' || config.configType === selectedCategory
  );

  const handleCreateConfig = () => {
    if (!newConfig.configKey || !newConfig.configValue) {
      alert('Please fill in required fields');
      return;
    }

    try {
      // Validate JSON
      JSON.parse(newConfig.configValue);
      createConfigMutation.mutate(newConfig);
    } catch (error) {
      alert('Invalid JSON format in config value');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Configuration</h2>
          <p className="text-gray-600 mt-1">Manage platform settings and configurations</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Configuration
        </button>
      </div>

      <div className="flex space-x-6">
        {/* Category Sidebar */}
        <div className="w-64 bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Categories</h3>
          <nav className="space-y-1">
            {configCategories.map(category => {
              const IconComponent = category.icon;
              return (
                <button
                  key={category.key}
                  onClick={() => setSelectedCategory(category.key)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    selectedCategory === category.key
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent className="h-4 w-4 mr-3" />
                  {category.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Add Configuration Form */}
          {showAddForm && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Add New Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Config Key</label>
                  <input
                    type="text"
                    value={newConfig.configKey}
                    onChange={(e) => setNewConfig({ ...newConfig, configKey: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., max_upload_size, theme_primary_color"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={newConfig.configType}
                    onChange={(e) => setNewConfig({ ...newConfig, configType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    {configCategories.map(category => (
                      <option key={category.key} value={category.key}>{category.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={newConfig.description}
                    onChange={(e) => setNewConfig({ ...newConfig, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description of this configuration"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Config Value (JSON)</label>
                  <textarea
                    value={newConfig.configValue}
                    onChange={(e) => setNewConfig({ ...newConfig, configValue: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder='{"enabled": true, "value": 100, "options": ["option1", "option2"]}'
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter a valid JSON value. Examples: "string", 123, true, {"key": "value"}, ["item1", "item2"]
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateConfig}
                  disabled={createConfigMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {createConfigMutation.isPending ? 'Creating...' : 'Create Configuration'}
                </button>
              </div>
            </div>
          )}

          {/* Configurations List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {configCategories.find(c => c.key === selectedCategory)?.name} Configurations
              </h3>
            </div>
            
            {filteredConfigs.length === 0 ? (
              <div className="p-8 text-center">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Configurations</h3>
                <p className="text-gray-600 mb-4">Add your first configuration to get started.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredConfigs.map((config) => (
                  <div key={config.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h4 className="text-sm font-medium text-gray-900">{config.configKey}</h4>
                          <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            config.configType === 'general' ? 'bg-gray-100 text-gray-800' :
                            config.configType === 'pricing' ? 'bg-green-100 text-green-800' :
                            config.configType === 'ui' ? 'bg-purple-100 text-purple-800' :
                            config.configType === 'api' ? 'bg-blue-100 text-blue-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {config.configType}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">{config.description}</p>
                        
                        <div className="bg-gray-50 rounded-md p-3">
                          <code className="text-sm text-gray-800">
                            {JSON.stringify(config.configValue, null, 2)}
                          </code>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <button
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit Configuration"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete "${config.configKey}"?`)) {
                              deleteConfigMutation.mutate(config.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Configuration"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationManager;