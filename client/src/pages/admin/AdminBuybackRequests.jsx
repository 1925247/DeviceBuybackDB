import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Package, Search, Filter, Download, Eye, Edit, 
  CheckCircle, XCircle, Clock, AlertTriangle,
  Phone, Mail, MapPin, Calendar, Smartphone, 
  TrendingUp, ExternalLink, Target, Check, RefreshCw
} from 'lucide-react';
import LeadSourceBadge from '../../components/LeadSourceBadge';
import OrderActionModal from '../../components/admin/OrderActionModal';
import OrderDetailsModal from '../../components/admin/OrderDetailsModal';

const AdminBuybackRequests = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentAction, setCurrentAction] = useState('');
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading, error } = useQuery({
    queryKey: ['/api/buyback-requests'],
    refetchInterval: 10000
  });

  const updateRequestMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await fetch(`/api/buyback-requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update request');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/buyback-requests']);
    }
  });

  const handleOrderAction = (order, action) => {
    setSelectedRequest(order);
    setCurrentAction(action);
    setShowActionModal(true);
  };

  const handleActionConfirm = async (orderId, formData) => {
    let updateData = {};
    
    switch (currentAction) {
      case 'complete':
        updateData = {
          status: 'completed',
          final_price: formData.finalPrice,
          notes: formData.notes,
          completed_at: new Date().toISOString()
        };
        break;
      case 'reject':
        updateData = {
          status: 'cancelled',
          rejection_reason: formData.reason,
          notes: formData.notes,
          cancelled_at: new Date().toISOString()
        };
        break;
      case 'reschedule':
        updateData = {
          pickup_date: formData.newDate,
          pickup_time: formData.newTime,
          notes: formData.notes,
          status: 'processing'
        };
        break;
      case 'reset':
        updateData = {
          status: 'pending',
          condition_answers: null,
          notes: formData.notes,
          reset_at: new Date().toISOString()
        };
        break;
    }

    updateRequestMutation.mutate({ id: orderId, data: updateData });
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.order_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.customer_email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return Clock;
      case 'processing': return AlertTriangle;
      case 'completed': return CheckCircle;
      case 'cancelled': return XCircle;
      default: return Clock;
    }
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

  const getLeadSourceInfo = (request) => {
    const source = request.lead_source || request.utm_source || 'unknown';
    const medium = request.lead_medium || request.utm_medium || 'unknown';
    const campaign = request.lead_campaign || request.utm_campaign;
    
    const sourceColors = {
      'google': 'bg-blue-100 text-blue-800',
      'facebook': 'bg-blue-100 text-blue-800',
      'instagram': 'bg-pink-100 text-pink-800',
      'twitter': 'bg-blue-100 text-blue-800',
      'linkedin': 'bg-blue-100 text-blue-800',
      'direct': 'bg-green-100 text-green-800',
      'organic': 'bg-green-100 text-green-800',
      'referral': 'bg-purple-100 text-purple-800',
      'email': 'bg-orange-100 text-orange-800',
      'unknown': 'bg-gray-100 text-gray-800'
    };
    
    const color = sourceColors[source] || sourceColors[medium] || sourceColors['unknown'];
    
    return {
      source,
      medium,
      campaign,
      color,
      display: campaign ? `${source}/${campaign}` : `${source}/${medium}`
    };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };



  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-red-800 font-medium">Error Loading Requests</h3>
          <p className="text-red-600 text-sm mt-1">
            Failed to load buyback requests. Please refresh the page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Buyback Requests</h1>
        <p className="text-gray-600">Manage and track all device buyback requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {requests.filter(r => r.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {requests.filter(r => r.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{requests.reduce((sum, r) => sum + (r.offered_price || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by customer name, order ID, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
            <p className="text-gray-500">
              {requests.length === 0 ? 'No buyback requests yet.' : 'No requests match your search criteria.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Device
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lead Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request) => {
                  const StatusIcon = getStatusIcon(request.status);
                  return (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {request.order_id}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(request.created_at)}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {request.customer_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {request.customer_email}
                          </div>
                          <div className="text-sm text-gray-500">
                            {request.customer_phone}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {request.manufacturer} {request.model}
                          </div>
                          <div className="text-sm text-gray-500 capitalize">
                            {request.device_type} • {request.condition}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <LeadSourceBadge 
                            source={request.lead_source || request.utm_source}
                            medium={request.lead_medium || request.utm_medium}
                            campaign={request.utm_campaign}
                          />
                          {request.utm_term && (
                            <div className="text-xs text-gray-500 mt-1">
                              Term: {request.utm_term}
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ₹{request.offered_price?.toLocaleString()}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <StatusIcon className="h-4 w-4 mr-2 text-gray-400" />
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowDetailsModal(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900 p-1"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          
                          {request.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleOrderAction(request, 'complete')}
                                className="text-green-600 hover:text-green-900 p-1"
                                title="Complete Order"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleOrderAction(request, 'reject')}
                                className="text-red-600 hover:text-red-900 p-1"
                                title="Reject Order"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleOrderAction(request, 'reschedule')}
                                className="text-blue-600 hover:text-blue-900 p-1"
                                title="Reschedule Pickup"
                              >
                                <Calendar className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleOrderAction(request, 'reset')}
                                className="text-yellow-600 hover:text-yellow-900 p-1"
                                title="Reset Assessment"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          
                          {request.status === 'processing' && (
                            <>
                              <button
                                onClick={() => handleOrderAction(request, 'complete')}
                                className="text-green-600 hover:text-green-900 p-1"
                                title="Complete Order"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleOrderAction(request, 'reject')}
                                className="text-red-600 hover:text-red-900 p-1"
                                title="Reject Order"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleOrderAction(request, 'reschedule')}
                                className="text-blue-600 hover:text-blue-900 p-1"
                                title="Reschedule Pickup"
                              >
                                <Calendar className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Action Modal */}
      <OrderActionModal
        isOpen={showActionModal}
        onClose={() => setShowActionModal(false)}
        order={selectedRequest}
        action={currentAction}
        onConfirm={handleActionConfirm}
      />

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        order={selectedRequest}
      />
    </div>
  );
};

export default AdminBuybackRequests;