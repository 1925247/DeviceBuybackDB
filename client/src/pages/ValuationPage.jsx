import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DollarSign, Star, Shield, Truck, ArrowRight } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const ValuationPage = () => {
  const { deviceType, brand, model } = useParams();
  const navigate = useNavigate();
  const [valuation, setValuation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deviceInfo, setDeviceInfo] = useState(null);

  useEffect(() => {
    calculateValuation();
    fetchDeviceInfo();
  }, [deviceType, brand, model]);

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

  const getConditionDescription = (impact) => {
    if (impact >= -5) return 'Excellent';
    if (impact >= -20) return 'Good';
    if (impact >= -40) return 'Fair';
    return 'Poor';
  };

  const calculateValuation = async () => {
    try {
      setLoading(true);
      const conditionAnswers = JSON.parse(sessionStorage.getItem('conditionAnswers') || '{}');
      const totalImpact = parseFloat(sessionStorage.getItem('totalImpact') || '0');
      const storedDeviceInfo = JSON.parse(sessionStorage.getItem('deviceInfo') || '{}');
      
      console.log('Calculating valuation with:', { conditionAnswers, totalImpact, storedDeviceInfo });
      
      // Try to fetch actual model data for pricing
      let basePrice = 300; // Default fallback
      
      try {
        const modelsResponse = await fetch('/api/device-models');
        const models = await modelsResponse.json();
        
        // Find the specific model
        const selectedModel = models.find(m => 
          m.slug === model && 
          m.active === true
        );
        
        if (selectedModel) {
          console.log('Found model for valuation:', selectedModel);
          
          // Try to get variants for better pricing
          const variantsResponse = await fetch(`/api/device-models/${selectedModel.id}/variants`);
          const variants = await variantsResponse.json();
          
          if (variants.length > 0) {
            // Use average variant price as base
            const avgPrice = variants.reduce((sum, v) => sum + (v.current_price || 0), 0) / variants.length;
            basePrice = Math.round(avgPrice * 0.6); // 60% of current market price for buyback
            console.log('Calculated base price from variants:', basePrice);
          } else if (selectedModel.base_price) {
            basePrice = Math.round(selectedModel.base_price * 0.6);
            console.log('Calculated base price from model:', basePrice);
          }
        }
      } catch (error) {
        console.error('Error fetching model data for pricing:', error);
      }
      
      // Apply condition impact (percentage-based)
      const adjustmentFactor = 1 + (totalImpact / 100);
      const finalValueUSD = Math.max(50, Math.round(basePrice * adjustmentFactor));
      
      // Convert to Indian Rupees (1 USD = 83 INR approximately)
      const finalValueINR = Math.round(finalValueUSD * 83);
      const basePriceINR = Math.round(basePrice * 83);
      
      console.log('Valuation calculation:', { basePrice, basePriceINR, totalImpact, adjustmentFactor, finalValueUSD, finalValueINR });

      setValuation({
        estimatedValue: finalValueINR,
        basePrice: basePriceINR,
        condition: getConditionDescription(totalImpact),
        factors: [
          { name: 'Device Model', impact: '+$150', positive: true },
          { name: 'Market Demand', impact: '+$25', positive: true },
          { name: 'Condition Assessment', impact: '-$75', positive: false }
        ]
      });
    } catch (error) {
      console.error('Error calculating valuation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOffer = () => {
    // Store valuation data for checkout page
    sessionStorage.setItem('valuationData', JSON.stringify(valuation));
    navigate(`/sell/${deviceType}/${brand}/${model}/checkout`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Your Device Valuation
          </h1>
          <p className="text-xl text-gray-600">
            Based on your device information and condition assessment
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Device Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Details</h3>
              
              {deviceInfo?.image_url && (
                <img
                  src={deviceInfo.image_url}
                  alt={deviceInfo.name}
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
              )}
              
              <div className="space-y-2">
                <p><span className="font-medium">Brand:</span> {brand}</p>
                <p><span className="font-medium">Model:</span> {deviceInfo?.name || model}</p>
                <p><span className="font-medium">Type:</span> {deviceType}</p>
                {deviceInfo?.release_year && (
                  <p><span className="font-medium">Year:</span> {deviceInfo.release_year}</p>
                )}
                <p><span className="font-medium">Condition:</span> {valuation?.condition}</p>
              </div>
            </div>
          </div>

          {/* Valuation Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-8">
              {/* Price Display */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                  <DollarSign className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  ₹{valuation?.estimatedValue?.toLocaleString('en-IN')}
                </h2>
                <p className="text-gray-600">Estimated Cash Value (INR)</p>
              </div>

              {/* Valuation Factors */}
              <div className="mb-8">
                <h4 className="font-semibold text-gray-900 mb-4">Valuation Breakdown</h4>
                <div className="space-y-3">
                  {valuation?.factors?.map((factor, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-700">{factor.name}</span>
                      <span className={`font-medium ${factor.positive ? 'text-green-600' : 'text-red-600'}`}>
                        {factor.impact}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm text-gray-600">Best Price Guarantee</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-600">Secure Transaction</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Truck className="h-5 w-5 text-blue-500" />
                  <span className="text-sm text-gray-600">Free Shipping</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <button
                  onClick={handleAcceptOffer}
                  className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  Accept Offer & Continue
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
                
                <div className="flex space-x-4">
                  <button
                    onClick={() => navigate(`/sell/${deviceType}/${brand}/${model}/condition`)}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Retake Assessment
                  </button>
                  <button
                    onClick={() => navigate(`/sell/${deviceType}/${brand}`)}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Try Different Model
                  </button>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">
                  * This is an estimated value based on current market conditions and the information provided. 
                  Final offer may vary after physical inspection of the device.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValuationPage;