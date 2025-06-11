import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Edit2, Check, X, Clock, Package, DollarSign } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AdminBuybacksNew = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchBuybackRequests();
  }, []);

  const fetchBuybackRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/buyback-requests');
      
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      } else {
        setRequests([]);
      }
    } catch (error) {
      console.error('Error fetching buyback requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId, newStatus, finalValue = null) => {
    try {
      const response = await fetch(`/api/buyback-requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus,
          ...(finalValue && { finalValue })
        })
      });

      if (response.ok) {
        await fetchBuybackRequests();
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error updating request:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_review': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'in_review': return <Eye className="h-4 w-4" />;
      case 'approved': return <Check className="h-4 w-4" />;
      case 'completed': return <Package className="h-4 w-4" />;
      case 'rejected': return <X className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.device.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_review', label: 'In Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'completed', label: 'Completed' },
    { value: 'rejected', label: 'Rejected' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Buyback Requests</h1>
        <p className="text-gray-600 mt-2">Manage device buyback requests and approvals</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-3xl font-bold text-gray-900">{requests.length}</p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-3xl font-bold text-gray-900">
                {requests.filter(r => r.status === 'pending').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-3xl font-bold text-gray-900">
                {requests.filter(r => r.status === 'approved').length}
              </p>
            </div>
            <Check className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-3xl font-bold text-gray-900">
                ${requests.reduce((sum, r) => sum + (r.finalValue || r.estimatedValue), 0).toLocaleString()}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
            }}
            className="flex items-center justify-center px-3 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Filter className="h-4 w-4 mr-2" />
            Clear
          </button>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Request
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Device
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRequests.map(request => (
              <tr key={request.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{request.id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{request.customerName}</div>
                    <div className="text-sm text-gray-500">{request.customerEmail}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{request.device}</div>
                    <div className="text-sm text-gray-500">{request.brand}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      ${request.finalValue || request.estimatedValue}
                    </div>
                    {request.finalValue && request.finalValue !== request.estimatedValue && (
                      <div className="text-sm text-gray-500">
                        Est: ${request.estimatedValue}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                    {getStatusIcon(request.status)}
                    <span className="ml-1 capitalize">{request.status.replace('_', ' ')}</span>
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(request.submittedAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  {request.status === 'pending' && (
                    <button
                      onClick={() => handleStatusUpdate(request.id, 'in_review')}
                      className="text-green-600 hover:text-green-900"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No buyback requests found</p>
          </div>
        )}
      </div>

      {/* Request Detail Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Request Details - {selectedRequest.id}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Customer Info */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{selectedRequest.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{selectedRequest.customerEmail}</p>
                </div>
              </div>
            </div>

            {/* Device Info */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Device Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Device</p>
                  <p className="font-medium">{selectedRequest.device}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Brand</p>
                  <p className="font-medium">{selectedRequest.brand}</p>
                </div>
              </div>
            </div>

            {/* Condition Answers */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Condition Assessment</h3>
              <div className="space-y-2">
                {Object.entries(selectedRequest.conditionAnswers).map(([key, value]) => (
                  <div key={key} className="flex justify-between p-2 bg-gray-50 rounded">
                    <span className="capitalize">{key.replace('_', ' ')}:</span>
                    <span className="font-medium capitalize">{value.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Valuation */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Valuation</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Estimated Value</p>
                  <p className="text-2xl font-bold text-gray-900">${selectedRequest.estimatedValue}</p>
                </div>
                {selectedRequest.finalValue && (
                  <div>
                    <p className="text-sm text-gray-600">Final Value</p>
                    <p className="text-2xl font-bold text-green-600">${selectedRequest.finalValue}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {selectedRequest.notes && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes</h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded">{selectedRequest.notes}</p>
              </div>
            )}

            {/* Status Actions */}
            <div className="flex justify-end space-x-3">
              {selectedRequest.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleStatusUpdate(selectedRequest.id, 'rejected')}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedRequest.id, 'in_review')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Start Review
                  </button>
                </>
              )}
              
              {selectedRequest.status === 'in_review' && (
                <button
                  onClick={() => handleStatusUpdate(selectedRequest.id, 'approved', selectedRequest.estimatedValue)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Approve
                </button>
              )}
              
              {selectedRequest.status === 'approved' && (
                <button
                  onClick={() => handleStatusUpdate(selectedRequest.id, 'completed')}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Mark Complete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBuybacksNew;