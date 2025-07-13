import React, { useState } from 'react';
import { X, Check, XCircle, Calendar, RefreshCw, AlertTriangle } from 'lucide-react';

const OrderActionModal = ({ isOpen, onClose, order, action, onConfirm }) => {
  const [formData, setFormData] = useState({
    reason: '',
    notes: '',
    newDate: '',
    newTime: '',
    finalPrice: order?.offered_price || 0
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(order.id, formData);
    onClose();
  };

  const actionConfig = {
    complete: {
      title: 'Complete Order',
      icon: Check,
      color: 'green',
      description: 'Mark this order as completed and finalize the transaction.'
    },
    reject: {
      title: 'Reject Order',
      icon: XCircle,
      color: 'red',
      description: 'Reject this order and provide a reason to the customer.'
    },
    reschedule: {
      title: 'Reschedule Pickup',
      icon: Calendar,
      color: 'blue',
      description: 'Change the pickup date and time for this order.'
    },
    reset: {
      title: 'Reset Assessment',
      icon: RefreshCw,
      color: 'yellow',
      description: 'Reset the condition assessment and allow customer to retake it.'
    }
  };

  const config = actionConfig[action];
  const Icon = config?.icon || AlertTriangle;

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className={`p-2 rounded-full bg-${config.color}-100 mr-3`}>
              <Icon className={`h-5 w-5 text-${config.color}-600`} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">{config.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-4">{config.description}</p>
          
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="text-sm">
              <div className="font-medium text-gray-900">Order: {order.order_id}</div>
              <div className="text-gray-600">Customer: {order.customer_name}</div>
              <div className="text-gray-600">Device: {order.manufacturer} {order.model}</div>
              <div className="text-gray-600">Current Value: ₹{order.offered_price}</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {action === 'complete' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Final Price (₹)
              </label>
              <input
                type="number"
                value={formData.finalPrice}
                onChange={(e) => setFormData({...formData, finalPrice: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter final price"
                required
              />
            </div>
          )}

          {action === 'reject' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason *
              </label>
              <select
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              >
                <option value="">Select reason</option>
                <option value="device_condition">Device condition worse than described</option>
                <option value="verification_failed">Device verification failed</option>
                <option value="price_too_low">Price too low for customer</option>
                <option value="incomplete_documents">Incomplete documentation</option>
                <option value="other">Other reason</option>
              </select>
            </div>
          )}

          {action === 'reschedule' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Date *
                </label>
                <input
                  type="date"
                  value={formData.newDate}
                  onChange={(e) => setFormData({...formData, newDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Time *
                </label>
                <input
                  type="time"
                  value={formData.newTime}
                  onChange={(e) => setFormData({...formData, newTime: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add any additional notes..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-white bg-${config.color}-600 rounded-md hover:bg-${config.color}-700`}
            >
              {config.title}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderActionModal;