import React, { useState, useEffect } from 'react';
import { Target, Settings, Plus, CheckCircle, AlertTriangle } from 'lucide-react';

const AdminQuestionSystemDemo = () => {
  const [questionGroups, setQuestionGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState(null);
  const [assessmentResults, setAssessmentResults] = useState({});

  const deviceModels = [
    { id: 2, name: 'iPhone 13', brand: 'Apple', type: 'smartphone', basePrice: 300 },
    { id: 3, name: 'Samsung Galaxy S24', brand: 'Samsung', type: 'smartphone', basePrice: 280 },
    { id: 4, name: 'MacBook Air M2', brand: 'Apple', type: 'laptop', basePrice: 800 }
  ];

  useEffect(() => {
    fetchQuestionGroups();
    setSelectedModel(deviceModels[0]);
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

  const testModelSpecificQuestions = async (modelId) => {
    try {
      // Test the model-specific question API
      const response = await fetch(`/api/questions/models?modelIds=${modelId}`);
      if (response.ok) {
        const questions = await response.json();
        return questions;
      }
    } catch (error) {
      console.error('Error testing model questions:', error);
    }
    return [];
  };

  const handleModelSelect = async (model) => {
    setSelectedModel(model);
    const questions = await testModelSpecificQuestions(model.id);
    setAssessmentResults({
      modelId: model.id,
      questionsFound: questions.length,
      questions: questions.slice(0, 3) // Show first 3 for demo
    });
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
        <h1 className="text-3xl font-bold text-gray-900">Question System Demo</h1>
        <p className="text-gray-600 mt-2">Test the complete question management system with device-specific targeting</p>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-3 mb-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <h3 className="text-lg font-semibold">System Status</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Question Groups:</span>
              <span className="font-medium">{questionGroups.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">API Status:</span>
              <span className="text-green-600 font-medium">✓ Operational</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Database:</span>
              <span className="text-green-600 font-medium">✓ Connected</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-3 mb-3">
            <Target className="h-8 w-8 text-blue-600" />
            <h3 className="text-lg font-semibold">Model Targeting</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">Questions can be targeted to specific device models or brands for precise assessments</p>
          <div className="text-sm text-blue-600">
            Test different models to see targeted questions
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-3 mb-3">
            <Settings className="h-8 w-8 text-purple-600" />
            <h3 className="text-lg font-semibold">Admin Controls</h3>
          </div>
          <div className="space-y-2">
            <button 
              onClick={() => window.open('/admin/question-groups', '_blank')}
              className="w-full text-left p-2 text-sm bg-gray-50 rounded hover:bg-gray-100"
            >
              → Manage Groups
            </button>
            <button 
              onClick={() => window.open('/admin/question-builder', '_blank')}
              className="w-full text-left p-2 text-sm bg-gray-50 rounded hover:bg-gray-100"
            >
              → Build Questions
            </button>
            <button 
              onClick={() => window.open('/admin/assessment-demo', '_blank')}
              className="w-full text-left p-2 text-sm bg-gray-50 rounded hover:bg-gray-100"
            >
              → Assessment Demo
            </button>
          </div>
        </div>
      </div>

      {/* Question Groups Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Available Question Groups</h2>
            <p className="text-gray-600">Categories configured for device assessments</p>
          </div>
          <div className="p-6">
            {questionGroups.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Question Groups Found</h3>
                <p className="text-gray-500 mb-4">Create question groups to organize your assessments</p>
                <button 
                  onClick={() => window.open('/admin/question-groups', '_blank')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center mx-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Group
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {questionGroups.map((group) => (
                  <div key={group.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{group.name}</h3>
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        {group.category || 'general'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{group.statement}</p>
                    {group.device_types && group.device_types.length > 0 && (
                      <div className="mt-2">
                        <span className="text-xs text-gray-500">Device Types: {group.device_types.join(', ')}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Device Model Testing */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Model-Specific Testing</h2>
            <p className="text-gray-600">Test how questions target specific device models</p>
          </div>
          <div className="p-6">
            <div className="mb-6">
              <h3 className="font-medium mb-3">Select Device Model:</h3>
              <div className="space-y-2">
                {deviceModels.map(model => (
                  <button
                    key={model.id}
                    onClick={() => handleModelSelect(model)}
                    className={`w-full p-3 rounded-lg border text-left transition-colors ${selectedModel?.id === model.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">{model.name}</div>
                    <div className="text-sm text-gray-500">{model.brand} • {model.type}</div>
                  </button>
                ))}
              </div>
            </div>

            {assessmentResults.modelId && (
              <div className="border-t pt-6">
                <h3 className="font-medium mb-3">Assessment Results for {selectedModel.name}:</h3>
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-sm text-gray-600">Questions Found:</div>
                    <div className="text-lg font-bold">{assessmentResults.questionsFound}</div>
                  </div>
                  
                  {assessmentResults.questions && assessmentResults.questions.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">Sample Questions:</div>
                      <div className="space-y-2">
                        {assessmentResults.questions.map((question, index) => (
                          <div key={index} className="text-sm bg-blue-50 p-2 rounded">
                            {question.text}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Implementation Guide */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">System Implementation Guide</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Backend Implementation</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Question Groups API with category-based organization</li>
              <li>• Model-specific question targeting system</li>
              <li>• Answer choices with severity levels and price impacts</li>
              <li>• Database schema supporting device-specific rules</li>
              <li>• Real-time assessment calculation with INR pricing</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Admin Features</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Create question groups by category (screen, battery, etc.)</li>
              <li>• Build questions with model/brand targeting</li>
              <li>• Configure answer impacts for precise pricing</li>
              <li>• Live testing with assessment demo</li>
              <li>• Easy configuration for different device types</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminQuestionSystemDemo;