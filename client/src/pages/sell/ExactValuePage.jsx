import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, IndianRupee, Smartphone, Star, Info } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <nav className="flex mb-4" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm text-gray-500">
              <li>
                <Link to="/sell" className="hover:text-gray-700">Sell Device</Link>
              </li>
              <li>
                <ArrowRight className="h-4 w-4" />
              </li>
              <li>
                <Link to={`/sell/${deviceType}`} className="hover:text-gray-700 capitalize">
                  {deviceType}
                </Link>
              </li>
              <li>
                <ArrowRight className="h-4 w-4" />
              </li>
              <li>
                <Link to={`/sell/${deviceType}/${brand}`} className="hover:text-gray-700 capitalize">
                  {brand}
                </Link>
              </li>
              <li>
                <ArrowRight className="h-4 w-4" />
              </li>
              <li>
                <Link to={`/sell/${deviceType}/${brand}/${model}/variants`} className="hover:text-gray-700">
                  {modelInfo?.name || model}
                </Link>
              </li>
              <li>
                <ArrowRight className="h-4 w-4" />
              </li>
              <li className="text-gray-900 font-medium">
                {variantInfo.storage || variantInfo.variantName}
              </li>
            </ol>
          </nav>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Get Exact Value
            </h1>
            <p className="text-lg text-gray-600">
              Your device's maximum possible value
            </p>
          </div>
        </div>

        {/* Device Value Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center">
            {/* Device Image */}
            <div className="w-32 h-32 mx-auto mb-6 bg-gray-100 rounded-lg flex items-center justify-center">
              {modelInfo?.image ? (
                <img
                  src={modelInfo.image}
                  alt={modelInfo.name}
                  className="w-28 h-28 object-contain rounded-lg"
                />
              ) : (
                <Smartphone className="h-16 w-16 text-gray-400" />
              )}
            </div>

            {/* Device Details */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {modelInfo?.name || model}
              </h2>
              <p className="text-lg text-gray-600 mb-1">
                {variantInfo.storage && variantInfo.ram 
                  ? `${variantInfo.ram}/${variantInfo.storage}`
                  : variantInfo.storage || variantInfo.variantName}
              </p>
              {variantInfo.color && (
                <p className="text-gray-500">{variantInfo.color}</p>
              )}
            </div>

            {/* Price Display */}
            <div className="mb-6">
              <div className="text-sm text-gray-500 mb-2">Get Upto</div>
              <div className="flex items-center justify-center gap-2 text-green-600 font-bold text-4xl mb-2">
                <IndianRupee className="h-8 w-8" />
                {variantInfo.basePrice?.toLocaleString('en-IN') || 'N/A'}
              </div>
              <p className="text-sm text-gray-500">
                Maximum possible value before condition assessment
              </p>
            </div>

            {/* Popular indicator */}
            <div className="mb-6">
              <div className="flex items-center justify-center gap-1 text-gray-600">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">
                  Popular choice
                </span>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleGetExactValue}
              className="w-full max-w-md mx-auto bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              Get Exact Value
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Information Card */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">How it works</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• The price shown is the maximum possible value for your device</li>
                <li>• Final offer will be calculated based on your device's actual condition</li>
                <li>• Assessment takes only 2-3 minutes with simple questions</li>
                <li>• Get instant quote with no hidden charges</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <Link
            to={`/sell/${deviceType}/${brand}/${model}/variants`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Variants
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ExactValuePage;