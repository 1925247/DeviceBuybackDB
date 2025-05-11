import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Check, DollarSign, Truck, Calendar, Shield } from 'lucide-react';
import { deviceTypes } from '../db/devicetype';
import { brands } from '../db/brands';
import { deviceModels } from '../db/models';
import { variantModelPrices } from '../db/valuation';

function getBasePrice(slug: string, variant: string): number | undefined {
  const model = variantModelPrices[slug];
  if (!model) return undefined;
  // Normalize variant key by removing spaces
  const normalizedVariant = variant.replace(/\s/g, '');
  return model[normalizedVariant];
}

const getModelData = (modelId: string): Model | null =>
  deviceModels.find((m) => m.id === modelId || m.slug === modelId) || null;

const getModelName = (modelId: string): string =>
  modelId
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const getConditionDescription = (score: number): string => {
  if (score >= 0.9) return 'Excellent';
  if (score >= 0.8) return 'Good';
  if (score >= 0.7) return 'Fair';
  if (score >= 0.6) return 'Average';
  return 'Poor';
};

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
});

interface DeviceCondition {
  deviceType: string;
  brand: string;
  model: string;
  modelName: string;
  answers: Record<string, string | string[]>;
  conditionScore: number;
}

interface Model {
  id: string;
  name: string;
  image: string;
  variants?: string[];
}

const ValuationPage: React.FC = () => {
  const { deviceType, brand, model } = useParams<{
    deviceType: string;
    brand: string;
    model: string;
  }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [deviceCondition, setDeviceCondition] = useState<DeviceCondition | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('bank');
  const [modelData, setModelData] = useState<Model | null>(null);
  const [selectedVariant, setSelectedVariant] = useState('');
  const [basePrice, setBasePrice] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const conditionData = localStorage.getItem('deviceCondition');
        if (conditionData) {
          const parsedCondition = JSON.parse(conditionData);
          setDeviceCondition(parsedCondition);

          const currentModel = getModelData(model || '');
          setModelData(currentModel);

          if (currentModel?.variants?.length > 0) {
            const initialVariant = currentModel.variants[0];
            setSelectedVariant(initialVariant);
            const variantKey = initialVariant.replace(/\s/g, '');
            const variantPrice = variantModelPrices[model || '']?.[variantKey] || 0;
            setBasePrice(variantPrice);
            setFinalPrice(Math.round(variantPrice * parsedCondition.conditionScore));
          }
        }
      } catch (error) {
        console.error('Failed to load device condition:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [model]);

  useEffect(() => {
    if (deviceCondition && model && selectedVariant) {
      const variantKey = selectedVariant.replace(/\s/g, '');
      const newBasePrice = variantModelPrices[model]?.[variantKey] || 0;
      setBasePrice(newBasePrice);
      setFinalPrice(Math.round(newBasePrice * deviceCondition.conditionScore));
    }
  }, [selectedVariant, model, deviceCondition]);

  const handleProceedToCheckout = () => {
    if (!deviceCondition || !modelData) return;

    const deviceTypeObj = deviceTypes.find(dt => dt.slug === deviceType);
    const brandObj = brands.find(b => b.slug.toLowerCase() === brand?.toLowerCase());

    localStorage.setItem(
      'deviceValuation',
      JSON.stringify({
        deviceType,
        brand,
        model,
        modelName: modelData.name,
        brandName: brandObj?.name,
        image: modelData.image,
        conditionScore: deviceCondition.conditionScore,
        conditionDescription: getConditionDescription(deviceCondition.conditionScore),
        basePrice,
        finalPrice,
        selectedVariant,
        paymentMethod: selectedPaymentMethod,
      })
    );
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <p className="text-gray-600">Loading valuation...</p>
        </div>
      </div>
    );
  }

  if (!deviceType || !brand || !model || !deviceCondition || !modelData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Valuation Not Available</h2>
          <p className="mb-8">Sorry, we couldn't find the valuation for your device. Please try again.</p>
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

  const deviceTypeObj = deviceTypes.find(dt => dt.slug === deviceType);
  const brandObj = brands.find(b => b.slug.toLowerCase() === brand.toLowerCase());
  const conditionDescription = getConditionDescription(deviceCondition.conditionScore);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Link
          to={`/sell/${deviceType}/${brand}/${model}/condition`}
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Condition Assessment
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h1 className="text-3xl font-bold mb-6">Your Device Valuation</h1>
            <div className="flex items-center mb-8">
              <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center mr-6">
                {modelData.image ? (
                  <img src={modelData.image} alt={modelData.name} className="w-20 h-20 object-contain" />
                ) : (
                  <span className="text-gray-500">No Image</span>
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  {modelData.name} {selectedVariant && `(${selectedVariant})`}
                </h2>
                <p className="text-gray-600">{deviceTypeObj?.name}</p>
                <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  Condition: {conditionDescription}
                </div>
              </div>
            </div>

            {modelData.variants && modelData.variants.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Variant</label>
                <select
                  value={selectedVariant}
                  onChange={(e) => setSelectedVariant(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {modelData.variants.map((variant) => (
                    <option key={variant} value={variant}>
                      {variant}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="border-t border-gray-200 pt-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Base Value</span>
                <span className="font-medium">{currencyFormatter.format(basePrice)}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Condition Adjustment</span>
                <span className="font-medium">
                  {currencyFormatter.format(finalPrice - basePrice)}
                </span>
              </div>
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                <span className="text-gray-600">Pickup Fee</span>
                <span className="font-medium text-green-600">FREE</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-xl font-bold">Final Offer</span>
                <span className="text-2xl font-bold text-blue-600">{currencyFormatter.format(finalPrice)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-6">Select Payment Method</h2>
            <div className="space-y-4">
              <div
                role="radio"
                aria-checked={selectedPaymentMethod === 'bank'}
                onClick={() => setSelectedPaymentMethod('bank')}
                className={`flex items-center p-4 rounded-md cursor-pointer border ${
                  selectedPaymentMethod === 'bank'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center ${
                    selectedPaymentMethod === 'bank'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200'
                  }`}
                >
                  {selectedPaymentMethod === 'bank' && <Check className="h-3 w-3" />}
                </div>
                <div className="flex-grow">
                  <h3 className="font-medium">Bank Transfer</h3>
                  <p className="text-sm text-gray-600">Get paid directly to your bank account</p>
                </div>
              </div>

              <div
                role="radio"
                aria-checked={selectedPaymentMethod === 'upi'}
                onClick={() => setSelectedPaymentMethod('upi')}
                className={`flex items-center p-4 rounded-md cursor-pointer border ${
                  selectedPaymentMethod === 'upi'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center ${
                    selectedPaymentMethod === 'upi'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200'
                  }`}
                >
                  {selectedPaymentMethod === 'upi' && <Check className="h-3 w-3" />}
                </div>
                <div className="flex-grow">
                  <h3 className="font-medium">UPI</h3>
                  <p className="text-sm text-gray-600">Instant payment via UPI</p>
                </div>
              </div>

              <div
                role="radio"
                aria-checked={selectedPaymentMethod === 'wallet'}
                onClick={() => setSelectedPaymentMethod('wallet')}
                className={`flex items-center p-4 rounded-md cursor-pointer border ${
                  selectedPaymentMethod === 'wallet'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center ${
                    selectedPaymentMethod === 'wallet'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200'
                  }`}
                >
                  {selectedPaymentMethod === 'wallet' && <Check className="h-3 w-3" />}
                </div>
                <div className="flex-grow">
                  <h3 className="font-medium">Digital Wallet</h3>
                  <p className="text-sm text-gray-600">Transfer to your preferred digital wallet</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6 mb-8 sticky top-6">
            <h2 className="text-xl font-bold mb-6">Next Steps</h2>
            <div className="space-y-6">
              <div className="flex">
                <div className="mr-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Schedule Pickup</h3>
                  <p className="text-sm text-gray-600">Choose a convenient time for device pickup</p>
                </div>
              </div>

              <div className="flex">
                <div className="mr-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Truck className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Device Pickup</h3>
                  <p className="text-sm text-gray-600">Our executive will verify device condition</p>
                </div>
              </div>

              <div className="flex">
                <div className="mr-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Instant Payment</h3>
                  <p className="text-sm text-gray-600">Receive payment via your chosen method</p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={handleProceedToCheckout}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition duration-300"
              >
                Proceed to Checkout
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                By proceeding, you agree to our Terms & Conditions
              </p>
            </div>
          </div>

          <div className="bg-green-50 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <Shield className="h-6 w-6 text-green-600 mr-2" />
              <h3 className="font-medium text-green-800">Our Guarantee</h3>
            </div>
            <ul className="space-y-2 text-sm text-green-700">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Best price guarantee</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Free doorstep pickup</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Instant payment</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValuationPage;