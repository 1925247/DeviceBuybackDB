import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapPin, Phone, Package, DollarSign, CheckCircle, XCircle, Clock, User, Eye, Camera } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const PickupAgentDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showReEvaluation, setShowReEvaluation] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssignedOrders();
  }, []);

  const fetchAssignedOrders = async () => {
    try {
      const response = await fetch('/api/buyback-requests?agent_view=true');
      if (response.ok) {
        const data = await response.json();
        // Filter pending orders for pickup
        const pendingOrders = data.filter(order => 
          order.status === 'pending' || order.status === 'approved'
        );
        setOrders(pendingOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const startReEvaluation = (order) => {
    setSelectedOrder(order);
    setShowReEvaluation(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Pickup Agent Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage assigned device pickups and re-evaluations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Assigned</p>
              <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Pickup</p>
              <p className="text-3xl font-bold text-yellow-600">
                {orders.filter(o => o.status === 'pending').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ready for Pickup</p>
              <p className="text-3xl font-bold text-green-600">
                {orders.filter(o => o.status === 'approved').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-3xl font-bold text-purple-600">
                ₹{orders.reduce((sum, o) => sum + (parseFloat(o.offered_price || o.offeredPrice || 0)), 0).toLocaleString('en-IN')}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Assigned Pickups</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer & Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Device & Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Original Assessment
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
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-8 w-8 text-gray-300 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {order.customer_name || order.customerName}
                        </div>
                        <div className="text-sm text-gray-500">
                          <Phone className="inline h-3 w-3 mr-1" />
                          {order.customer_phone || order.customerPhone}
                        </div>
                        <div className="text-sm text-gray-500">
                          <MapPin className="inline h-3 w-3 mr-1" />
                          {order.pickup_address || order.pickupAddress}
                        </div>
                        <div className="text-xs text-blue-600 font-mono">
                          Order: {order.order_id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {order.manufacturer} {order.model}
                      </div>
                      <div className="text-sm text-green-600 font-semibold">
                        Online Price: ₹{parseFloat(order.offered_price || order.offeredPrice || 0).toLocaleString('en-IN')}
                      </div>
                      <div className="text-xs text-gray-500">
                        Condition: {order.condition}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {order.condition_answers ? (
                        <div>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {Object.keys(JSON.parse(order.condition_answers)).length} Questions Answered
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">No assessment data</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                      {order.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                      <span className="capitalize">{order.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => navigate(`/agent/order-details/${order.id}`)}
                      className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => startReEvaluation(order)}
                      className="text-green-600 hover:text-green-900 inline-flex items-center"
                    >
                      <Camera className="h-4 w-4 mr-1" />
                      Re-evaluate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {orders.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No orders assigned for pickup</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PickupAgentDashboard;