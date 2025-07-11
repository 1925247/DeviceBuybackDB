import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, IndianRupee, Smartphone } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const ExactValuePage = () => {
  const { deviceType, brand, model, variant } = useParams();
  const navigate = useNavigate();
  const [variantInfo, setVariantInfo] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVariantInfo();
  }, [deviceType, brand, model, variant]);

  const fetchVariantInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/device-model-variants/${model}/${variant}`);
      if (!response.ok) {
        throw new Error('Failed to fetch variant information');
      }
      const data = await response.json();
      setVariantInfo(data.variant || null);
      setModelInfo(data.model || null);
    } catch (error) {
      console.error('Error fetching variant info:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGetExactValue = () => {
    navigate(`/sell/${deviceType}/${brand}/${model}/${variant}/condition`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !variantInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Variant</h2>
          <p className="text-gray-600 mb-4">{error || 'Variant not found'}</p>
          <Link
            to={`/sell/${deviceType}/${brand}/${model}/variants`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Variants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-12 items-center lg:items-start">
          {/* Left side - Device Image */}
          <div className="flex-shrink-0 text-center lg:text-left">
            <div className="w-48 h-64 mx-auto lg:mx-0 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-6">
              {modelInfo?.image ? (
                <img
                  src={modelInfo.image}
                  alt={modelInfo.name}
                  className="w-32 h-48 object-contain rounded-lg"
                />
              ) : (
                <Smartphone className="h-32 w-20 text-gray-400" />
              )}
            </div>
          </div>

          {/* Right side - Content */}
          <div className="flex-grow max-w-2xl">
            {/* Header */}
            <div className="text-center lg:text-left mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                {modelInfo?.name || `${brand} ${model}`.replace(/[_-]/g, ' ')} ({variantInfo?.storage || variantInfo?.variantName})
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                Get Upto
              </p>
              
              {/* Price Display */}
              <div className="mb-6">
                <div className="flex items-center justify-center lg:justify-start gap-1 text-red-500 font-bold text-5xl mb-2">
                  <IndianRupee className="h-10 w-10" />
                  <span>{variantInfo?.currentPrice?.toLocaleString('en-IN') || '18,930'}</span>
                </div>
                <p className="text-lg text-teal-600 font-medium">
                  50+ already sold
                </p>
              </div>

              {/* Get Exact Value Button */}
              <div className="text-center lg:text-left">
                <button
                  onClick={handleGetExactValue}
                  className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors duration-200 inline-flex items-center gap-2"
                >
                  Get Exact Value
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Back Navigation */}
        <div className="mt-12 text-center">
          <Link
            to={`/sell/${deviceType}/${brand}/${model}/variants`}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 font-medium"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Variants
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ExactValuePage;