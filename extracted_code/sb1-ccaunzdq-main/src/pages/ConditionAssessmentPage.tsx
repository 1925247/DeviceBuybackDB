import React, { useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Check, HelpCircle } from 'lucide-react';

import { deviceTypes } from '/home/project/src/db/devicetype.ts';
import { brands } from '/home/project/src/db/brands.ts';
import { deviceModels } from '/home/project/src/db/models.ts';
import conditionQuestions from '/home/project/src/db/conditionQuestionsAns.ts';


// Helper function to retrieve the device model data based on deviceType, brand, and model slug.
const getDeviceModelData = (deviceType: string, brand: string, modelSlug: string) => {
  const foundModel = deviceModels.find(
    (m) =>
      m.deviceType === deviceType &&
      m.brand.toLowerCase() === brand.toLowerCase() &&
      m.slug === modelSlug // <-- Compare with slug now.
  );
  if (foundModel) {
    return foundModel;
  }
  // Fallback: create a display name from the modelSlug.
  const fallbackName = modelSlug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  return { id: modelSlug, name: fallbackName, image: 'https://via.placeholder.com/150', variants: [] };
};

const ConditionAssessmentPage: React.FC = () => {
  // Get URL parameters for deviceType, brand, and model (slug).
  const { deviceType, brand, model } = useParams<{ deviceType: string; brand: string; model: string }>();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const variant = queryParams.get('variant'); // Extract the selected variant from the URL

  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [tooltipVisible, setTooltipVisible] = useState<string | null>(null);
  const navigate = useNavigate();

  // Validate that required parameters exist and that there are condition questions for this device type.
  if (
    !deviceType ||
    !brand ||
    !model ||
    !conditionQuestions[deviceType as keyof typeof conditionQuestions]
  ) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Device Not Found</h2>
          <p className="mb-8">Sorry, we couldn't find the device you're looking for.</p>
          <Link
            to="/"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition duration-300"
          >
            Go Back Home
          </Link>
        </div>
      </div>
    );
  }

  // Retrieve device model details using slug.
  const { name: modelName, image: modelImage } = getDeviceModelData(deviceType, brand, model);
  const questions = conditionQuestions[deviceType as keyof typeof conditionQuestions];

  // Find display names for device type and brand using slug matching.
  const deviceTypeObj = deviceTypes.find((dt) => dt.slug === deviceType);
  const deviceTypeName = deviceTypeObj ? deviceTypeObj.name : deviceType;
  const brandObj = brands.find((b) => b.slug.toLowerCase() === brand.toLowerCase());
  const brandName = brandObj ? brandObj.name : brand;

  // Handler for selecting an answer.
  const handleAnswerSelect = (questionId: string, optionId: string, multiSelect?: boolean) => {
    setAnswers((prev) => {
      if (multiSelect) {
        const prevSelections = (prev[questionId] as string[]) || [];
        if (prevSelections.includes(optionId)) {
          return { ...prev, [questionId]: prevSelections.filter((id) => id !== optionId) };
        } else {
          return { ...prev, [questionId]: [...prevSelections, optionId] };
        }
      }
      return { ...prev, [questionId]: optionId };
    });
  };

  // Handler for submitting the answers.
  const handleSubmit = () => {
    let conditionScore = 1.0;
    let answeredQuestions = 0;

    questions.forEach((question) => {
      const answer = answers[question.id];
      if (answer) {
        answeredQuestions++;
        if (Array.isArray(answer)) {
          // For multi-select questions, average the scores of the selected options.
          const scores = question.options
            .filter((option) => answer.includes(option.id))
            .map((option) => option.value);
          if (scores.length > 0) {
            const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
            conditionScore *= avgScore;
          }
        } else {
          const selectedOption = question.options.find((option) => option.id === answer);
          if (selectedOption) {
            conditionScore *= selectedOption.value;
          }
        }
      }
    });

    // Ensure all questions are answered before proceeding.
    if (answeredQuestions === questions.length) {
      localStorage.setItem(
        'deviceCondition',
        JSON.stringify({
          deviceType,
          brand,
          model,
          modelName,
          answers,
          conditionScore,
        })
      );
      navigate(`/sell/${deviceType}/${brand}/${model}/valuation?variant=${encodeURIComponent(variant || '')}`);
    } else {
      alert('Please answer all questions to proceed.');
    }
  };

  // Toggle tooltip for question explanation.
  const toggleTooltip = (questionId: string) => {
    setTooltipVisible((prev) => (prev === questionId ? null : questionId));
  };

  // Check if all questions have been answered.
  const allQuestionsAnswered = questions.every((question) => {
    const answer = answers[question.id];
    return question.multiSelect ? (Array.isArray(answer) && answer.length > 0) : !!answer;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Link to={`/sell/${deviceType}/${brand}`} className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to {brandName} Models
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-2">Assess Your Device Condition</h1>
      <p className="text-gray-600 mb-8">
        Tell us about the condition of your {modelName} {variant ? `(${variant})` : ''} to get an accurate price estimate.
      </p>

      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex items-center mb-6">
          <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
            <img src={modelImage} alt={modelName} className="w-16 h-16 object-contain" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">
              {modelName} {variant ? `(${variant})` : ''}  {/* Display model name with selected variant */}
            </h2>
            <p className="text-gray-600">{deviceTypeName}</p>
          </div>
        </div>

        <div className="space-y-8">
          {questions.map((question) => (
            <div key={question.id} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
              <div className="flex items-start mb-4">
                <h3 className="text-lg font-medium flex-grow">{question.question}</h3>
                <button onClick={() => toggleTooltip(question.id)} className="text-gray-400 hover:text-gray-600">
                  <HelpCircle className="h-5 w-5" />
                </button>
              </div>
              {tooltipVisible === question.id && (
                <div className="bg-blue-50 text-blue-800 p-3 rounded-md mb-4 text-sm">
                  {question.tooltip}
                </div>
              )}
              <div className="space-y-3">
                {question.options.map((option) => (
                  <div
                    key={option.id}
                    onClick={() => handleAnswerSelect(question.id, option.id, question.multiSelect)}
                    className={`flex items-center p-3 rounded-md cursor-pointer border ${
                      question.multiSelect
                        ? Array.isArray(answers[question.id]) && answers[question.id].includes(option.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                        : answers[question.id] === option.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center ${
                        question.multiSelect
                          ? Array.isArray(answers[question.id]) && answers[question.id].includes(option.id)
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200'
                          : answers[question.id] === option.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200'
                      }`}
                    >
                      {((!question.multiSelect && answers[question.id] === option.id) ||
                        (question.multiSelect &&
                          Array.isArray(answers[question.id]) &&
                          answers[question.id].includes(option.id))) && (
                        <Check className="h-3 w-3" />
                      )}
                    </div>
                    <span>{option.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-between items-center">
        <Link
          to={`/sell/${deviceType}/${brand}`}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-300"
        >
          Back
        </Link>
        <button
          onClick={handleSubmit}
          disabled={!allQuestionsAnswered}
          className={`px-8 py-3 rounded-lg font-medium ${
            allQuestionsAnswered ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          } transition duration-300`}
        >
          Get Price Estimate
        </button>
      </div>
    </div>
  );
};

export default ConditionAssessmentPage;
