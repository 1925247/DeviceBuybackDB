import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Check, DollarSign, Truck, Calendar, Shield, Loader2 } from 'lucide-react';

// Define interfaces for data types
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

interface Valuation {
  id: number;
  device_model_id: number;
  condition_multiplier: number;
  base_price: number;
  variant?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// Helper function to get a base price for a model/variant
const getBasePrice = (modelId: number, variant: string | null, valuations: Valuation[]): number => {
  // Find valuation for the specific variant if provided
  if (variant) {
    const variantValuation = valuations.find(v => 
      v.device_model_id === modelId && 
      v.variant?.toLowerCase() === variant.toLowerCase()
    );
    if (variantValuation) return variantValuation.base_price;
  }
  
  // Otherwise find default valuation without variant
  const defaultValuation = valuations.find(v => 
    v.device_model_id === modelId && !v.variant
  );
  
  return defaultValuation?.base_price || 0;
};

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
  variant?: string;
  deviceModelId: number;
  answers: Record<string, string | string[]>;
  conditionScore: number;
}

const ValuationPage: React.FC = () => {
  const { deviceType, brand, model } = useParams<{
    deviceType: string;
    brand: string;
    model: string;
  }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const variantFromUrl = queryParams.get('variant');

  // State variables
  const [deviceCondition, setDeviceCondition] = useState<DeviceCondition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('bank');
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [deviceModels, setDeviceModels] = useState<DeviceModel[]>([]);
  const [valuations, setValuations] = useState<Valuation[]>([]);
  const [selectedModel, setSelectedModel] = useState<DeviceModel | null>(null);
  const [selectedVariant, setSelectedVariant] = useState('');
  const [basePrice, setBasePrice] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);

  // Fetch reference data from APIs
  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        const [
          deviceTypesResponse, 
          brandsResponse, 
          deviceModelsResponse
        ] = await Promise.all([
          fetch('/api/device-types'),
          fetch('/api/brands'),
          fetch('/api/device-models')
        ]);
        
        if (!deviceTypesResponse.ok) throw new Error('Failed to fetch device types');
        if (!brandsResponse.ok) throw new Error('Failed to fetch brands');
        if (!deviceModelsResponse.ok) throw new Error('Failed to fetch device models');
        
        const deviceTypesData = await deviceTypesResponse.json();
        const brandsData = await brandsResponse.json();
        const deviceModelsData = await deviceModelsResponse.json();
        
        setDeviceTypes(deviceTypesData);
        setBrands(brandsData);
        setDeviceModels(deviceModelsData);
      } catch (err) {
        console.error('Error fetching reference data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load reference data');
      }
    };
    
    fetchReferenceData();
  }, []);

  // Load device condition from localStorage and fetch device model and valuation data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Get condition data from localStorage
        const conditionData = localStorage.getItem('deviceCondition');
        if (!conditionData) {
          setError('No device condition data found');
          setLoading(false);
          return;
        }
        
        const parsedCondition = JSON.parse(conditionData) as DeviceCondition;
        setDeviceCondition(parsedCondition);
        
        // Find the device model that matches
        const foundModel = deviceModels.find(m => 
          m.id === parsedCondition.deviceModelId || 
          (m.slug === model && m.brand?.slug === brand)
        );
        
        if (!foundModel) {
          setError('Device model not found');
          setLoading(false);
          return;
        }
        
        setSelectedModel(foundModel);
        
        // Set variant from localStorage or URL
        const variant = parsedCondition.variant || variantFromUrl || 
                       (foundModel.variants && foundModel.variants.length > 0 ? foundModel.variants[0] : '');
        setSelectedVariant(variant);
        
        // Fetch valuations for this model
        const valuationsResponse = await fetch(`/api/valuations?deviceModelId=${foundModel.id}`);
        if (!valuationsResponse.ok) throw new Error('Failed to fetch valuations');
        
        const valuationsData = await valuationsResponse.json();
        setValuations(valuationsData);
        
        // Calculate prices
        const initialBasePrice = getBasePrice(foundModel.id, variant, valuationsData);
        setBasePrice(initialBasePrice);
        setFinalPrice(Math.round(initialBasePrice * parsedCondition.conditionScore));
        
        setLoading(false);
      } catch (error) {
        console.error('Failed to load valuation data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load valuation data');
        setLoading(false);
      }
    };

    if (deviceModels.length > 0) {
      loadData();
    }
  }, [deviceModels, model, brand, variantFromUrl]);

  // Update prices when variant changes
  useEffect(() => {
    if (deviceCondition && selectedModel && selectedVariant) {
      const newBasePrice = getBasePrice(selectedModel.id, selectedVariant, valuations);
      setBasePrice(newBasePrice);
      setFinalPrice(Math.round(newBasePrice * deviceCondition.conditionScore));
    }
  }, [selectedVariant, selectedModel, deviceCondition, valuations]);

  const handleProceedToCheckout = () => {
    if (!deviceCondition || !selectedModel) return;

    const deviceTypeObj = deviceTypes.find(dt => dt.slug === deviceType);
    const brandObj = brands.find(b => b.slug === brand);

    localStorage.setItem(
      'deviceValuation',
      JSON.stringify({
        deviceType,
        brand,
        model,
        deviceModelId: selectedModel.id,
        modelName: selectedModel.name,
        brandName: brandObj?.name || brand,
        deviceTypeName: deviceTypeObj?.name || deviceType,
        image: selectedModel.image,
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

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-xl font-medium">Loading your device valuation...</h2>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4 text-red-600">Valuation Error</h2>
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

  // Validation check
  if (!deviceType || !brand || !model || !deviceCondition || !selectedModel) {
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
  const brandObj = brands.find(b => b.slug === brand);
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
                {selectedModel.image ? (
                  <img 
                    src={selectedModel.image} 
                    alt={selectedModel.name} 
                    className="w-20 h-20 object-contain"
                    onError={(e) => {
                      const imgElement = e.currentTarget;
                      imgElement.src = `https://placehold.co/200x200?text=${encodeURIComponent(selectedModel.name)}`;
                      imgElement.onerror = null;
                    }}
                  />
                ) : (
                  <span className="text-gray-500">No Image</span>
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  {selectedModel.name} {selectedVariant && `(${selectedVariant})`}
                </h2>
                <p className="text-gray-600">{deviceTypeObj?.name}</p>
                <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  Condition: {conditionDescription}
                </div>
              </div>
            </div>

            {selectedModel.variants && selectedModel.variants.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Variant</label>
                <select
                  value={selectedVariant}
                  onChange={(e) => setSelectedVariant(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {selectedModel.variants.map((variant) => (
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