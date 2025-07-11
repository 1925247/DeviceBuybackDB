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
    navigate(`/sell/${deviceType}/${brand}/${model}/${variant.slug}/value`);
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
              <li className="text-gray-900 font-medium">
                {modelInfo?.name || model}
              </li>
            </ol>
          </nav>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Choose a variant
            </h1>
            <p className="text-lg text-gray-600">
              Select the storage capacity for your {modelInfo?.name || model}
            </p>
          </div>
        </div>

        {/* Model Info Card */}
        {modelInfo && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
                  {modelInfo.image ? (
                    <img
                      src={modelInfo.image}
                      alt={modelInfo.name}
                      className="w-20 h-20 object-contain rounded-lg"
                    />
                  ) : (
                    <Smartphone className="h-12 w-12 text-gray-400" />
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{modelInfo.name}</h2>
                <p className="text-gray-600">
                  Popular model
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Variants Grid */}
        {variants.length === 0 ? (
          <div className="text-center py-12">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {variants.map((variant) => (
              <div
                key={variant.id}
                onClick={() => handleVariantSelect(variant)}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200 hover:border-blue-300 p-6 text-center"
              >
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {variant.storage || variant.variantName}
                  </h3>
                  {variant.color && (
                    <p className="text-gray-600">{variant.color}</p>
                  )}
                  {variant.ram && (
                    <p className="text-sm text-gray-500">{variant.ram} RAM</p>
                  )}
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center justify-center gap-1 text-green-600 font-bold text-2xl">
                    <IndianRupee className="h-6 w-6" />
                    {variant.basePrice?.toLocaleString('en-IN') || 'N/A'}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Maximum offer</p>
                </div>



                <div className="flex items-center justify-center text-blue-600 font-medium">
                  Get Exact Value
                  <ArrowRight className="h-4 w-4 ml-2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Link
            to={`/sell/${deviceType}/${brand}`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Models
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VariantSelectionPage;