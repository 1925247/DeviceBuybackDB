import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const ConditionAssessmentPage = () => {
  const { deviceType, brand, model } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    fetchConditionQuestions();
  }, [deviceType, brand, model]);

  const fetchConditionQuestions = async () => {
    try {
      setLoading(true);
      console.log('Fetching condition questions for:', { deviceType, brand, model });
      
      const response = await fetch(`/api/condition-questions?deviceType=${deviceType}&brand=${brand}&model=${model}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received questions:', data);
      
      if (Array.isArray(data) && data.length > 0) {
        setQuestions(data);
      } else {
        console.log('No questions received, using fallback questions');
        setQuestions([
          {
            id: 1,
            question: "What is the overall condition of your device?",
            type: "multiple_choice",
            options: [
              { id: 1, text: "Excellent - Like new", value: "excellent" },
              { id: 2, text: "Good - Minor wear", value: "good" },
              { id: 3, text: "Fair - Visible wear", value: "fair" },
              { id: 4, text: "Poor - Significant damage", value: "poor" }
            ]
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching condition questions:', error);
      // Set fallback questions
      setQuestions([
        {
          id: 1,
          question: "What is the overall condition of your device?",
          type: "multiple_choice",
          options: [
            { id: 1, text: "Excellent - Like new", value: "excellent" },
            { id: 2, text: "Good - Minor wear", value: "good" },
            { id: 3, text: "Fair - Visible wear", value: "fair" },
            { id: 4, text: "Poor - Significant damage", value: "poor" }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Store answers in sessionStorage for valuation page
      sessionStorage.setItem('conditionAnswers', JSON.stringify(answers));
      navigate(`/sell/${deviceType}/${brand}/${model}/valuation`);
    } catch (error) {
      console.error('Error submitting answers:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const isAnswered = currentQuestion && answers[currentQuestion.id];
  const allAnswered = questions.every(q => answers[q.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              No Assessment Questions Available
            </h2>
            <p className="text-gray-600 mb-6">
              We don't have condition assessment questions for this specific device model yet.
            </p>
            <button
              onClick={() => navigate(`/sell/${deviceType}/${brand}/${model}/valuation`)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continue to Valuation
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span>{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Device Condition Assessment
          </h2>

          {currentQuestion && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-6">
                {currentQuestion.question}
              </h3>

              <div className="space-y-3">
                {currentQuestion.options?.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(currentQuestion.id, option.value)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                      answers[currentQuestion.id] === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {option.text || option.answer}
                      </span>
                      {answers[currentQuestion.id] === option.value && (
                        <Check className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="text-center">
            <button
              onClick={() => navigate(`/sell/${deviceType}/${brand}`)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Back to Models
            </button>
          </div>

          <button
            onClick={handleNext}
            disabled={!isAnswered || submitting}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <LoadingSpinner size="small" />
            ) : currentQuestionIndex === questions.length - 1 ? (
              'Get Valuation'
            ) : (
              'Next'
            )}
          </button>
        </div>

        {/* Question Overview */}
        {questions.length > 1 && (
          <div className="mt-8 bg-white rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Assessment Progress</h4>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                    index === currentQuestionIndex
                      ? 'bg-blue-600 text-white'
                      : answers[questions[index]?.id]
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConditionAssessmentPage;