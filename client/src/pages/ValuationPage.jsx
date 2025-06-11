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
      const response = await fetch(`/api/device-models?deviceType=${deviceType}&brand=${brand}&model=${model}`);
      const models = await response.json();
      const foundModel = models.find(m => m.slug === model);
      setDeviceInfo(foundModel);
    } catch (error) {
      console.error('Error fetching device info:', error);
    }
  };

  const calculateValuation = async () => {
    try {
      setLoading(true);
      const conditionAnswers = JSON.parse(sessionStorage.getItem('conditionAnswers') || '{}');
      
      // Simulate valuation calculation based on condition answers
      const basePrice = 300; // This would come from your pricing algorithm
      let adjustedPrice = basePrice;
      
      // Apply condition-based adjustments
      Object.values(conditionAnswers).forEach(answer => {
        if (typeof answer === 'string') {
          if (answer.toLowerCase().includes('excellent')) adjustedPrice *= 1.0;
          else if (answer.toLowerCase().includes('good')) adjustedPrice *= 0.85;
          else if (answer.toLowerCase().includes('fair')) adjustedPrice *= 0.7;
          else if (answer.toLowerCase().includes('poor')) adjustedPrice *= 0.5;
        }
      });

      setValuation({
        estimatedValue: Math.round(adjustedPrice),
        condition: 'Good',
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
    // Store valuation data for checkout
    sessionStorage.setItem('deviceValuation', JSON.stringify({
      ...valuation,
      deviceInfo,
      deviceType,
      brand,
      model
    }));
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
                  ${valuation?.estimatedValue}
                </h2>
                <p className="text-gray-600">Estimated Cash Value</p>
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