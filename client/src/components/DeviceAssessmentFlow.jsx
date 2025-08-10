import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check, AlertCircle, HelpCircle } from 'lucide-react';

const DeviceAssessmentFlow = () => {
  const { deviceType, brand, model, variant } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [totalImpact, setTotalImpact] = useState(0);

  // Assessment steps configuration
  const steps = [
    {
      id: 'physical',
      title: 'Physical Condition',
      description: 'Assess the exterior and physical state of your device',
      icon: '📱',
      color: 'blue'
    },
    {
      id: 'screen',
      title: 'Screen & Display',
      description: 'Check screen quality, cracks, and display functionality',
      icon: '📺',
      color: 'green'
    },
    {
      id: 'functionality',
      title: 'Functionality',
      description: 'Test buttons, ports, and core device functions',
      icon: '⚙️',
      color: 'purple'
    },
    {
      id: 'battery',
      title: 'Battery & Performance',
      description: 'Evaluate battery life and device performance',
      icon: '🔋',
      color: 'orange'
    }
  ];

  useEffect(() => {
    fetchQuestions();
    fetchDeviceInfo();
  }, [deviceType, brand, model]);

  const fetchQuestions = async () => {
    try {
      console.log('Fetching mapped questions for:', { deviceType, brand, model });
      
      // Use the new model-specific questions API that only returns mapped questions
      const response = await fetch(`/api/model-specific-questions?deviceType=${deviceType}&brand=${brand}&model=${model}`);
      const data = await response.json();
      
      console.log('Received mapped questions:', data);
      
      if (!data || data.length === 0) {
        console.log('No questions mapped to this model');
        setQuestions(steps.map(step => ({ ...step, questions: [] })));
        setLoading(false);
        return;
      }
      
      // Group questions by category for step-by-step assessment
      const groupedQuestions = steps.map(step => ({
        ...step,
        questions: data.filter(q => q.category === step.id || q.group === step.id)
      }));
      
      setQuestions(groupedQuestions);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching mapped questions:', error);
      setLoading(false);
    }
  };

  const fetchDeviceInfo = async () => {
    try {
      const response = await fetch(`/api/device-models`);
      const models = await response.json();
      const foundModel = models.find(m => m.slug === model);
      setDeviceInfo(foundModel);
    } catch (error) {
      console.error('Error fetching device info:', error);
    }
  };

  const handleAnswerChange = (questionId, answerId, impact) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { answerId, impact }
    }));
  };

  const calculateTotalImpact = () => {
    return Object.values(answers).reduce((sum, answer) => sum + (answer.impact || 0), 0);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - save answers and navigate to valuation
      const impact = calculateTotalImpact();
      setTotalImpact(impact);
      
      sessionStorage.setItem('conditionAnswers', JSON.stringify(answers));
      sessionStorage.setItem('totalImpact', impact.toString());
      sessionStorage.setItem('deviceInfo', JSON.stringify(deviceInfo));
      
      const valuationPath = variant 
        ? `/sell/${deviceType}/${brand}/${model}/${variant}/valuation`
        : `/sell/${deviceType}/${brand}/${model}/valuation`;
      navigate(valuationPath);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate(-1);
    }
  };

  const isStepComplete = (stepIndex) => {
    const step = questions[stepIndex];
    if (!step?.questions) return false;
    
    return step.questions.every(question => answers[question.id]);
  };

  const getStepProgress = () => {
    const completedSteps = questions.filter((_, index) => isStepComplete(index)).length;
    return Math.round((completedSteps / steps.length) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assessment questions...</p>
        </div>
      </div>
    );
  }

  const currentStepData = questions[currentStep];
  const stepColor = steps[currentStep]?.color || 'blue';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Device Assessment</h1>
              <p className="text-sm text-gray-600">
                {deviceInfo?.name || model} - Step {currentStep + 1} of {steps.length}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Progress</div>
              <div className="text-lg font-semibold text-gray-900">{getStepProgress()}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4 py-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex-1 flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${index === currentStep 
                    ? `bg-${stepColor}-600 text-white` 
                    : index < currentStep 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }
                `}>
                  {index < currentStep ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <div className={`text-sm font-medium ${
                    index === currentStep ? `text-${stepColor}-600` : 
                    index < currentStep ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </div>
                  {index !== steps.length - 1 && (
                    <div className="mt-1 h-1 bg-gray-200 rounded-full">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          index < currentStep ? 'bg-green-600' : 
                          index === currentStep ? `bg-${stepColor}-600` : 'bg-gray-200'
                        }`}
                        style={{ width: index < currentStep ? '100%' : '0%' }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <div className={`w-12 h-12 rounded-lg bg-${stepColor}-100 flex items-center justify-center text-2xl mr-4`}>
                {steps[currentStep]?.icon}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{currentStepData?.title}</h2>
                <p className="text-gray-600">{currentStepData?.description}</p>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-6">
            {currentStepData?.questions?.map((question, index) => (
              <div key={question.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {question.question_text}
                    </h3>
                    {question.description && (
                      <p className="text-sm text-gray-600 mb-3">{question.description}</p>
                    )}
                  </div>
                  <div className="ml-4">
                    <HelpCircle className="h-5 w-5 text-gray-400" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {question.answer_choices?.map((choice) => (
                    <label
                      key={choice.id}
                      className={`
                        flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all
                        ${answers[question.id]?.answerId === choice.id
                          ? `border-${stepColor}-600 bg-${stepColor}-50`
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={choice.id}
                        checked={answers[question.id]?.answerId === choice.id}
                        onChange={() => handleAnswerChange(question.id, choice.id, choice.impact_percentage)}
                        className="sr-only"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{choice.choice_text}</div>
                        {choice.description && (
                          <div className="text-sm text-gray-600 mt-1">{choice.description}</div>
                        )}
                      </div>
                      {choice.impact_percentage !== 0 && (
                        <div className={`
                          text-xs px-2 py-1 rounded-full font-medium
                          ${choice.impact_percentage > 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                          }
                        `}>
                          {choice.impact_percentage > 0 ? '+' : ''}{choice.impact_percentage}%
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handlePrevious}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </button>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {Object.keys(answers).filter(key => 
                  currentStepData?.questions?.some(q => q.id.toString() === key)
                ).length} of {currentStepData?.questions?.length || 0} answered
              </div>
              
              <button
                onClick={handleNext}
                disabled={!isStepComplete(currentStep)}
                className={`
                  flex items-center px-6 py-2 rounded-md font-medium
                  ${isStepComplete(currentStep)
                    ? `bg-${stepColor}-600 text-white hover:bg-${stepColor}-700`
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                {currentStep === steps.length - 1 ? 'Get Valuation' : 'Continue'}
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceAssessmentFlow;