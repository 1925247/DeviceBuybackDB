import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Check, HelpCircle, Loader2 } from 'lucide-react';


// Define interfaces for our data types
interface DeviceType {
  id: number;
  name: string;
  slug: string;
  icon: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface Brand {
  id: number;
  name: string;
  slug: string;
  logo: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface DeviceModel {
  id: number;
  name: string;
  slug: string;
  brand_id: number;
  device_type_id: number;
  image: string;
  active: boolean;
  featured: boolean;
  variants: string[];
  brand?: Brand;
  deviceType?: DeviceType;
  created_at: string;
  updated_at: string;
}

interface ConditionQuestion {
  id: number;
  device_type_id: number;
  question: string;
  tooltip?: string;
  order: number;
  active: boolean;
  multiSelect?: boolean;
  options: ConditionOption[];
}

interface ConditionOption {
  id: string;
  label: string;
  value: number;
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
  
  // State for data from API
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [deviceModels, setDeviceModels] = useState<DeviceModel[]>([]);
  const [conditionQuestions, setConditionQuestions] = useState<ConditionQuestion[]>([]);
  
  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all required data in parallel
        const [
          deviceTypesResponse, 
          brandsResponse, 
          deviceModelsResponse, 
          conditionQuestionsResponse
        ] = await Promise.all([
          fetch('/api/device-types'),
          fetch('/api/brands'),
          fetch('/api/device-models'),
          fetch(`/api/condition-questions${deviceType ? `?deviceTypeId=${getDeviceTypeId(deviceType)}` : ''}`)
        ]);
        
        if (!deviceTypesResponse.ok) throw new Error('Failed to fetch device types');
        if (!brandsResponse.ok) throw new Error('Failed to fetch brands');
        if (!deviceModelsResponse.ok) throw new Error('Failed to fetch device models');
        if (!conditionQuestionsResponse.ok) throw new Error('Failed to fetch condition questions');
        
        const deviceTypesData = await deviceTypesResponse.json();
        const brandsData = await brandsResponse.json();
        const deviceModelsData = await deviceModelsResponse.json();
        const conditionQuestionsData = await conditionQuestionsResponse.json();
        
        setDeviceTypes(deviceTypesData);
        setBrands(brandsData);
        setDeviceModels(deviceModelsData);
        setConditionQuestions(conditionQuestionsData);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [deviceType]);
  
  // Helper function to get device type ID from slug
  const getDeviceTypeId = (slug: string): number | undefined => {
    const foundType = deviceTypes.find(type => type.slug === slug);
    return foundType?.id;
  };
  
  // Show loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-xl font-medium">Loading condition assessment...</h2>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4 text-red-600">Error Loading Data</h2>
          <p className="mb-8 text-gray-700">{error}</p>
          <div className="flex justify-center space-x-4">
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition duration-300"
            >
              Try Again
            </button>
            <Link
              to="/"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition duration-300"
            >
              Go Back Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Validate that required parameters exist and that there are condition questions
  if (!deviceType || !brand || !model || conditionQuestions.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Device Not Found</h2>
          <p className="mb-8">Sorry, we couldn't find the device or condition questions for the device you're looking for.</p>
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

  // Find the device model using its slug
  const deviceModelObj = deviceModels.find(m => 
    m.slug === model && 
    m.brand?.slug === brand
  );
  
  if (!deviceModelObj) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Model Not Found</h2>
          <p className="mb-8">Sorry, we couldn't find the specific model you're looking for.</p>
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
  
  const modelName = deviceModelObj.name;
  const modelImage = deviceModelObj.image;
  
  // Find device type and brand objects
  const deviceTypeObj = deviceTypes.find(dt => dt.slug === deviceType);
  const deviceTypeName = deviceTypeObj ? deviceTypeObj.name : deviceType;
  const brandObj = brands.find(b => b.slug === brand);
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

    conditionQuestions.forEach((question) => {
      const answer = answers[question.id.toString()];
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
    if (answeredQuestions === conditionQuestions.length) {
      // Store the assessment data
      localStorage.setItem(
        'deviceCondition',
        JSON.stringify({
          deviceType,
          brand,
          model,
          modelName,
          variant,
          answers,
          conditionScore,
          deviceModelId: deviceModelObj.id,
        })
      );
      
      // Navigate to valuation page
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
  const allQuestionsAnswered = conditionQuestions.every((question) => {
    const answer = answers[question.id.toString()];
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
            <img 
              src={modelImage} 
              alt={modelName} 
              className="w-16 h-16 object-contain"
              onError={(e) => {
                const imgElement = e.currentTarget;
                imgElement.src = `https://placehold.co/160x160?text=${encodeURIComponent(modelName)}`;
                imgElement.onerror = null;
              }}
            />
          </div>
          <div>
            <h2 className="text-xl font-semibold">
              {modelName} {variant ? `(${variant})` : ''}
            </h2>
            <p className="text-gray-600">{deviceTypeName}</p>
          </div>
        </div>

        <div className="space-y-8">
          {conditionQuestions.map((question) => (
            <div key={question.id} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
              <div className="flex items-start mb-4">
                <h3 className="text-lg font-medium flex-grow">{question.question}</h3>
                {question.tooltip && (
                  <button 
                    onClick={() => toggleTooltip(question.id.toString())} 
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <HelpCircle className="h-5 w-5" />
                  </button>
                )}
              </div>
              {tooltipVisible === question.id.toString() && question.tooltip && (
                <div className="bg-blue-50 text-blue-800 p-3 rounded-md mb-4 text-sm">
                  {question.tooltip}
                </div>
              )}
              <div className="space-y-3">
                {question.options.map((option) => (
                  <div
                    key={option.id}
                    onClick={() => handleAnswerSelect(question.id.toString(), option.id, question.multiSelect)}
                    className={`flex items-center p-3 rounded-md cursor-pointer border ${
                      question.multiSelect
                        ? Array.isArray(answers[question.id.toString()]) && answers[question.id.toString()]?.includes(option.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                        : answers[question.id.toString()] === option.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center ${
                        question.multiSelect
                          ? Array.isArray(answers[question.id.toString()]) && answers[question.id.toString()]?.includes(option.id)
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200'
                          : answers[question.id.toString()] === option.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200'
                      }`}
                    >
                      {((!question.multiSelect && answers[question.id.toString()] === option.id) ||
                        (question.multiSelect &&
                          Array.isArray(answers[question.id.toString()]) &&
                          answers[question.id.toString()]?.includes(option.id))) && (
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
