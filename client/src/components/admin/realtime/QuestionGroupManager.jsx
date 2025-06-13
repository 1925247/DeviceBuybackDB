import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, Trash2, Edit, HelpCircle, Move, Eye, EyeOff,
  ChevronDown, ChevronRight, Link, Unlink, Target
} from 'lucide-react';
import { TextEditor, PercentageEditor } from './RealtimeEditor';

const QuestionGroupManager = () => {
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    groupType: 'assessment',
    deductionRate: '0'
  });

  const queryClient = useQueryClient();

  // Fetch question groups
  const { data: questionGroups = [], isLoading } = useQuery({
    queryKey: ['question-groups'],
    queryFn: async () => {
      const response = await fetch('/api/question-groups');
      if (!response.ok) throw new Error('Failed to fetch question groups');
      return response.json();
    }
  });

  // Fetch models for mapping
  const { data: models = [] } = useQuery({
    queryKey: ['device-models'],
    queryFn: async () => {
      const response = await fetch('/api/device-models');
      if (!response.ok) throw new Error('Failed to fetch models');
      return response.json();
    }
  });

  // Create group mutation
  const createGroupMutation = useMutation({
    mutationFn: async (groupData) => {
      const response = await fetch('/api/question-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupData)
      });
      if (!response.ok) throw new Error('Failed to create group');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['question-groups']);
      setShowAddForm(false);
      setNewGroup({ name: '', description: '', groupType: 'assessment', deductionRate: '0' });
    }
  });

  // Delete group mutation
  const deleteGroupMutation = useMutation({
    mutationFn: async (groupId) => {
      const response = await fetch(`/api/question-groups/${groupId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete group');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['question-groups']);
    }
  });

  // Map group to model mutation
  const mapGroupToModelMutation = useMutation({
    mutationFn: async ({ groupId, modelId, autoDeductionRate }) => {
      const response = await fetch('/api/question-model-mappings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionGroupId: groupId,
          modelId,
          autoDeductionRate
        })
      });
      if (!response.ok) throw new Error('Failed to map group to model');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['question-groups']);
      setShowMappingModal(false);
    }
  });

  const toggleGroupExpansion = (groupId) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const handleCreateGroup = () => {
    if (!newGroup.name.trim()) {
      alert('Please enter a group name');
      return;
    }

    createGroupMutation.mutate({
      name: newGroup.name,
      description: newGroup.description,
      groupType: newGroup.groupType,
      deductionRate: parseFloat(newGroup.deductionRate)
    });
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
          <h2 className="text-2xl font-bold text-gray-900">Question Group Manager</h2>
          <p className="text-gray-600 mt-1">Organize questions into groups and map them to device models</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowMappingModal(true)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Link className="h-4 w-4 mr-2" />
            Manage Mappings
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Question Group
          </button>
        </div>
      </div>

      {/* Add New Group Form */}
      {showAddForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Add New Question Group</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
              <input
                type="text"
                value={newGroup.name}
                onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Group 22, Screen Assessment"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Group Type</label>
              <select
                value={newGroup.groupType}
                onChange={(e) => setNewGroup({ ...newGroup, groupType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="assessment">Assessment</option>
                <option value="functional">Functional</option>
                <option value="cosmetic">Cosmetic</option>
                <option value="technical">Technical</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Deduction Rate (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={newGroup.deductionRate}
                onChange={(e) => setNewGroup({ ...newGroup, deductionRate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={newGroup.description}
                onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of this group"
              />
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
              onClick={handleCreateGroup}
              disabled={createGroupMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {createGroupMutation.isPending ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </div>
      )}

      {/* Question Groups List */}
      <div className="space-y-4">
        {questionGroups.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Question Groups</h3>
            <p className="text-gray-600 mb-4">Create your first question group to organize your assessment questions.</p>
          </div>
        ) : (
          questionGroups.map((group) => (
            <div key={group.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div 
                className="px-6 py-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleGroupExpansion(group.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {expandedGroups.has(group.id) ? (
                      <ChevronDown className="h-5 w-5 text-gray-500 mr-3" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-500 mr-3" />
                    )}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{group.name}</h3>
                      <p className="text-sm text-gray-600">{group.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <span className="text-sm font-medium text-gray-900">
                        {group.deductionRate}% deduction
                      </span>
                      <div className="text-xs text-gray-500">
                        {group.questionCount || 0} questions
                      </div>
                    </div>
                    
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      group.groupType === 'assessment' ? 'bg-blue-100 text-blue-800' :
                      group.groupType === 'functional' ? 'bg-green-100 text-green-800' :
                      group.groupType === 'cosmetic' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {group.groupType}
                    </span>
                    
                    <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedGroup(group)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit Group"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete "${group.name}"?`)) {
                            deleteGroupMutation.mutate(group.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Group"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {expandedGroups.has(group.id) && (
                <div className="px-6 py-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                      <TextEditor
                        value={group.name}
                        field="name"
                        endpoint="question-groups"
                        id={group.id}
                        placeholder="Enter group name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <TextEditor
                        value={group.description}
                        field="description"
                        endpoint="question-groups"
                        id={group.id}
                        placeholder="Enter description"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Deduction Rate</label>
                      <PercentageEditor
                        value={group.deductionRate}
                        field="deductionRate"
                        endpoint="question-groups"
                        id={group.id}
                      />
                    </div>
                  </div>
                  
                  {/* Model Mappings */}
                  {group.modelMappings && group.modelMappings.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Mapped Models</h4>
                      <div className="flex flex-wrap gap-2">
                        {group.modelMappings.map((mapping) => (
                          <span
                            key={mapping.id}
                            className="inline-flex items-center px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full"
                          >
                            <Target className="h-3 w-3 mr-1" />
                            {mapping.modelName} ({mapping.autoDeductionRate}%)
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Model Mapping Modal */}
      {showMappingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Question Group to Model Mappings</h3>
              <button
                onClick={() => setShowMappingModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            {/* Mapping interface would go here */}
            <div className="space-y-4">
              <p className="text-gray-600">
                Map question groups to specific device models to automatically apply deduction rates.
              </p>
              
              {/* This would be a more complex interface for managing mappings */}
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-700">
                  Advanced mapping interface coming soon. This will allow you to:
                </p>
                <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
                  <li>Map multiple groups to single models</li>
                  <li>Set auto-deduction rates per mapping</li>
                  <li>Bulk import/export mappings</li>
                  <li>Preview pricing impact</li>
                </ul>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowMappingModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionGroupManager;