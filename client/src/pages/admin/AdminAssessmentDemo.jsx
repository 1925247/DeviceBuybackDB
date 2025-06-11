import React, { useState, useEffect } from 'react';
import { Play, CheckCircle, AlertCircle, Settings, Target, Smartphone, Tablet, Laptop } from 'lucide-react';

const AdminAssessmentDemo = () => {
  const [questionGroups, setQuestionGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [totalImpact, setTotalImpact] = useState(0);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);

  const deviceModels = [
    { id: 2, name: 'iPhone 13', brand: 'Apple', type: 'smartphone', basePrice: 300 },
    { id: 3, name: 'Samsung Galaxy S24', brand: 'Samsung', type: 'smartphone', basePrice: 280 },
    { id: 4, name: 'MacBook Air M2', brand: 'Apple', type: 'laptop', basePrice: 800 },
    { id: 5, name: 'iPad Pro 12.9"', brand: 'Apple', type: 'tablet', basePrice: 600 }
  ];

  const [selectedDevice, setSelectedDevice] = useState(deviceModels[0]);

  useEffect(() => {
    fetchQuestionGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchGroupQuestions();
    }
  }, [selectedGroup]);

  useEffect(() => {
    calculateTotalImpact();
  }, [answers]);

  const fetchQuestionGroups = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/question-groups');
      if (response.ok) {
        const data = await response.json();
        setQuestionGroups(data);
        if (data.length > 0) {
          setSelectedGroup(data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching question groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupQuestions = async () => {
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

  const handleAnswerChange = (questionId, answerId, impact) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { answerId, impact }
    }));
  };

  const calculateTotalImpact = () => {
    const total = Object.values(answers).reduce((sum, answer) => sum + (answer.impact || 0), 0);
    setTotalImpact(total);
  };

  const calculateFinalPrice = () => {
    const basePrice = selectedDevice.basePrice;
    const adjustmentFactor = 1 + (totalImpact / 100);
    const finalUSD = Math.max(50, Math.round(basePrice * adjustmentFactor));
    const finalINR = Math.round(finalUSD * 83);
    return { usd: finalUSD, inr: finalINR, base: Math.round(basePrice * 83) };
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'none': return 'text-green-600 bg-green-100';
      case 'minor': return 'text-yellow-600 bg-yellow-100';
      case 'major': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDeviceIcon = (type) => {
    switch (type) {
      case 'smartphone': return <Smartphone className="h-5 w-5" />;
      case 'tablet': return <Tablet className="h-5 w-5" />;
      case 'laptop': return <Laptop className="h-5 w-5" />;
      default: return <Settings className="h-5 w-5" />;
    }
  };

  const startDemo = () => {
    setDemoMode(true);
    setAnswers({});
    setTotalImpact(0);
  };

  const resetDemo = () => {
    setDemoMode(false);
    setAnswers({});
    setTotalImpact(0);
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

  const prices = calculateFinalPrice();

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Assessment System Demo</h1>
        <p className="text-gray-600 mt-2">Test the question-based device assessment system with real pricing calculations</p>
      </div>

      {/* Demo Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Device Selection */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Select Device</h3>
          <div className="space-y-2">
            {deviceModels.map(device => (
              <button
                key={device.id}
                onClick={() => setSelectedDevice(device)}
                className={`w-full p-3 rounded-lg border text-left transition-colors ${selectedDevice.id === device.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {getDeviceIcon(device.type)}
                  <div>
                    <div className="font-medium">{device.name}</div>
                    <div className="text-sm text-gray-500">{device.brand} • ₹{Math.round(device.basePrice * 83).toLocaleString('en-IN')}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Question Group Selection */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Question Groups</h3>
          <div className="space-y-2">
            {questionGroups.map(group => (
              <button
                key={group.id}
                onClick={() => setSelectedGroup(group)}
                className={`w-full p-3 rounded-lg border text-left transition-colors ${selectedGroup?.id === group.id
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium">{group.name}</div>
                <div className="text-sm text-gray-500">{group.category}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Demo Status */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Demo Status</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Questions Answered:</span>
              <span className="font-medium">{Object.keys(answers).length}/{questions.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Price Impact:</span>
              <span className={`font-medium ${totalImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalImpact >= 0 ? '+' : ''}{totalImpact}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Estimated Value:</span>
              <span className="font-bold text-lg">₹{prices.inr.toLocaleString('en-IN')}</span>
            </div>
            
            {!demoMode ? (
              <button
                onClick={startDemo}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Assessment Demo
              </button>
            ) : (
              <button
                onClick={resetDemo}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
              >
                Reset Demo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Assessment Questions */}
      {demoMode && selectedGroup && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{selectedGroup.name} Assessment</h2>
                <p className="text-gray-600">{selectedGroup.description}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-gray-600">Device: {selectedDevice.name}</span>
              </div>
            </div>
          </div>

          <div className="p-6">
            {questions.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Questions Available</h3>
                <p className="text-gray-500">This question group doesn't have any questions yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {questions.map((question, index) => (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-medium mb-2">
                        {index + 1}. {question.text}
                        {question.required && <span className="text-red-500 ml-1">*</span>}
                      </h3>
                      {question.help_text && (
                        <p className="text-sm text-gray-600">{question.help_text}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {question.answers && question.answers.map(answer => (
                        <button
                          key={answer.id}
                          onClick={() => handleAnswerChange(question.id, answer.id, parseFloat(answer.percentage_impact || 0))}
                          className={`p-4 rounded-lg border text-left transition-all ${answers[question.id]?.answerId === answer.id
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{answer.text}</span>
                            {answers[question.id]?.answerId === answer.id && (
                              <CheckCircle className="h-5 w-5 text-blue-600" />
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(answer.severity)}`}>
                              {answer.severity}
                            </span>
                            <span className={`text-sm font-medium ${(answer.percentage_impact || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {(answer.percentage_impact || 0) >= 0 ? '+' : ''}{answer.percentage_impact || 0}%
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Results Summary */}
                {Object.keys(answers).length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300">
                    <h3 className="text-lg font-semibold mb-4">Assessment Results</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-white p-4 rounded-lg">
                        <div className="text-sm text-gray-600">Base Price</div>
                        <div className="text-xl font-bold">₹{prices.base.toLocaleString('en-IN')}</div>
                      </div>
                      
                      <div className="bg-white p-4 rounded-lg">
                        <div className="text-sm text-gray-600">Total Impact</div>
                        <div className={`text-xl font-bold ${totalImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {totalImpact >= 0 ? '+' : ''}{totalImpact}%
                        </div>
                      </div>
                      
                      <div className="bg-white p-4 rounded-lg border-2 border-blue-200">
                        <div className="text-sm text-gray-600">Final Offer</div>
                        <div className="text-2xl font-bold text-blue-600">₹{prices.inr.toLocaleString('en-IN')}</div>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600">
                      <strong>Assessment Summary:</strong> Based on your responses to {Object.keys(answers).length} questions, 
                      the device condition has been assessed with a {totalImpact}% price adjustment from the base market value.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAssessmentDemo;