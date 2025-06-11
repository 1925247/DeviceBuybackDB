import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Package, 
  DollarSign, 
  TrendingUp, 
  ShoppingCart, 
  Smartphone,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDevices: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    activeListings: 0
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock data
      setStats({
        totalUsers: 1247,
        totalDevices: 3456,
        totalRevenue: 287650,
        pendingOrders: 23,
        completedOrders: 156,
        activeListings: 89
      });

      setRecentActivity([
        { id: 1, type: 'order', message: 'New buyback request submitted', time: '2 minutes ago', status: 'new' },
        { id: 2, type: 'user', message: 'User registration: john.doe@email.com', time: '15 minutes ago', status: 'info' },
        { id: 3, type: 'device', message: 'iPhone 13 Pro added to inventory', time: '1 hour ago', status: 'success' },
        { id: 4, type: 'order', message: 'Buyback completed: Order #ORD-1234', time: '2 hours ago', status: 'success' },
        { id: 5, type: 'alert', message: 'Low stock alert: Samsung Galaxy S21', time: '3 hours ago', status: 'warning' }
      ]);

      setRecentOrders([
        { id: 'ORD-001', customer: 'Sarah Johnson', device: 'iPhone 13 Pro', amount: 450, status: 'pending' },
        { id: 'ORD-002', customer: 'Mike Chen', device: 'MacBook Air M1', amount: 800, status: 'completed' },
        { id: 'ORD-003', customer: 'Emily Rodriguez', device: 'Samsung Galaxy S21', amount: 350, status: 'processing' },
        { id: 'ORD-004', customer: 'David Park', device: 'iPad Pro 11"', amount: 520, status: 'completed' },
        { id: 'ORD-005', customer: 'Lisa Wang', device: 'iPhone 12', amount: 380, status: 'pending' }
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, change, color = 'blue' }) => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm ${change.positive ? 'text-green-600' : 'text-red-600'} flex items-center mt-1`}>
              <TrendingUp className="h-4 w-4 mr-1" />
              {change.value}
            </p>
          )}
        </div>
        <div className={`bg-${color}-100 rounded-full p-3`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getActivityIcon = (type, status) => {
    switch (type) {
      case 'order':
        return status === 'new' ? <AlertCircle className="h-4 w-4 text-orange-500" /> : <ShoppingCart className="h-4 w-4 text-blue-500" />;
      case 'user':
        return <Users className="h-4 w-4 text-green-500" />;
      case 'device':
        return <Smartphone className="h-4 w-4 text-purple-500" />;
      case 'alert':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
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
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your platform.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={Users}
          change={{ positive: true, value: '+12% from last month' }}
          color="blue"
        />
        <StatCard
          title="Total Devices"
          value={stats.totalDevices.toLocaleString()}
          icon={Package}
          change={{ positive: true, value: '+8% from last month' }}
          color="green"
        />
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          change={{ positive: true, value: '+15% from last month' }}
          color="yellow"
        />
        <StatCard
          title="Pending Orders"
          value={stats.pendingOrders}
          icon={Clock}
          color="orange"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Order Status</h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Completed</span>
              <span className="font-semibold text-green-600">{stats.completedOrders}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pending</span>
              <span className="font-semibold text-yellow-600">{stats.pendingOrders}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active Listings</span>
              <span className="font-semibold text-blue-600">{stats.activeListings}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
              View All Orders
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
              Manage Devices
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
              User Management
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
              System Settings
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Database</span>
              <span className="flex items-center text-green-600">
                <CheckCircle className="h-4 w-4 mr-1" />
                Healthy
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">API Status</span>
              <span className="flex items-center text-green-600">
                <CheckCircle className="h-4 w-4 mr-1" />
                Online
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Storage</span>
              <span className="flex items-center text-yellow-600">
                <Clock className="h-4 w-4 mr-1" />
                85% Used
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map(activity => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type, activity.status)}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
          <div className="space-y-4">
            {recentOrders.map(order => (
              <div key={order.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{order.customer}</p>
                  <p className="text-sm text-gray-600">{order.device}</p>
                  <p className="text-xs text-gray-500">Order {order.id}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${order.amount}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;