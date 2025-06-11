import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AdminConditionQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeviceType, setSelectedDeviceType] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [formData, setFormData] = useState({
    question: '',
    device_type_id: '',
    order: 1,
    active: true,
    options: [
      { text: '', value: '', impact: 0 }
    ]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [questionsRes, deviceTypesRes] = await Promise.all([
        fetch('/api/condition-questions'),
        fetch('/api/device-types')
      ]);

      if (questionsRes.ok && deviceTypesRes.ok) {
        const [questionsData, deviceTypesData] = await Promise.all([
          questionsRes.json(),
          deviceTypesRes.json()
        ]);

        setQuestions(questionsData);
        setDeviceTypes(deviceTypesData);
      } else {
        // Mock data fallback
        setQuestions([
          {
            id: 1,
            question: 'What is the overall condition of your device?',
            device_type_id: 1,
            order: 1,
            active: true,
            options: [
              { text: 'Excellent - Like new', value: 'excellent', impact: 0 },
              { text: 'Good - Minor wear', value: 'good', impact: -15 },
              { text: 'Fair - Visible wear', value: 'fair', impact: -30 },
              { text: 'Poor - Significant damage', value: 'poor', impact: -50 }
            ]
          },
          {
            id: 2,
            question: 'Does the screen have any cracks or damage?',
            device_type_id: 1,
            order: 2,
            active: true,
            options: [
              { text: 'No damage', value: 'no_damage', impact: 0 },
              { text: 'Minor scratches', value: 'minor_scratches', impact: -10 },
              { text: 'Visible cracks', value: 'cracks', impact: -40 },
              { text: 'Severely damaged', value: 'severe_damage', impact: -70 }
            ]
          }
        ]);
        setDeviceTypes([
          { id: 1, name: 'Smartphone' },
          { id: 2, name: 'Laptop' },
          { id: 3, name: 'Tablet' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleOptionChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((option, i) => 
        i === index ? { ...option, [field]: value } : option
      )
    }));
  };

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, { text: '', value: '', impact: 0 }]
    }));
  };

  const removeOption = (index) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingQuestion ? `/api/condition-questions/${editingQuestion.id}` : '/api/condition-questions';
      const method = editingQuestion ? 'PUT' : 'POST';
      
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
      console.error('Error saving question:', error);
    }
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setFormData({
      question: question.question,
      device_type_id: question.device_type_id,
      order: question.order,
      active: question.active,
      options: question.options || [{ text: '', value: '', impact: 0 }]
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        const response = await fetch(`/api/condition-questions/${id}`, { method: 'DELETE' });
        if (response.ok) {
          await fetchData();
        }
      } catch (error) {
        console.error('Error deleting question:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      question: '',
      device_type_id: '',
      order: 1,
      active: true,
      options: [{ text: '', value: '', impact: 0 }]
    });
    setEditingQuestion(null);
    setShowForm(false);
  };

  const toggleExpanded = (questionId) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const getDeviceTypeName = (deviceTypeId) => {
    const deviceType = deviceTypes.find(dt => dt.id === deviceTypeId);
    return deviceType ? deviceType.name : 'All Types';
  };

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.question.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDeviceType = !selectedDeviceType || question.device_type_id.toString() === selectedDeviceType;
    
    return matchesSearch && matchesDeviceType;
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
          <h1 className="text-3xl font-bold text-gray-900">Condition Questions</h1>
          <p className="text-gray-600 mt-2">Manage device condition assessment questions</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
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
              setSelectedDeviceType('');
            }}
            className="px-3 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.map(question => (
          <div key={question.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <HelpCircle className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-medium text-gray-900">{question.question}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      question.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {question.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Device Type: {getDeviceTypeName(question.device_type_id)}</span>
                    <span>Order: {question.order}</span>
                    <span>Options: {question.options?.length || 0}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleExpanded(question.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {expandedQuestions[question.id] ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(question)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(question.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Expanded Options */}
              {expandedQuestions[question.id] && question.options && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Answer Options:</h4>
                  <div className="space-y-2">
                    {question.options.map((option, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div>
                          <span className="font-medium text-gray-900">{option.text}</span>
                          <span className="text-sm text-gray-500 ml-2">({option.value})</span>
                        </div>
                        <span className={`text-sm font-medium ${
                          option.impact >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {option.impact >= 0 ? '+' : ''}{option.impact}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredQuestions.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg">
            <HelpCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No questions found</p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingQuestion ? 'Edit Question' : 'Add Question'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Text *
                </label>
                <textarea
                  name="question"
                  value={formData.question}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order
                  </label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="active"
                      checked={formData.active}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span className="text-sm">Active</span>
                  </label>
                </div>
              </div>

              {/* Answer Options */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Answer Options *
                  </label>
                  <button
                    type="button"
                    onClick={addOption}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    + Add Option
                  </button>
                </div>
                
                <div className="space-y-3">
                  {formData.options.map((option, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center p-3 border border-gray-200 rounded-md">
                      <div className="col-span-5">
                        <input
                          type="text"
                          placeholder="Option text"
                          value={option.text}
                          onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="text"
                          placeholder="Value"
                          value={option.value}
                          onChange={(e) => handleOptionChange(index, 'value', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div className="col-span-3">
                        <div className="flex items-center">
                          <input
                            type="number"
                            placeholder="Impact %"
                            value={option.impact}
                            onChange={(e) => handleOptionChange(index, 'impact', parseInt(e.target.value) || 0)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <span className="ml-1 text-xs text-gray-500">%</span>
                        </div>
                      </div>
                      <div className="col-span-1">
                        {formData.options.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeOption(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
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
                  {editingQuestion ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminConditionQuestions;