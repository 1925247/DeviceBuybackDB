import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MapPin, User, Phone, Mail, Package, IndianRupee, CheckCircle } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const CheckoutFormPage = () => {
  const { deviceType, brand, model } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [valuation, setValuation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    pinCode: '',
    city: '',
    state: '',
    address: '',
    deviceCondition: '',
    finalPrice: 0
  });

  useEffect(() => {
    // Get valuation data from previous page or session storage
    const storedValuation = JSON.parse(sessionStorage.getItem('valuationData') || '{}');
    const conditionAnswers = JSON.parse(sessionStorage.getItem('conditionAnswers') || '{}');
    const totalImpact = parseFloat(sessionStorage.getItem('totalImpact') || '0');
    
    if (storedValuation.estimatedValue) {
      setValuation(storedValuation);
      setFormData(prev => ({
        ...prev,
        finalPrice: storedValuation.estimatedValue,
        deviceCondition: storedValuation.condition
      }));
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePinCodeChange = async (e) => {
    const pinCode = e.target.value;
    setFormData(prev => ({ ...prev, pinCode }));

    // Auto-fill city and state when PIN code is 6 digits
    if (pinCode.length === 6 && /^[1-9][0-9]{5}$/.test(pinCode)) {
      setLoading(true);
      try {
        // Using Indian postal API with fallback
        const response = await fetch(`https://api.postalpincode.in/pincode/${pinCode}`);
        const data = await response.json();
        
        if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice.length > 0) {
          const postOffice = data[0].PostOffice[0];
          setFormData(prev => ({
            ...prev,
            city: postOffice.District,
            state: postOffice.State
          }));
        } else {
          // Try backup API
          try {
            const backupResponse = await fetch(`http://api.zippopotam.us/IN/${pinCode}`);
            const backupData = await backupResponse.json();
            
            if (backupData && backupData.places && backupData.places.length > 0) {
              const place = backupData.places[0];
              setFormData(prev => ({
                ...prev,
                city: place['place name'],
                state: place.state
              }));
            } else {
              throw new Error('No data found');
            }
          } catch (backupError) {
            console.error('Both APIs failed:', backupError);
            setFormData(prev => ({
              ...prev,
              city: '',
              state: ''
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching PIN code data:', error);
        setFormData(prev => ({
          ...prev,
          city: '',
          state: ''
        }));
      } finally {
        setLoading(false);
      }
    } else if (pinCode.length < 6) {
      // Clear city and state if PIN code is incomplete
      setFormData(prev => ({
        ...prev,
        city: '',
        state: ''
      }));
    }
  };

  const generateOrderId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `BB${timestamp}${random}`.slice(-12); // Keep it to 12 characters
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const orderId = generateOrderId();
      const conditionAnswers = JSON.parse(sessionStorage.getItem('conditionAnswers') || '{}');
      
      const buybackData = {
        orderId,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        deviceType,
        manufacturer: brand,
        model,
        condition: formData.deviceCondition,
        offeredPrice: formData.finalPrice,
        status: 'pending',
        pickupAddress: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pinCode}`,
        conditionAnswers: JSON.stringify(conditionAnswers),
        notes: `Device assessment completed. Condition: ${formData.deviceCondition}`,
        createdAt: new Date().toISOString()
      };

      console.log('Submitting buyback request:', buybackData);

      const response = await fetch('/api/buyback-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(buybackData)
      });

      console.log('Response status:', response.status);
      
      let result;
      try {
        const responseText = await response.text();
        console.log('Raw response:', responseText);
        
        if (responseText.startsWith('<!DOCTYPE')) {
          throw new Error('Server returned HTML instead of JSON. The API endpoint may not be properly configured.');
        }
        
        result = JSON.parse(responseText);
        console.log('Response data:', result);
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error(`Invalid response from server: ${parseError.message}`);
      }

      if (response.ok) {
        console.log('Buyback request created successfully:', result);
        
        // Clear session storage
        sessionStorage.removeItem('conditionAnswers');
        sessionStorage.removeItem('totalImpact');
        sessionStorage.removeItem('deviceInfo');
        sessionStorage.removeItem('valuationData');
        
        // Use order ID from server response or fallback to generated one
        const finalOrderId = result.data?.order_id || result.orderId || orderId;
        
        // Store order data for success page
        const orderData = { 
          orderId: finalOrderId,
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone,
          pickupAddress: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pinCode}`,
          estimatedValue: formData.finalPrice,
          deviceInfo: { deviceType, brand, model }
        };
        
        // Store in localStorage as backup
        localStorage.setItem('lastBuybackOrder', JSON.stringify(orderData));
        
        // Navigate to success page with order data
        navigate('/buyback-success', { state: orderData });
      } else {
        console.error('Server error:', result);
        throw new Error(result.message || result.error || 'Failed to submit buyback request');
      }
    } catch (error) {
      console.error('Error submitting buyback request:', error);
      alert('Error submitting request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Buyback Request</h1>
          <p className="text-gray-600 mt-2">Fill in your details to proceed with the device sale</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6">Customer Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="inline h-4 w-4 mr-1" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="inline h-4 w-4 mr-1" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="customerEmail"
                    value={formData.customerEmail}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="inline h-4 w-4 mr-1" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    name="pinCode"
                    value={formData.pinCode}
                    onChange={handlePinCodeChange}
                    maxLength="6"
                    pattern="[0-9]{6}"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter 6-digit PIN code"
                    required
                  />
                  {loading && <LoadingSpinner size="small" className="mt-1" />}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    readOnly
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    readOnly
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Complete Address *
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="House/Flat No., Street, Landmark..."
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={submitting || !formData.customerName || !formData.customerEmail || !formData.pinCode || !formData.address}
                className="w-full mt-6 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {submitting ? (
                  <LoadingSpinner size="small" className="mr-2" />
                ) : (
                  <CheckCircle className="h-5 w-5 mr-2" />
                )}
                {submitting ? 'Processing...' : 'Complete Buyback Request'}
              </button>
            </form>
          </div>

          {/* Summary Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center">
                  <Package className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium">{brand} {model}</p>
                    <p className="text-sm text-gray-500">{deviceType}</p>
                  </div>
                </div>
                
                {valuation && (
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Condition</span>
                      <span className="text-sm font-medium">{valuation.condition}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Base Price</span>
                      <span className="text-sm">₹{valuation.basePrice?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
                      <span>Total Offer</span>
                      <span className="text-green-600">₹{valuation.estimatedValue?.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Order confirmation via email</li>
                  <li>• Free pickup scheduled</li>
                  <li>• Device inspection</li>
                  <li>• Payment within 24 hours</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutFormPage;