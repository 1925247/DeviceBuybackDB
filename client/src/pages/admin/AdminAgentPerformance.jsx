import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { User, TrendingUp, Package, CheckCircle, Clock, Star, MapPin, Calendar } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AdminAgentPerformance = () => {
  const [agents, setAgents] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [dateRange, setDateRange] = useState('30');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformanceData();
  }, [dateRange]);

  const fetchPerformanceData = async () => {
    try {
      // Fetch agents
      const agentsResponse = await fetch('/api/agents');
      const agentsData = await agentsResponse.json();
      setAgents(agentsData);

      // Generate performance metrics
      const performanceMetrics = agentsData.map(agent => ({
        ...agent,
        totalOrders: agent.assigned_orders + agent.completed_orders,
        successRate: agent.completed_orders ? Math.round((agent.completed_orders / (agent.completed_orders + agent.assigned_orders)) * 100) : 0,
        avgPickupTime: Math.random() * 2 + 1, // Mock data: 1-3 hours
        customerRating: (Math.random() * 1.5 + 3.5).toFixed(1), // Mock data: 3.5-5.0
        revenue: agent.completed_orders * (Math.random() * 5000 + 10000), // Mock revenue
        weeklyData: generateWeeklyData()
      }));

      setPerformanceData(performanceMetrics);
    } catch (error) {
      console.error('Error fetching performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateWeeklyData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      day,
      orders: Math.floor(Math.random() * 8) + 1,
      completed: Math.floor(Math.random() * 6) + 1
    }));
  };

  const getPerformanceColor = (rate) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const chartColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

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
        <h1 className="text-3xl font-bold text-gray-900">Agent Performance Analytics</h1>
        <p className="text-gray-600 mt-2">Track and analyze pickup agent performance metrics</p>
      </div>

      {/* Date Range Filter */}
      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Time Period:</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 3 months</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      {/* Overall Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Agents</p>
              <p className="text-3xl font-bold text-gray-900">{agents.length}</p>
            </div>
            <User className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-3xl font-bold text-green-600">
                {performanceData.reduce((sum, agent) => sum + agent.totalOrders, 0)}
              </p>
            </div>
            <Package className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Success Rate</p>
              <p className="text-3xl font-bold text-purple-600">
                {Math.round(performanceData.reduce((sum, agent) => sum + agent.successRate, 0) / performanceData.length || 0)}%
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-yellow-600">
                ₹{Math.round(performanceData.reduce((sum, agent) => sum + agent.revenue, 0)).toLocaleString('en-IN')}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Agent Performance Comparison */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Agent Performance Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed_orders" fill="#10B981" name="Completed Orders" />
              <Bar dataKey="assigned_orders" fill="#F59E0B" name="Assigned Orders" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Success Rate Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Success Rate Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Excellent (90%+)', value: performanceData.filter(a => a.successRate >= 90).length, color: '#10B981' },
                  { name: 'Good (75-89%)', value: performanceData.filter(a => a.successRate >= 75 && a.successRate < 90).length, color: '#F59E0B' },
                  { name: 'Needs Improvement (<75%)', value: performanceData.filter(a => a.successRate < 75).length, color: '#EF4444' }
                ]}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {[0, 1, 2].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#10B981', '#F59E0B', '#EF4444'][index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Agent Performance Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Detailed Agent Performance</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders & Success Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance Metrics
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue & Rating
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
              {performanceData.map(agent => (
                <tr key={agent.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-8 w-8 text-gray-300 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {agent.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {agent.email}
                        </div>
                        <div className="text-xs text-gray-400 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {agent.pincode}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        Total: {agent.totalOrders} orders
                      </div>
                      <div className="text-sm text-gray-500">
                        Completed: {agent.completed_orders} | Assigned: {agent.assigned_orders}
                      </div>
                      <div className={`text-sm font-semibold ${getPerformanceColor(agent.successRate)}`}>
                        Success Rate: {agent.successRate}%
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Avg Pickup: {agent.avgPickupTime.toFixed(1)}h
                      </div>
                      <div className="text-sm text-gray-500">
                        Response Time: Excellent
                      </div>
                      <div className="text-xs text-green-600">
                        On-time Rate: 95%
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        ₹{Math.round(agent.revenue).toLocaleString('en-IN')}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Star className="h-3 w-3 mr-1 text-yellow-400" />
                        {agent.customerRating}/5.0
                      </div>
                      <div className="text-xs text-blue-600">
                        {agent.completed_orders} reviews
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                      <span className="capitalize">{agent.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setSelectedAgent(agent)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Agent Detail Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Agent Performance Details - {selectedAgent.name}</h2>
              <button
                onClick={() => setSelectedAgent(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly Performance Chart */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Weekly Performance</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={selectedAgent.weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="orders" stroke="#3B82F6" name="Orders Assigned" />
                    <Line type="monotone" dataKey="completed" stroke="#10B981" name="Orders Completed" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Agent Stats */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Performance Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-600">Total Orders</p>
                    <p className="text-2xl font-bold text-blue-700">{selectedAgent.totalOrders}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-600">Success Rate</p>
                    <p className="text-2xl font-bold text-green-700">{selectedAgent.successRate}%</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-sm text-yellow-600">Customer Rating</p>
                    <p className="text-2xl font-bold text-yellow-700">{selectedAgent.customerRating}/5</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-purple-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-purple-700">₹{Math.round(selectedAgent.revenue).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAgentPerformance;