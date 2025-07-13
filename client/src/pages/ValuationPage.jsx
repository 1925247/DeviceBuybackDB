import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DollarSign, Star, Shield, Truck, ArrowRight } from "lucide-react";
import LoadingSpinner from "../components/ui/LoadingSpinner";

const ValuationPage = () => {
  const { deviceType, brand, model, variant } = useParams();
  const navigate = useNavigate();
  const [valuation, setValuation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [variantInfo, setVariantInfo] = useState(null);

  useEffect(() => {
    calculateValuation();
    fetchDeviceInfo();
    if (variant) {
      fetchVariantInfo();
    }
  }, [deviceType, brand, model, variant]);

  const fetchDeviceInfo = async () => {
    try {
      const response = await fetch(`/api/device-models`);
      const models = await response.json();
      const foundModel = models.find((m) => m.slug === model);
      setDeviceInfo(foundModel);
    } catch (error) {
      console.error("Error fetching device info:", error);
    }
  };

  const fetchVariantInfo = async () => {
    try {
      const response = await fetch(`/api/device-model-variants/${model}/${variant}`);
      const data = await response.json();
      setVariantInfo(data.variant);
    } catch (error) {
      console.error("Error fetching variant info:", error);
    }
  };

  const getConditionDescription = (impact) => {
    if (impact >= -5) return "Excellent";
    if (impact >= -20) return "Good";
    if (impact >= -40) return "Fair";
    return "Poor";
  };

  const calculateValuation = async () => {
    try {
      setLoading(true);
      const conditionAnswers = JSON.parse(
        sessionStorage.getItem("conditionAnswers") || "{}",
      );
      const totalImpact = parseFloat(
        sessionStorage.getItem("totalImpact") || "0",
      );
      const storedDeviceInfo = JSON.parse(
        sessionStorage.getItem("deviceInfo") || "{}",
      );

      console.log("Calculating valuation with:", {
        conditionAnswers,
        totalImpact,
        storedDeviceInfo,
      });

      let basePrice = 300; // Default fallback
      let variantPrice = null;

      try {
        const modelsResponse = await fetch("/api/device-models");
        const models = await modelsResponse.json();

        // Find the specific model
        const selectedModel = models.find(
          (m) => m.slug === model && m.active === true,
        );

        if (selectedModel) {
          console.log("Found model for valuation:", selectedModel);

          // If variant is specified, get variant-specific pricing
          if (variant) {
            try {
              const variantResponse = await fetch(`/api/device-model-variants/${model}/${variant}`);
              const variantData = await variantResponse.json();
              if (variantData.variant) {
                // Use variant's current price and base price from the database
                variantPrice = variantData.variant.current_price || variantData.variant.base_price;
                basePrice = variantData.variant.base_price || variantData.variant.current_price || basePrice;
                
                console.log("Found variant pricing:", {
                  basePrice: basePrice,
                  currentPrice: variantPrice,
                  variantName: variantData.variant.variant_name,
                  marketValue: variantData.variant.market_value
                });
              }
            } catch (error) {
              console.error("Error fetching variant data:", error);
            }
          }

          // Try to get variants for better pricing (fallback)
          if (!variantPrice) {
            const variantsResponse = await fetch(
              `/api/device-models/${selectedModel.id}/variants`,
            );
            const variants = await variantsResponse.json();

            if (variants.length > 0) {
              // Use average variant price as base
              const avgPrice =
                variants.reduce((sum, v) => sum + (v.current_price || 0), 0) /
                variants.length;
              basePrice = Math.round(avgPrice * 0.6); // 60% of current market price for buyback
              console.log("Calculated base price from variants:", basePrice);
            } else if (selectedModel.base_price) {
              basePrice = Math.round(selectedModel.base_price * 0.6);
              console.log("Calculated base price from model:", basePrice);
            }
          } else {
            // Use variant price if available
            basePrice = Math.round(variantPrice * 0.6);
            console.log("Using variant price:", basePrice);
          }
        }
      } catch (error) {
        console.error("Error fetching model data for pricing:", error);
      }

      // Use actual variant pricing if available
      const actualBasePrice = variantPrice ? Math.round(variantPrice * 0.6) : basePrice;
      
      // Apply condition impact (percentage-based)
      const adjustmentFactor = 1 + totalImpact / 100;
      const finalValueUSD = Math.max(
        50,
        Math.round(actualBasePrice * adjustmentFactor),
      );

      // Convert to Indian Rupees (1 USD = 83 INR approximately)
      const finalValueINR = Math.round(finalValueUSD * 83);
      const basePriceINR = Math.round(actualBasePrice * 83);

      console.log("Valuation calculation:", {
        basePrice,
        basePriceINR,
        totalImpact,
        adjustmentFactor,
        finalValueUSD,
        finalValueINR,
      });

      // Calculate condition deduction amount
      const conditionDeduction = Math.round(basePriceINR * (Math.abs(totalImpact) / 100));
      const deductionRate = Math.abs(totalImpact);

      // Get variant display name
      let variantDisplayName = 'Base Model';
      if (variant) {
        // First try to get the actual variant name from database
        try {
          const variantResponse = await fetch(`/api/device-model-variants/${model}/${variant}`);
          const variantData = await variantResponse.json();
          if (variantData.variant && variantData.variant.variant_name) {
            variantDisplayName = variantData.variant.variant_name;
          } else {
            // Fallback: Convert variant slug to display name (e.g., "128gb-blue" -> "128GB Blue")
            variantDisplayName = variant
              .split('-')
              .map(part => {
                // Handle storage sizes
                if (part.match(/^\d+gb$/i)) {
                  return part.toUpperCase();
                }
                // Handle colors and other parts
                return part.charAt(0).toUpperCase() + part.slice(1);
              })
              .join(' ');
          }
        } catch (error) {
          console.error("Error fetching variant name:", error);
          // Use slug conversion as fallback
          variantDisplayName = variant
            .split('-')
            .map(part => {
              if (part.match(/^\d+gb$/i)) {
                return part.toUpperCase();
              }
              return part.charAt(0).toUpperCase() + part.slice(1);
            })
            .join(' ');
        }
      }

      setValuation({
        estimatedValue: finalValueINR,
        basePrice: basePriceINR,
        condition: getConditionDescription(totalImpact),
        conditionDeduction: conditionDeduction,
        deductionRate: deductionRate,
        finalValue: finalValueINR,
        variantName: variantDisplayName
      });
    } catch (error) {
      console.error("Error calculating valuation:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOffer = () => {
    // Store valuation data for checkout page
    sessionStorage.setItem("valuationData", JSON.stringify(valuation));
    const checkoutPath = variant 
      ? `/sell/${deviceType}/${brand}/${model}/${variant}/checkout`
      : `/sell/${deviceType}/${brand}/${model}/checkout`;
    navigate(checkoutPath);
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Device Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Device Details
              </h3>

              {deviceInfo?.image_url && (
                <img
                  src={deviceInfo.image_url}
                  alt={deviceInfo.name}
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
              )}

              <div className="space-y-2">
                <p>
                  <span className="font-medium">Brand:</span> {brand?.charAt(0).toUpperCase() + brand?.slice(1)}
                </p>
                <p>
                  <span className="font-medium">Model:</span>{" "}
                  {deviceInfo?.name || model}
                  {variant && (
                    <span className="text-gray-600"> + {valuation?.variantName || variant}</span>
                  )}
                </p>
                <p>
                  <span className="font-medium">Type:</span> {deviceType?.charAt(0).toUpperCase() + deviceType?.slice(1)}
                </p>
                {deviceInfo?.release_year && (
                  <p>
                    <span className="font-medium">Year:</span>{" "}
                    {deviceInfo.release_year}
                  </p>
                )}
                <p>
                  <span className="font-medium">Condition:</span>{" "}
                  <span className={`font-semibold ${
                    valuation?.condition === 'Excellent' ? 'text-green-600' : 
                    valuation?.condition === 'Good' ? 'text-blue-600' : 
                    valuation?.condition === 'Fair' ? 'text-yellow-600' : 
                    'text-red-600'
                  }`}>
                    {valuation?.condition}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Valuation Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Price Breakdown
                </h2>
                
                {/* Base Price */}
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">Base Price ({valuation?.variantName || 'Base Model'})</span>
                    <span className="font-semibold text-gray-900">
                      ₹{valuation?.basePrice?.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Condition Deduction */}
                <div className="mb-4 p-4 bg-red-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-red-700">Condition Deduction (-{valuation?.deductionRate}%)</span>
                    <span className="font-semibold text-red-600">
                      -₹{valuation?.conditionDeduction?.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="text-sm text-red-600">
                    Based on {valuation?.condition.toLowerCase()} condition
                  </div>
                </div>

                {/* Final Value */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-semibold text-gray-900">Final Value</span>
                    <span className="text-3xl font-bold text-green-600">
                      ₹{valuation?.finalValue?.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Instant cash payment
                  </p>
                </div>
              </div>

              {/* Valuation Factors */}
              {/* <div className="mb-8">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Valuation Breakdown
                </h4>
                <div className="space-y-3">
                  {valuation?.factors?.map((factor, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 border-b border-gray-100"
                    >
                      <span className="text-gray-700">{factor.name}</span>
                      <span
                        className={`font-medium ${factor.positive ? "text-green-600" : "text-red-600"}`}
                      >
                        {factor.impact}
                      </span>
                    </div>
                  ))}
                </div>
              </div> */}

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm text-gray-600">
                    Best Price Guarantee
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-600">
                    Secure Transaction
                  </span>
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
                    onClick={() => {
                      const conditionPath = variant 
                        ? `/sell/${deviceType}/${brand}/${model}/${variant}/condition`
                        : `/sell/${deviceType}/${brand}/${model}/condition`;
                      navigate(conditionPath);
                    }}
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
                  * This is an estimated value based on current market
                  conditions and the information provided. Final offer may vary
                  after physical inspection of the device.
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
