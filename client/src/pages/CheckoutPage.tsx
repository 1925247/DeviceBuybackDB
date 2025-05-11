import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, Check, Info, Loader2 } from 'lucide-react';
import { getLocationFromPincode } from '../api/pincode';
import { apiRequest } from '../lib/queryClient';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
});

const timeSlots = [
  { value: '09:00-12:00', display: '9:00 AM - 12:00 PM' },
  { value: '12:00-15:00', display: '12:00 PM - 3:00 PM' },
  { value: '15:00-18:00', display: '3:00 PM - 6:00 PM' },
  { value: '18:00-21:00', display: '6:00 PM - 9:00 PM' },
];

const getAvailableDates = () => {
  const dates = [];
  const today = new Date();
  for (let i = 1; i <= 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    if (date.getDay() !== 0) {
      const formattedDate = date.toISOString().split('T')[0];
      const displayDate = date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
      dates.push({ value: formattedDate, display: displayDate });
    }
  }
  return dates;
};

const CheckoutPage: React.FC = () => {
  const [deviceValuation, setDeviceValuation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    pickupDate: '',
    pickupTime: '',
    additionalNotes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [orderError, setOrderError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const valuationData = localStorage.getItem('deviceValuation');
    if (valuationData) {
      setDeviceValuation(JSON.parse(valuationData));
    } else {
      navigate('/');
    }
    setLoading(false);
  }, [navigate]);

  const handleInputChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    if (name === 'pincode' && value.length === 6 && /^\d{6}$/.test(value)) {
      try {
        const location = await getLocationFromPincode(value);
        setFormData(prev => ({
          ...prev,
          city: location.city,
          state: location.state,
          country: location.country || 'India',
        }));
      } catch (err) {
        console.error('Error fetching location:', err);
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone number must be 10 digits';
    }
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits';
    }
    if (!formData.pickupDate) newErrors.pickupDate = 'Pickup date is required';
    if (!formData.pickupTime) newErrors.pickupTime = 'Pickup time is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        setSubmitting(true);
        setOrderError(null);
        
        // Create a buyback request in the database
        const buybackData = {
          user_id: 1, // Default user ID - in a real app this would be the logged-in user
          device_model_id: deviceValuation.deviceModelId,
          condition_score: deviceValuation.conditionScore,
          offered_price: deviceValuation.finalPrice,
          variant: deviceValuation.selectedVariant,
          status: 'pending',
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          pickup_address: `${formData.address}, ${formData.city}, ${formData.state}, ${formData.pincode}`,
          pickup_date: formData.pickupDate,
          pickup_time: formData.pickupTime,
          notes: formData.additionalNotes || null
        };
        
        const response = await apiRequest('/api/buyback-requests', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(buybackData),
        });
        
        // Extract the order ID from the response
        const { id } = await response.json();
        setOrderId(id.toString());
        setOrderPlaced(true);
        
        // Clear any existing storage now that the order is in the database
        localStorage.removeItem('deviceCondition');
        localStorage.removeItem('deviceValuation');
      } catch (error) {
        console.error('Error creating order:', error);
        setOrderError('There was a problem creating your order. Please try again.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!deviceValuation) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Checkout Not Available</h2>
          <p className="mb-8">Please complete device valuation first</p>
          <Link to="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition duration-300">
            Start Valuation
          </Link>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-md p-8 max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Order Placed Successfully!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for choosing our service. Your order has been placed successfully.
          </p>
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Order Details</h2>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Order ID:</span>
              <span className="font-medium">{orderId}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Device:</span>
              <span className="font-medium">
                {deviceValuation.modelName} ({deviceValuation.selectedVariant})
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Condition:</span>
              <span className="font-medium">{deviceValuation.conditionDescription}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Pickup Date:</span>
              <span className="font-medium">
                {new Date(formData.pickupDate).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Pickup Time:</span>
              <span className="font-medium">
                {timeSlots.find(slot => slot.value === formData.pickupTime)?.display || formData.pickupTime}
              </span>
            </div>
            <div className="border-t border-gray-200 pt-2 mt-2 mb-2">
              <span className="font-bold">Total Amount:</span>
              <span className="font-bold text-blue-600">
                {currencyFormatter.format(deviceValuation.finalPrice)}
              </span>
            </div>
            <div className="border-t border-gray-200 pt-4 mt-4">
              <h3 className="font-medium mb-2">Customer Address</h3>
              <p className="text-gray-600">
                {formData.address}, {formData.city}, {formData.state}, {formData.country} - {formData.pincode}
              </p>
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-6 mb-8 text-left">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-800 mb-2">What happens next?</h3>
                <ol className="space-y-2 text-sm text-blue-700 list-decimal list-inside">
                  <li>Our executive will call you to confirm the pickup.</li>
                  <li>They will arrive at your address during the selected time slot.</li>
                  <li>Your device will be inspected to verify its condition.</li>
                  <li>You will receive payment immediately after verification.</li>
                </ol>
              </div>
            </div>
          </div>
          <Link to="/" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition duration-300">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Link
          to={`/sell/${deviceValuation.deviceType}/${deviceValuation.brand}/${deviceValuation.model}/valuation`}
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Valuation
        </Link>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h1 className="text-3xl font-bold mb-6">Checkout</h1>
            <form onSubmit={handleSubmit}>
              {/* Contact Information Section */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>
                </div>
              </div>

              {/* Pickup Address Section */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Pickup Address</h2>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Address *
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        id="pincode"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        maxLength={6}
                        className={`w-full px-3 py-2 border rounded-md ${errors.pincode ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
                    </div>
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        readOnly
                        className="w-full px-3 py-2 border rounded-md bg-gray-50"
                      />
                    </div>
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={formData.state}
                        readOnly
                        className="w-full px-3 py-2 border rounded-md bg-gray-50"
                      />
                    </div>
                    <div>
                      <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                        Country *
                      </label>
                      <input
                        type="text"
                        id="country"
                        name="country"
                        value={formData.country}
                        readOnly
                        className="w-full px-3 py-2 border rounded-md bg-gray-50"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pickup Schedule Section */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Pickup Schedule</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="pickupDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Pickup Date *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        id="pickupDate"
                        name="pickupDate"
                        value={formData.pickupDate}
                        onChange={handleInputChange}
                        className={`w-full pl-10 px-3 py-2 border rounded-md ${errors.pickupDate ? 'border-red-500' : 'border-gray-300'}`}
                      >
                        <option value="">Select a date</option>
                        {getAvailableDates().map((date) => (
                          <option key={date.value} value={date.value}>{date.display}</option>
                        ))}
                      </select>
                    </div>
                    {errors.pickupDate && <p className="text-red-500 text-xs mt-1">{errors.pickupDate}</p>}
                  </div>
                  <div>
                    <label htmlFor="pickupTime" className="block text-sm font-medium text-gray-700 mb-1">
                      Pickup Time *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Clock className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        id="pickupTime"
                        name="pickupTime"
                        value={formData.pickupTime}
                        onChange={handleInputChange}
                        className={`w-full pl-10 px-3 py-2 border rounded-md ${errors.pickupTime ? 'border-red-500' : 'border-gray-300'}`}
                      >
                        <option value="">Select a time slot</option>
                        {timeSlots.map((slot) => (
                          <option key={slot.value} value={slot.value}>{slot.display}</option>
                        ))}
                      </select>
                    </div>
                    {errors.pickupTime && <p className="text-red-500 text-xs mt-1">{errors.pickupTime}</p>}
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              <div className="mb-8">
                <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes (Optional)
                </label>
                <textarea
                  id="additionalNotes"
                  name="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                ></textarea>
              </div>

              {/* Form Actions */}
              <div className="flex justify-between items-center">
                <Link
                  to={`/sell/${deviceValuation.deviceType}/${deviceValuation.brand}/${deviceValuation.model}/valuation`}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-300"
                >
                  Back
                </Link>
                <button
                  type="submit"
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition duration-300"
                >
                  Place Order
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Order Summary Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                <img
                  src={deviceValuation.image}
                  alt={deviceValuation.modelName}
                  className="w-12 h-12 object-contain"
                />
              </div>
              <div>
                <h3 className="font-medium">
                  {deviceValuation.modelName} ({deviceValuation.selectedVariant})
                </h3>
                <p className="text-sm text-gray-600">
                  Condition: {deviceValuation.conditionDescription}
                </p>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Device Value</span>
                <span className="font-medium">{currencyFormatter.format(deviceValuation.basePrice)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Condition Adjustment</span>
                <span className="font-medium">
                  {currencyFormatter.format(deviceValuation.finalPrice - deviceValuation.basePrice)}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Pickup Fee</span>
                <span className="font-medium text-green-600">FREE</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-2">
                <span className="font-bold">Total Amount</span>
                <span className="font-bold text-blue-600">
                  {currencyFormatter.format(deviceValuation.finalPrice)}
                </span>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-4 mb-4">
              <h3 className="font-medium mb-2">Payment Method</h3>
              <p className="text-gray-600 capitalize">
                {deviceValuation.paymentMethod === 'bank' ? 'Bank Transfer' : 
                 deviceValuation.paymentMethod === 'upi' ? 'UPI' : 'Digital Wallet'}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-800 mb-1">Free Doorstep Pickup</h3>
                  <p className="text-sm text-blue-700">
                    Our executive will visit your location to collect the device and process payment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;