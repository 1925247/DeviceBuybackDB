import React, { useState, useEffect } from 'react';
import { User, Package, MapPin, Phone, Clock, CheckCircle, AlertTriangle, Search, Filter, ArrowRight } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AdminAssignOrders = () => {
  const [orders, setOrders] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [locationFilter, setLocationFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch orders and agents
      const [ordersResponse, agentsResponse] = await Promise.all([
        fetch('/api/buyback-requests'),
        fetch('/api/agents')
      ]);

      if (ordersResponse.ok && agentsResponse.ok) {
        const ordersData = await ordersResponse.json();
        const agentsData = await agentsResponse.json();
        
        // Filter unassigned orders
        const unassignedOrders = ordersData.filter(order => 
          order.status === 'pending' || order.status === 'approved'
        );
        
        setOrders(unassignedOrders);
        setAgents(agentsData.filter(agent => agent.status === 'active'));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderSelection = (orderId) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(order => order.id));
    }
  };

  const handleAssignOrders = async () => {
    if (!selectedAgent || selectedOrders.length === 0) return;

    try {
      // Update orders to assign them to agent
      const promises = selectedOrders.map(orderId => 
        fetch(`/api/buyback-requests/${orderId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'assigned',
            assigned_agent_id: selectedAgent,
            assigned_at: new Date().toISOString()
          })
        })
      );

      await Promise.all(promises);
      
      // Refresh data
      await fetchData();
      setSelectedOrders([]);
      setSelectedAgent('');
      setShowAssignModal(false);
    } catch (error) {
      console.error('Error assigning orders:', error);
    }
  };

  const getAgentByPincode = (pincode) => {
    return agents.find(agent => agent.pincode === pincode) || null;
  };

  const getSuggestedAgent = (order) => {
    // Extract pincode from address or use a default matching logic
    const orderPincode = order.pickup_address?.match(/\d{6}/)?.[0];
    if (orderPincode) {
      return getAgentByPincode(orderPincode);
    }
    
    // Fallback: suggest agent with least assigned orders
    return agents.reduce((prev, current) => 
      (prev.assigned_orders || 0) < (current.assigned_orders || 0) ? prev : current
    );
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.order_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || order.status === statusFilter;
    
    const matchesLocation = !locationFilter || 
      order.pickup_address?.toLowerCase().includes(locationFilter.toLowerCase());
    
    return matchesSearch && matchesStatus && matchesLocation;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (price) => {
    const amount = parseFloat(price);
    if (amount > 30000) return 'text-red-600'; // High value
    if (amount > 15000) return 'text-orange-600'; // Medium value
    return 'text-green-600'; // Standard value
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Assign Orders to Agents</h1>
        <p className="text-gray-600 mt-2">Manage order assignments and agent workload distribution</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unassigned Orders</p>
              <p className="text-3xl font-bold text-yellow-600">{orders.length}</p>
            </div>
            <Package className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available Agents</p>
              <p className="text-3xl font-bold text-green-600">{agents.length}</p>
            </div>
            <User className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Selected Orders</p>
              <p className="text-3xl font-bold text-blue-600">{selectedOrders.length}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-3xl font-bold text-purple-600">
                ₹{orders.filter(o => selectedOrders.includes(o.id))
                  .reduce((sum, o) => sum + parseFloat(o.offered_price || 0), 0)
                  .toLocaleString('en-IN')}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
            </select>

            <input
              type="text"
              placeholder="Filter by location..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleSelectAll}
              className="px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
            >
              {selectedOrders.length === filteredOrders.length ? 'Deselect All' : 'Select All'}
            </button>
            <button
              onClick={() => setShowAssignModal(true)}
              disabled={selectedOrders.length === 0}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Assign Selected ({selectedOrders.length})
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                  onChange={handleSelectAll}
                  className="rounded"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer & Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Device & Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Suggested Agent
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.map(order => {
              const suggestedAgent = getSuggestedAgent(order);
              return (
                <tr key={order.id} className={`hover:bg-gray-50 ${selectedOrders.includes(order.id) ? 'bg-blue-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => handleOrderSelection(order.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        Order #{order.order_id}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        ID: {order.id}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {order.customer_name}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {order.customer_phone}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {order.pickup_address}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {order.manufacturer} {order.model}
                      </div>
                      <div className={`text-sm font-semibold ${getPriorityColor(order.offered_price)}`}>
                        ₹{parseFloat(order.offered_price || 0).toLocaleString('en-IN')}
                      </div>
                      <div className="text-xs text-gray-500">
                        Condition: {order.condition}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {suggestedAgent ? (
                      <div>
                        <div className="text-sm font-medium text-blue-900">
                          {suggestedAgent.name}
                        </div>
                        <div className="text-xs text-blue-600">
                          {suggestedAgent.pincode} • {suggestedAgent.assigned_orders || 0} orders
                        </div>
                        <div className="text-xs text-green-600">
                          Recommended ✓
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">No nearby agent</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                      {order.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                      <span className="capitalize">{order.status}</span>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No orders found</p>
          </div>
        )}
      </div>

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Assign Orders to Agent</h2>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Assigning {selectedOrders.length} orders
              </p>
              <div className="max-h-32 overflow-y-auto border rounded p-2 bg-gray-50">
                {orders.filter(o => selectedOrders.includes(o.id)).map(order => (
                  <div key={order.id} className="text-xs text-gray-700 mb-1">
                    #{order.order_id} - {order.customer_name} - ₹{parseFloat(order.offered_price || 0).toLocaleString('en-IN')}
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Agent</label>
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose an agent...</option>
                {agents.map(agent => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} - {agent.pincode} ({agent.assigned_orders || 0} current orders)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedAgent('');
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignOrders}
                disabled={!selectedAgent}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Assign Orders
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAssignOrders;