import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, ChevronRight, Star } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import SEOHead from '../components/SEOHead';

const VariantSelectionPage = () => {
  const { deviceType, brand, model } = useParams();
  const navigate = useNavigate();
  const [selectedVariant, setSelectedVariant] = useState(null);

  // Fetch model and variants data
  const { data: models, isLoading } = useQuery({
    queryKey: ['/api/device-models', { deviceType, brand, includeDetails: true }],
    queryFn: () => 
      fetch(`/api/device-models?deviceType=${deviceType}&brand=${brand}&includeDetails=true`)
        .then(res => res.json())
  });

  const selectedModel = models?.find(m => m.slug === model);
  const variants = selectedModel?.variants || [];

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
    
    // Navigate to assessment with variant pricing
    const variantSlug = variant.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    const basePrice = variant.baseprice || variant.base_price || variant.currentprice || variant.current_price;
    
    console.log('Navigating to assessment with basePrice:', basePrice);
    
    navigate(`/assessment/${deviceType}/${brand}/${model}/${variantSlug}/valuation`, {
      state: {
        model: selectedModel,
        variant: variant,
        basePrice: basePrice
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!selectedModel) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Model Not Found</h2>
          <p className="text-gray-600">The requested model could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead 
        title={`${selectedModel.name} Variants - Choose Your Configuration`}
        description={`Select your ${selectedModel.name} variant and get instant pricing for device buyback`}
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{selectedModel.name}</h1>
              <p className="text-gray-600 mt-1">Choose your device variant to get accurate pricing</p>
            </div>
            {selectedModel.featured && (
              <Star className="h-6 w-6 text-yellow-400 fill-current" />
            )}
          </div>
        </div>

        {/* Variants Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {variants.length > 0 ? (
            variants.map((variant) => {
              const basePrice = variant.baseprice || variant.base_price || variant.currentprice || variant.current_price;
              
              return (
                <div
                  key={variant.id}
                  onClick={() => handleVariantSelect(variant)}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer p-6"
                >
                  <div className="flex flex-col h-full">
                    
                    {/* Variant Info */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {variant.name || variant.variant_name}
                      </h3>
                      
                      <div className="space-y-1 text-sm text-gray-600 mb-4">
                        {variant.storage && (
                          <div className="flex justify-between">
                            <span>Storage:</span>
                            <span className="font-medium">{variant.storage}</span>
                          </div>
                        )}
                        {variant.color && (
                          <div className="flex justify-between">
                            <span>Color:</span>
                            <span className="font-medium">{variant.color}</span>
                          </div>
                        )}
                        {variant.ram && (
                          <div className="flex justify-between">
                            <span>RAM:</span>
                            <span className="font-medium">{variant.ram}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="border-t border-gray-100 pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Base Buyback Price</p>
                          <p className="text-2xl font-bold text-green-600">
                            {basePrice ? `₹${basePrice.toLocaleString('en-IN')}` : 'Price TBD'}
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                      
                      {basePrice && (
                        <p className="text-xs text-gray-500 mt-2">
                          * Final price depends on device condition
                        </p>
                      )}
                    </div>

                    {/* Active Status */}
                    {variant.active !== false && (
                      <div className="flex items-center mt-3 text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        <span className="text-xs font-medium">Available for Buyback</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Variants Available</h3>
              <p className="text-gray-500">
                This model doesn't have specific variants configured yet. Please contact support for pricing.
              </p>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">How It Works</h3>
          <div className="space-y-2 text-blue-800">
            <p className="flex items-center">
              <span className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-sm font-bold mr-3">1</span>
              Select your exact device variant above
            </p>
            <p className="flex items-center">
              <span className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
              Answer condition assessment questions
            </p>
            <p className="flex items-center">
              <span className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-sm font-bold mr-3">3</span>
              Get your final buyback quote instantly
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VariantSelectionPage;