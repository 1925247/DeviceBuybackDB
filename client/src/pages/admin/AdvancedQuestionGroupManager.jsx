import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Settings, Copy, ArrowRight, CheckCircle, AlertCircle,
  Target, Users, Layers, ChevronDown, ChevronRight, Filter, Search
} from 'lucide-react';
import SEOHead from '../../components/SEOHead';

const AdvancedQuestionGroupManager = () => {
  const [questionGroups, setQuestionGroups] = useState([]);
  const [deviceModels, setDeviceModels] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedModels, setSelectedModels] = useState([]);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const [filterText, setFilterText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [groupForm, setGroupForm] = useState({
    name: '',
    statement: '',
    description: '',
    category: 'general',
    deviceTypes: [],
    icon: '',
    color: '#3B82F6',
    sortOrder: 0,
    isReusable: true
  });

  const categories = [
    { value: 'all', label: 'All Categories', color: 'bg-gray-100' },
    { value: 'body', label: 'Body & Physical', color: 'bg-red-100' },
    { value: 'screen', label: 'Screen & Display', color: 'bg-blue-100' },
    { value: 'functional', label: 'Functional Issues', color: 'bg-purple-100' },
    { value: 'warranty', label: 'One Month Warranty', color: 'bg-green-100' },
    { value: 'accessories', label: 'Accessories', color: 'bg-yellow-100' },
    { value: 'battery', label: 'Battery & Power', color: 'bg-orange-100' },
    { value: 'connectivity', label: 'Connectivity', color: 'bg-indigo-100' }
  ];

  const deviceTypes = [
    { value: 'smartphone', label: 'Smartphones' },
    { value: 'laptop', label: 'Laptops' },
    { value: 'tablet', label: 'Tablets' },
    { value: 'smartwatch', label: 'Smartwatches' }
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [groupsRes, modelsRes, brandsRes] = await Promise.all([
        fetch('/api/flexible-question-groups/stats'),
        fetch('/api/device-models'),
        fetch('/api/brands')
      ]);

      if (groupsRes.ok) setQuestionGroups(await groupsRes.json());
      if (modelsRes.ok) setDeviceModels(await modelsRes.json());
      if (brandsRes.ok) setBrands(await brandsRes.json());
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    try {
      const response = await fetch('/api/flexible-question-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupForm)
      });

      if (response.ok) {
        await fetchInitialData();
        setShowGroupModal(false);
        resetGroupForm();
      }
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const handleMapGroupToModels = async () => {
    if (!selectedGroup || selectedModels.length === 0) return;

    try {
      const response = await fetch(`/api/flexible-question-groups/${selectedGroup.id}/map-models`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelIds: selectedModels,
          replaceExisting: false
        })
      });

      if (response.ok) {
        await fetchInitialData();
        setShowMappingModal(false);
        setSelectedModels([]);
      }
    } catch (error) {
      console.error('Error mapping group to models:', error);
    }
  };

  const resetGroupForm = () => {
    setGroupForm({
      name: '',
      statement: '',
      description: '',
      category: 'general',
      deviceTypes: [],
      icon: '',
      color: '#3B82F6',
      sortOrder: 0,
      isReusable: true
    });
  };

  const toggleGroupExpansion = (groupId) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const filteredGroups = questionGroups.filter(group => {
    const matchesText = group.name.toLowerCase().includes(filterText.toLowerCase()) ||
                       group.description?.toLowerCase().includes(filterText.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || group.category === selectedCategory;
    return matchesText && matchesCategory;
  });

  const getCategoryColor = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.color : 'bg-gray-100';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <SEOHead 
        title="Advanced Question Group Manager - Cash Old Device Admin"
        description="Manage flexible question groups with full control over model mappings and deduction rates"
        canonical="/admin/advanced-question-groups"
      />

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advanced Question Group Manager</h1>
          <p className="text-gray-600 mt-2">Full control over group mappings and model-specific configurations</p>
        </div>
        <button
          onClick={() => setShowGroupModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Create Group
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search groups..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="md:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-lg p-2 mr-3">
              <Layers className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Groups</p>
              <p className="text-2xl font-bold text-gray-900">{questionGroups.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-lg p-2 mr-3">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Mapped Models</p>
              <p className="text-2xl font-bold text-gray-900">
                {questionGroups.reduce((sum, g) => sum + (g.mapped_model_count || 0), 0)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="bg-purple-100 rounded-lg p-2 mr-3">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Questions</p>
              <p className="text-2xl font-bold text-gray-900">
                {questionGroups.reduce((sum, g) => sum + (g.question_count || 0), 0)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="bg-orange-100 rounded-lg p-2 mr-3">
              <CheckCircle className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Groups</p>
              <p className="text-2xl font-bold text-gray-900">
                {questionGroups.filter(g => g.active).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Question Groups List */}
      <div className="space-y-4">
        {filteredGroups.map(group => (
          <div key={group.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => toggleGroupExpansion(group.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {expandedGroups.has(group.id) ? 
                      <ChevronDown className="h-5 w-5" /> : 
                      <ChevronRight className="h-5 w-5" />
                    }
                  </button>
                  
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(group.category)} text-gray-800`}>
                        {group.category}
                      </span>
                      {group.is_reusable && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          Reusable
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mt-1">{group.statement}</p>
                    {group.description && (
                      <p className="text-sm text-gray-500 mt-1">{group.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right text-sm text-gray-500">
                    <div>{group.question_count || 0} questions</div>
                    <div>{group.mapped_model_count || 0} models</div>
                  </div>
                  
                  <button
                    onClick={() => {
                      setSelectedGroup(group);
                      setShowMappingModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50"
                    title="Map to Models"
                  >
                    <Target className="h-5 w-5" />
                  </button>
                  
                  <button
                    onClick={() => {
                      setGroupForm({...group, deviceTypes: group.device_types || []});
                      setShowGroupModal(true);
                    }}
                    className="text-gray-600 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-50"
                    title="Edit Group"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedGroups.has(group.id) && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Mapped Models</h4>
                      <div className="text-sm text-gray-600">
                        {group.mapped_model_count > 0 ? (
                          <p>{group.mapped_model_count} models mapped to this group</p>
                        ) : (
                          <p>No models mapped yet</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Questions</h4>
                      <div className="text-sm text-gray-600">
                        {group.question_count > 0 ? (
                          <p>{group.question_count} questions in this group</p>
                        ) : (
                          <p>No questions created yet</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex space-x-3">
                    <button
                      onClick={() => {
                        // Navigate to question builder for this group
                        window.location.href = `/admin/question-builder?groupId=${group.id}`;
                      }}
                      className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-200"
                    >
                      Manage Questions
                    </button>
                    
                    <button
                      onClick={() => {
                        setSelectedGroup(group);
                        setShowMappingModal(true);
                      }}
                      className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-200"
                    >
                      Configure Mappings
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Group Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {groupForm.id ? 'Edit' : 'Create'} Question Group
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Group Name</label>
                <input
                  type="text"
                  value={groupForm.name}
                  onChange={(e) => setGroupForm({...groupForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Body Condition, Screen Issues"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Statement</label>
                <input
                  type="text"
                  value={groupForm.statement}
                  onChange={(e) => setGroupForm({...groupForm, statement: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Question prompt shown to users"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={groupForm.description}
                  onChange={(e) => setGroupForm({...groupForm, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Internal description for admin reference"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={groupForm.category}
                    onChange={(e) => setGroupForm({...groupForm, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.filter(c => c.value !== 'all').map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort Order</label>
                  <input
                    type="number"
                    value={groupForm.sortOrder}
                    onChange={(e) => setGroupForm({...groupForm, sortOrder: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Device Types</label>
                <div className="grid grid-cols-2 gap-2">
                  {deviceTypes.map(type => (
                    <label key={type.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={groupForm.deviceTypes.includes(type.value)}
                        onChange={(e) => {
                          const newTypes = e.target.checked
                            ? [...groupForm.deviceTypes, type.value]
                            : groupForm.deviceTypes.filter(t => t !== type.value);
                          setGroupForm({...groupForm, deviceTypes: newTypes});
                        }}
                        className="mr-2"
                      />
                      {type.label}
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={groupForm.isReusable}
                  onChange={(e) => setGroupForm({...groupForm, isReusable: e.target.checked})}
                  className="mr-2"
                />
                <label className="text-sm text-gray-700">Make this group reusable across multiple models</label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowGroupModal(false);
                  resetGroupForm();
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {groupForm.id ? 'Update' : 'Create'} Group
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Model Mapping Modal */}
      {showMappingModal && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Map "{selectedGroup.name}" to Device Models
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Available Models</h3>
                <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg">
                  {deviceModels.map(model => (
                    <label key={model.id} className="flex items-center p-3 hover:bg-gray-50 border-b border-gray-100">
                      <input
                        type="checkbox"
                        checked={selectedModels.includes(model.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedModels([...selectedModels, model.id]);
                          } else {
                            setSelectedModels(selectedModels.filter(id => id !== model.id));
                          }
                        }}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium">{model.name}</div>
                        <div className="text-sm text-gray-500">{model.brand_name} • {model.device_type_name}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Selected Models ({selectedModels.length})
                </h3>
                <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg bg-gray-50">
                  {selectedModels.length === 0 ? (
                    <p className="p-4 text-gray-500 text-center">No models selected</p>
                  ) : (
                    selectedModels.map(modelId => {
                      const model = deviceModels.find(m => m.id === modelId);
                      return model ? (
                        <div key={modelId} className="p-3 border-b border-gray-200">
                          <div className="font-medium">{model.name}</div>
                          <div className="text-sm text-gray-500">{model.brand_name}</div>
                        </div>
                      ) : null;
                    })
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowMappingModal(false);
                  setSelectedModels([]);
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleMapGroupToModels}
                disabled={selectedModels.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Map to {selectedModels.length} Model{selectedModels.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedQuestionGroupManager;