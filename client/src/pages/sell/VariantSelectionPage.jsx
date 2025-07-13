import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, IndianRupee, Smartphone, Star } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const VariantSelectionPage = () => {
  const { deviceType, brand, model } = useParams();
  const navigate = useNavigate();
  const [variants, setVariants] = useState([]);
  const [modelInfo, setModelInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVariants();
  }, [deviceType, brand, model]);

  const fetchVariants = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/device-model-variants/${model}`);
      if (!response.ok) {
        throw new Error('Failed to fetch variants');
      }
      const data = await response.json();
      setVariants(data.variants || []);
      setModelInfo(data.model || null);
      
      // If no variants exist, redirect to condition assessment
      if (data.variants && data.variants.length === 0) {
        navigate(`/sell/${deviceType}/${brand}/${model}/condition`);
      }
    } catch (error) {
      console.error('Error fetching variants:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVariantSelect = (variant) => {
    navigate(`/sell/${deviceType}/${brand}/${model}/${variant.slug}/condition`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Variants</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            to={`/sell/${deviceType}/${brand}`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Models
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
                {modelInfo?.name || `${brand} ${model}`.replace(/[_-]/g, ' ')}
              </h1>
              <p className="text-lg text-teal-600 font-medium">
                150+ already sold
              </p>
            </div>

            {/* Variants Selection */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Choose a variant
              </h2>
              
              {variants.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500 text-lg mb-4">
                    No variants available for this model
                  </div>
                  <Link
                    to={`/sell/${deviceType}/${brand}/${model}/condition`}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Continue with Base Model
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => handleVariantSelect(variant)}
                      className="bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-blue-300 rounded-xl p-6 text-center transition-all duration-200 hover:shadow-md"
                    >
                      <div className="text-lg font-semibold text-gray-900">
                        {variant.storage || variant.variantName}
                      </div>
                      {variant.color && (
                        <div className="text-sm text-gray-600 mt-1">
                          {variant.color}
                        </div>
                      )}
                      {variant.ram && (
                        <div className="text-xs text-gray-500 mt-1">
                          {variant.ram} RAM
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Get Exact Value Button */}
            <div className="text-center lg:text-left">
              <button
                onClick={() => {
                  if (variants.length > 0) {
                    // If variants exist, user needs to select one first
                    alert('Please select a variant first');
                  } else {
                    // If no variants, continue to condition assessment
                    navigate(`/sell/${deviceType}/${brand}/${model}/condition`);
                  }
                }}
                className="bg-gray-300 text-gray-600 px-8 py-4 rounded-xl font-semibold text-lg cursor-not-allowed"
                disabled={variants.length > 0}
              >
                Get Exact Value →
              </button>
            </div>
          </div>
        </div>

        {/* Back Navigation */}
        <div className="mt-12 text-center">
          <Link
            to={`/sell/${deviceType}/${brand}`}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 font-medium"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to {brand} Models
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VariantSelectionPage;