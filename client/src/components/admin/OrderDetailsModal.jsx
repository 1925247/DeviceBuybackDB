import React from 'react';
import { X, MapPin, Phone, Mail, Calendar, IndianRupee, Package, Clock } from 'lucide-react';

const OrderDetailsModal = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const conditionAnswers = order.condition_answers ? JSON.parse(order.condition_answers) : {};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Order Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Order Information */}
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Order Information</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-medium">{order.order_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">{formatDate(order.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Value:</span>
                  <span className="font-medium">₹{order.offered_price}</span>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Customer Information</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="text-gray-600 mr-2">Name:</div>
                  <div className="font-medium">{order.customer_name}</div>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-gray-400 mr-2" />
                  <div className="text-sm">{order.customer_email}</div>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-gray-400 mr-2" />
                  <div className="text-sm">{order.customer_phone}</div>
                </div>
                {order.pickup_address && (
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-1" />
                    <div className="text-sm">{order.pickup_address}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Device Information */}
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Device Information</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium capitalize">{order.device_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Brand:</span>
                  <span className="font-medium">{order.manufacturer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Model:</span>
                  <span className="font-medium">{order.model}</span>
                </div>
                {order.variant && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Variant:</span>
                    <span className="font-medium">{order.variant}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Lead Source */}
            {(order.lead_source || order.utm_source) && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Lead Source</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Source:</span>
                    <span className="font-medium">{order.lead_source || order.utm_source}</span>
                  </div>
                  {order.lead_medium && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Medium:</span>
                      <span className="font-medium">{order.lead_medium}</span>
                    </div>
                  )}
                  {order.lead_campaign && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Campaign:</span>
                      <span className="font-medium">{order.lead_campaign}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Condition Assessment */}
        {Object.keys(conditionAnswers).length > 0 && (
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Condition Assessment</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(conditionAnswers).map(([questionId, answer]) => (
                <div key={questionId} className="text-sm">
                  <span className="text-gray-600">Question {questionId}:</span>
                  <span className="font-medium ml-2">{answer}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {order.notes && (
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Notes</h4>
            <p className="text-sm text-gray-700">{order.notes}</p>
          </div>
        )}

        {/* Pickup Information */}
        {(order.pickup_date || order.pickup_time) && (
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Pickup Information</h4>
            <div className="space-y-2">
              {order.pickup_date && (
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm">{order.pickup_date}</span>
                </div>
              )}
              {order.pickup_time && (
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm">{order.pickup_time}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;