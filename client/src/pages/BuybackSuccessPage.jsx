import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, Calendar, Phone, Mail, MapPin } from 'lucide-react';

const BuybackSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { orderId, customerName, estimatedValue, deviceInfo } = location.state || {};

  if (!orderId) {
    // Redirect to home if no order data
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
            <p className="text-gray-600">Your buyback request has been successfully submitted</p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-green-800 mb-2">Order Details</h2>
            <div className="text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-green-700">Order ID:</span>
                <span className="font-mono font-bold text-green-900">{orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Customer:</span>
                <span className="font-medium text-green-900">{customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Device:</span>
                <span className="font-medium text-green-900">{deviceInfo?.brand} {deviceInfo?.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Estimated Value:</span>
                <span className="font-bold text-green-900 text-lg">₹{estimatedValue?.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-blue-900 mb-1">Pickup Scheduled</h3>
              <p className="text-sm text-blue-700">Within 2-3 business days</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <Package className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-purple-900 mb-1">Free Inspection</h3>
              <p className="text-sm text-purple-700">Professional assessment</p>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">What's Next?</h3>
            <div className="text-left space-y-2 text-sm text-gray-700">
              <div className="flex items-start">
                <Mail className="h-4 w-4 mt-0.5 mr-2 text-gray-500" />
                <span>Confirmation email sent with order details</span>
              </div>
              <div className="flex items-start">
                <Phone className="h-4 w-4 mt-0.5 mr-2 text-gray-500" />
                <span>Our team will call you to schedule pickup</span>
              </div>
              <div className="flex items-start">
                <MapPin className="h-4 w-4 mt-0.5 mr-2 text-gray-500" />
                <span>Free doorstep pickup at your convenience</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-4 w-4 mt-0.5 mr-2 text-gray-500" />
                <span>Payment processed within 24 hours of inspection</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors"
            >
              Back to Home
            </button>
            <button
              onClick={() => navigate('/sell')}
              className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-md hover:bg-gray-300 transition-colors"
            >
              Sell Another Device
            </button>
          </div>

          <div className="mt-6 text-xs text-gray-500 border-t pt-4">
            <p>Need help? Contact us at support@casholddevice.com or call +91-9876543210</p>
            <p>Order ID: {orderId} | Generated on {new Date().toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuybackSuccessPage;