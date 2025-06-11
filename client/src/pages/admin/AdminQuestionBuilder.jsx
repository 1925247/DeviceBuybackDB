import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, ArrowLeft, ArrowUp, ArrowDown, Copy, Target } from 'lucide-react';

const AdminQuestionBuilder = () => {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [questionGroups, setQuestionGroups] = useState([]);
  const [devices, setDevices] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showModelAssignment, setShowModelAssignment] = useState(false);

  const [questionForm, setQuestionForm] = useState({
    text: '',
    type: 'multiple_choice',
    required: true,
    helpText: '',
    sortOrder: 0,
    active: true,
    deviceModelIds: [],
    brandIds: [],
    answers: []
  });

  const questionTypes = [
    { value: 'multiple_choice', label: 'Multiple Choice' },
    { value: 'yes_no', label: 'Yes/No' },
    { value: 'text', label: 'Text Input' },
    { value: 'number', label: 'Number Input' },
    { value: 'rating', label: 'Rating Scale' }
  ];

  const severityLevels = [
    { value: 'none', label: 'No Impact', color: 'green', impact: 0 },
    { value: 'minor', label: 'Minor Issue', color: 'yellow', impact: -5 },
    { value: 'major', label: 'Major Issue', color: 'orange', impact: -15 },
    { value: 'critical', label: 'Critical Issue', color: 'red', impact: -30 }
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchQuestions();
    }
  }, [selectedGroup]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [groupsRes, devicesRes, brandsRes] = await Promise.all([
        fetch('/api/question-groups'),
        fetch('/api/device-models'),
        fetch('/api/brands')
      ]);

      if (groupsRes.ok) setQuestionGroups(await groupsRes.json());
      if (devicesRes.ok) setDevices(await devicesRes.json());
      if (brandsRes.ok) setBrands(await brandsRes.json());
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`/api/question-groups/${selectedGroup.id}/questions`);
      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const handleCreateQuestion = () => {
    setEditingQuestion(null);
    setQuestionForm({
      text: '',
      type: 'multiple_choice',
      required: true,
      helpText: '',
      sortOrder: questions.length,
      active: true,
      deviceModelIds: [],
      brandIds: [],
      answers: [
        { text: 'Excellent condition', value: 'excellent', percentageImpact: 0, severity: 'none' },
        { text: 'Good condition', value: 'good', percentageImpact: -5, severity: 'minor' },
        { text: 'Fair condition', value: 'fair', percentageImpact: -15, severity: 'major' },
        { text: 'Poor condition', value: 'poor', percentageImpact: -30, severity: 'critical' }
      ]
    });
    setShowQuestionModal(true);
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setQuestionForm({
      text: question.text,
      type: question.type,
      required: question.required,
      helpText: question.help_text || '',
      sortOrder: question.sort_order,
      active: question.active,
      deviceModelIds: question.device_model_ids || [],
      brandIds: question.brand_ids || [],
      answers: question.answers || []
    });
    setShowQuestionModal(true);
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    try {
      const url = editingQuestion 
        ? `/api/questions/${editingQuestion.id}`
        : '/api/questions';
      const method = editingQuestion ? 'PUT' : 'POST';

      const payload = {
        ...questionForm,
        questionGroupId: selectedGroup.id,
        deviceModelIds: questionForm.deviceModelIds.length > 0 ? questionForm.deviceModelIds : null,
        brandIds: questionForm.brandIds.length > 0 ? questionForm.brandIds : null
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        await fetchQuestions();
        setShowQuestionModal(false);
        resetQuestionForm();
      }
    } catch (error) {
      console.error('Error saving question:', error);
    }
  };

  const resetQuestionForm = () => {
    setQuestionForm({
      text: '',
      type: 'multiple_choice',
      required: true,
      helpText: '',
      sortOrder: 0,
      active: true,
      deviceModelIds: [],
      brandIds: [],
      answers: []
    });
    setEditingQuestion(null);
  };

  const addAnswer = () => {
    setQuestionForm({
      ...questionForm,
      answers: [
        ...questionForm.answers,
        {
          text: '',
          value: '',
          percentageImpact: 0,
          severity: 'none',
          sortOrder: questionForm.answers.length
        }
      ]
    });
  };

  const updateAnswer = (index, field, value) => {
    const updatedAnswers = questionForm.answers.map((answer, i) => 
      i === index ? { ...answer, [field]: value } : answer
    );
    setQuestionForm({ ...questionForm, answers: updatedAnswers });
  };

  const removeAnswer = (index) => {
    const updatedAnswers = questionForm.answers.filter((_, i) => i !== index);
    setQuestionForm({ ...questionForm, answers: updatedAnswers });
  };

  const getSeverityStyle = (severity) => {
    const level = severityLevels.find(s => s.value === severity);
    if (!level) return 'bg-gray-100 text-gray-800';
    
    const colorMap = {
      green: 'bg-green-100 text-green-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      orange: 'bg-orange-100 text-orange-800',
      red: 'bg-red-100 text-red-800'
    };
    
    return colorMap[level.color] || 'bg-gray-100 text-gray-800';
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
        <div className="flex items-center space-x-4 mb-4">
          {selectedGroup && (
            <button
              onClick={() => setSelectedGroup(null)}
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Groups
            </button>
          )}
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900">
          {selectedGroup ? `Questions - ${selectedGroup.name}` : 'Question Builder'}
        </h1>
        <p className="text-gray-600 mt-2">
          {selectedGroup 
            ? 'Build detailed assessment questions with model-specific targeting'
            : 'Select a question group to start building questions'
          }
        </p>
      </div>

      {!selectedGroup ? (
        // Question Groups Selection
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {questionGroups.map((group) => (
            <div
              key={group.id}
              onClick={() => setSelectedGroup(group)}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg cursor-pointer transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  {group.category}
                </span>
              </div>
              
              {group.description && (
                <p className="text-gray-600 text-sm mb-3">{group.description}</p>
              )}
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Questions: {group.question_count || 0}</span>
                <span>Sort: {group.sort_order}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Questions Management
        <div className="space-y-6">
          {/* Header Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Questions ({questions.length})</h2>
                <p className="text-gray-600">Configure assessment questions for {selectedGroup.name}</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowModelAssignment(true)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Model Targeting
                </button>
                <button
                  onClick={handleCreateQuestion}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </button>
              </div>
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {questions.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Questions Yet</h3>
                <p className="text-gray-500 mb-6">Start building your assessment by adding questions</p>
                <button
                  onClick={handleCreateQuestion}
                  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
                >
                  Create First Question
                </button>
              </div>
            ) : (
              questions.map((question, index) => (
                <div key={question.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {index + 1}. {question.text}
                        </h3>
                        <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800">
                          {question.type}
                        </span>
                        {question.required && (
                          <span className="px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-800">
                            Required
                          </span>
                        )}
                      </div>
                      
                      {question.help_text && (
                        <p className="text-gray-600 text-sm mb-3">{question.help_text}</p>
                      )}
                      
                      {/* Model Targeting Info */}
                      {(question.device_model_ids?.length > 0 || question.brand_ids?.length > 0) && (
                        <div className="mb-3">
                          <span className="text-xs font-medium text-purple-700">Targeted to: </span>
                          {question.brand_ids?.length > 0 && (
                            <span className="text-xs text-purple-600">
                              {question.brand_ids.length} brand(s)
                            </span>
                          )}
                          {question.device_model_ids?.length > 0 && (
                            <span className="text-xs text-purple-600 ml-2">
                              {question.device_model_ids.length} model(s)
                            </span>
                          )}
                        </div>
                      )}
                      
                      {/* Answer Choices Preview */}
                      {question.answers && question.answers.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          {question.answers.slice(0, 4).map((answer, i) => (
                            <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                              <span>{answer.text}</span>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 text-xs rounded ${getSeverityStyle(answer.severity)}`}>
                                  {answer.percentage_impact || 0}%
                                </span>
                              </div>
                            </div>
                          ))}
                          {question.answers.length > 4 && (
                            <div className="text-xs text-gray-500 col-span-2">
                              +{question.answers.length - 4} more answers
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleEditQuestion(question)}
                        className="p-2 text-blue-600 hover:text-blue-800"
                        title="Edit Question"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        className="p-2 text-gray-600 hover:text-gray-800"
                        title="Copy Question"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        className="p-2 text-red-600 hover:text-red-800"
                        title="Delete Question"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Question Creation/Edit Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-6">
              {editingQuestion ? 'Edit Question' : 'Create New Question'}
            </h2>
            
            <form onSubmit={handleSaveQuestion} className="space-y-6">
              {/* Basic Question Info */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Question Text *</label>
                  <textarea
                    value={questionForm.text}
                    onChange={(e) => setQuestionForm({ ...questionForm, text: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your assessment question..."
                    required
                  />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Question Type</label>
                    <select
                      value={questionForm.type}
                      onChange={(e) => setQuestionForm({ ...questionForm, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {questionTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="required"
                      checked={questionForm.required}
                      onChange={(e) => setQuestionForm({ ...questionForm, required: e.target.checked })}
                      className="mr-2"
                    />
                    <label htmlFor="required" className="text-sm font-medium text-gray-700">Required Question</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="active"
                      checked={questionForm.active}
                      onChange={(e) => setQuestionForm({ ...questionForm, active: e.target.checked })}
                      className="mr-2"
                    />
                    <label htmlFor="active" className="text-sm font-medium text-gray-700">Active</label>
                  </div>
                </div>
              </div>

              {/* Help Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Help Text</label>
                <input
                  type="text"
                  value={questionForm.helpText}
                  onChange={(e) => setQuestionForm({ ...questionForm, helpText: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional help text to guide users..."
                />
              </div>

              {/* Answer Choices (for multiple choice questions) */}
              {(questionForm.type === 'multiple_choice' || questionForm.type === 'yes_no') && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Answer Choices</h3>
                    <button
                      type="button"
                      onClick={addAnswer}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Answer
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {questionForm.answers.map((answer, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                          <div className="md:col-span-4">
                            <input
                              type="text"
                              value={answer.text}
                              onChange={(e) => updateAnswer(index, 'text', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                              placeholder="Answer text..."
                            />
                          </div>
                          
                          <div className="md:col-span-2">
                            <input
                              type="text"
                              value={answer.value}
                              onChange={(e) => updateAnswer(index, 'value', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                              placeholder="Value..."
                            />
                          </div>
                          
                          <div className="md:col-span-2">
                            <input
                              type="number"
                              value={answer.percentageImpact || 0}
                              onChange={(e) => updateAnswer(index, 'percentageImpact', parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                              placeholder="% Impact"
                              step="0.1"
                            />
                          </div>
                          
                          <div className="md:col-span-3">
                            <select
                              value={answer.severity || 'none'}
                              onChange={(e) => updateAnswer(index, 'severity', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            >
                              {severityLevels.map(level => (
                                <option key={level.value} value={level.value}>{level.label}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="md:col-span-1">
                            <button
                              type="button"
                              onClick={() => removeAnswer(index)}
                              className="w-full p-2 text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowQuestionModal(false);
                    resetQuestionForm();
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingQuestion ? 'Update Question' : 'Create Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuestionBuilder;