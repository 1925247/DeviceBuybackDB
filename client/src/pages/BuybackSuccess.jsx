import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Copy, Phone, Mail, MapPin, Calendar, Clock, Smartphone, Package, Star } from 'lucide-react';

const BuybackSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    // Get order data from navigation state or localStorage
    const data = location.state || JSON.parse(localStorage.getItem('lastBuybackOrder') || '{}');
    
    if (!data.orderId) {
      // If no order data, redirect to home
      navigate('/');
      return;
    }
    
    setOrderData(data);
    
    // Clear the stored data after displaying
    localStorage.removeItem('lastBuybackOrder');
  }, [location.state, navigate]);

  const copyOrderId = () => {
    if (orderData?.orderId) {
      navigator.clipboard.writeText(orderData.orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Request Submitted Successfully!
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Your device buyback request has been received and is being processed.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white shadow-xl rounded-lg overflow-hidden mb-6">
          {/* Order ID Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-white text-lg font-semibold">Order ID</h2>
                <div className="flex items-center mt-1">
                  <span className="text-white text-2xl font-mono font-bold">
                    {orderData.orderId}
                  </span>
                  <button
                    onClick={copyOrderId}
                    className="ml-3 text-white hover:text-blue-200 transition-colors"
                    title="Copy Order ID"
                  >
                    {copied ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-blue-100 text-sm">Estimated Value</p>
                <p className="text-white text-2xl font-bold">
                  {formatPrice(orderData.estimatedValue || 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="px-6 py-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <Phone className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{orderData.customerName}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="bg-green-100 p-2 rounded-lg mr-3">
                  <Mail className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{orderData.customerEmail}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="bg-purple-100 p-2 rounded-lg mr-3">
                  <Phone className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{orderData.customerPhone}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="bg-orange-100 p-2 rounded-lg mr-3">
                  <MapPin className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium text-sm">{orderData.pickupAddress}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Device Details */}
          <div className="px-6 py-6 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <Smartphone className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Device Type</p>
                  <p className="font-medium capitalize">{orderData.deviceInfo?.deviceType || 'N/A'}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="bg-green-100 p-2 rounded-lg mr-3">
                  <Package className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Brand</p>
                  <p className="font-medium capitalize">{orderData.deviceInfo?.brand || 'N/A'}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="bg-purple-100 p-2 rounded-lg mr-3">
                  <Star className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Model</p>
                  <p className="font-medium">{orderData.deviceInfo?.model || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">What Happens Next?</h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-blue-600 font-bold text-sm">1</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Order Confirmation</h4>
                <p className="text-gray-600 text-sm">You'll receive an email confirmation with your order details within 15 minutes.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-green-600 font-bold text-sm">2</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Pickup Scheduling</h4>
                <p className="text-gray-600 text-sm">Our team will contact you within 24 hours to schedule a convenient pickup time.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-purple-600 font-bold text-sm">3</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Device Inspection</h4>
                <p className="text-gray-600 text-sm">Our expert will inspect your device and confirm the final price on the spot.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-orange-600 font-bold text-sm">4</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Instant Payment</h4>
                <p className="text-gray-600 text-sm">Receive payment immediately via your preferred method after device acceptance.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Customer Support</h4>
              <p className="text-gray-600 text-sm mb-2">Available 24/7 for any questions</p>
              <div className="flex items-center">
                <Phone className="h-4 w-4 text-blue-600 mr-2" />
                <span className="text-blue-600 font-medium">+91 9999-888-777</span>
              </div>
              <div className="flex items-center mt-1">
                <Mail className="h-4 w-4 text-blue-600 mr-2" />
                <span className="text-blue-600 font-medium">support@buyback.com</span>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Track Your Order</h4>
              <p className="text-gray-600 text-sm mb-2">Use your Order ID to track status</p>
              <button
                onClick={() => window.open('/track-order', '_blank')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                Track Order Status
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Return to Home
          </button>
          <button
            onClick={() => navigate('/sell-device')}
            className="flex-1 border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors font-medium"
          >
            Sell Another Device
          </button>
        </div>

        {/* Mobile App Promotion */}
        <div className="mt-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white text-center">
          <h3 className="text-lg font-semibold mb-2">Download Our Mobile App</h3>
          <p className="text-purple-100 text-sm mb-4">
            Get real-time updates and manage your orders on the go
          </p>
          <div className="flex justify-center space-x-4">
            <button className="bg-white text-purple-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors">
              App Store
            </button>
            <button className="bg-white text-purple-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors">
              Google Play
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuybackSuccess;