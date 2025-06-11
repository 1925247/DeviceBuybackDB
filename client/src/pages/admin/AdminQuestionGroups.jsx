import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Settings, Users, ArrowUp, ArrowDown } from 'lucide-react';

const AdminQuestionGroups = () => {
  const [questionGroups, setQuestionGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showQuestions, setShowQuestions] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'general',
    deviceTypes: [],
    sortOrder: 0,
    active: true
  });

  const categories = [
    { value: 'general', label: 'General Assessment', color: 'bg-gray-100 text-gray-800' },
    { value: 'screen', label: 'Screen & Display', color: 'bg-blue-100 text-blue-800' },
    { value: 'battery', label: 'Battery & Power', color: 'bg-green-100 text-green-800' },
    { value: 'physical', label: 'Physical Condition', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'functional', label: 'Functionality', color: 'bg-purple-100 text-purple-800' },
    { value: 'connectivity', label: 'Connectivity', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'storage', label: 'Storage & Memory', color: 'bg-pink-100 text-pink-800' }
  ];

  const deviceTypeOptions = [
    { value: 'smartphone', label: 'Smartphones' },
    { value: 'laptop', label: 'Laptops' },
    { value: 'tablet', label: 'Tablets' },
    { value: 'smartwatch', label: 'Smartwatches' },
    { value: 'headphones', label: 'Headphones' },
    { value: 'gaming', label: 'Gaming Devices' }
  ];

  useEffect(() => {
    fetchQuestionGroups();
  }, []);

  const fetchQuestionGroups = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/question-groups');
      if (response.ok) {
        const data = await response.json();
        setQuestionGroups(data);
      }
    } catch (error) {
      console.error('Error fetching question groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingGroup ? `/api/question-groups/${editingGroup.id}` : '/api/question-groups';
      const method = editingGroup ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          deviceTypes: formData.deviceTypes.length > 0 ? formData.deviceTypes : null
        })
      });

      if (response.ok) {
        await fetchQuestionGroups();
        resetForm();
        setShowCreateModal(false);
        setEditingGroup(null);
      }
    } catch (error) {
      console.error('Error saving question group:', error);
    }
  };

  const handleDelete = async (groupId) => {
    if (!confirm('Are you sure you want to delete this question group?')) return;
    
    try {
      const response = await fetch(`/api/question-groups/${groupId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchQuestionGroups();
      }
    } catch (error) {
      console.error('Error deleting question group:', error);
    }
  };

  const handleEdit = (group) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      description: group.description || '',
      category: group.category || 'general',
      deviceTypes: group.device_types || [],
      sortOrder: group.sort_order || 0,
      active: group.active
    });
    setShowCreateModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'general',
      deviceTypes: [],
      sortOrder: 0,
      active: true
    });
  };

  const updateSortOrder = async (groupId, direction) => {
    try {
      const response = await fetch(`/api/question-groups/${groupId}/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction })
      });

      if (response.ok) {
        await fetchQuestionGroups();
      }
    } catch (error) {
      console.error('Error updating sort order:', error);
    }
  };

  const getCategoryStyle = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.color : 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Question Groups Management</h1>
            <p className="text-gray-600 mt-2">Create and manage question groups for device assessments</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Group
          </button>
        </div>
      </div>

      {/* Question Groups List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Question Groups ({questionGroups.length})</h2>
        </div>
        
        {questionGroups.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Question Groups</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first question group</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Create First Group
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {questionGroups.map((group) => (
              <div key={group.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-gray-900">{group.name}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryStyle(group.category)}`}>
                        {categories.find(c => c.value === group.category)?.label || group.category}
                      </span>
                      {!group.active && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                          Inactive
                        </span>
                      )}
                    </div>
                    
                    {group.description && (
                      <p className="text-gray-600 mt-1">{group.description}</p>
                    )}
                    
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>Sort Order: {group.sort_order}</span>
                      {group.device_types && group.device_types.length > 0 && (
                        <span>Device Types: {group.device_types.join(', ')}</span>
                      )}
                      <span>Created: {new Date(group.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateSortOrder(group.id, 'up')}
                      className="p-2 text-gray-400 hover:text-gray-600"
                      title="Move Up"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => updateSortOrder(group.id, 'down')}
                      className="p-2 text-gray-400 hover:text-gray-600"
                      title="Move Down"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedGroup(group);
                        setShowQuestions(true);
                      }}
                      className="p-2 text-blue-600 hover:text-blue-800"
                      title="Manage Questions"
                    >
                      <Settings className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(group)}
                      className="p-2 text-gray-600 hover:text-gray-800"
                      title="Edit Group"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(group.id)}
                      className="p-2 text-red-600 hover:text-red-800"
                      title="Delete Group"
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

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {editingGroup ? 'Edit Question Group' : 'Create New Question Group'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Group Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Applicable Device Types</label>
                <div className="grid grid-cols-2 gap-2">
                  {deviceTypeOptions.map(device => (
                    <label key={device.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.deviceTypes.includes(device.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              deviceTypes: [...formData.deviceTypes, device.value]
                            });
                          } else {
                            setFormData({
                              ...formData,
                              deviceTypes: formData.deviceTypes.filter(t => t !== device.value)
                            });
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">{device.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort Order</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={formData.active ? 'active' : 'inactive'}
                    onChange={(e) => setFormData({ ...formData, active: e.target.value === 'active' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingGroup(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingGroup ? 'Update Group' : 'Create Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Questions Management Modal */}
      {showQuestions && selectedGroup && (
        <QuestionManagementModal
          group={selectedGroup}
          onClose={() => {
            setShowQuestions(false);
            setSelectedGroup(null);
          }}
        />
      )}
    </div>
  );
};

// Questions Management Modal Component
const QuestionManagementModal = ({ group, onClose }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, [group.id]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/question-groups/${group.id}/questions`);
      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">Manage Questions - {group.name}</h2>
            <p className="text-gray-600">Add and configure questions for this group</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="large" />
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Questions ({questions.length})</h3>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </button>
            </div>

            {questions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No questions found for this group.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question) => (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium">{question.text}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Type: {question.type} | Required: {question.required ? 'Yes' : 'No'}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-800">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminQuestionGroups;