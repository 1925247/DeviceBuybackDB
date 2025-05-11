import React, { useState } from 'react';
import { 
  ShoppingCart, 
  DollarSign, 
  Users, 
  Smartphone, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  AlertCircle,
  Bell,
  Settings,
  RefreshCw
} from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const [dateRange, setDateRange] = useState('week');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock data for statistics
  const stats = [
    {
      title: 'Total Orders',
      value: '1,284',
      change: '+12.5%',
      trend: 'up',
      icon: <ShoppingCart size={24} />,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Revenue',
      value: '₹48,294',
      change: '+8.2%',
      trend: 'up',
      icon: <DollarSign size={24} />,
      color: 'bg-green-500',
    },
    {
      title: 'Total Users',
      value: '3,567',
      change: '+5.7%',
      trend: 'up',
      icon: <Users size={24} />,
      color: 'bg-purple-500',
    },
    {
      title: 'Devices Sold',
      value: '982',
      change: '-2.3%',
      trend: 'down',
      icon: <Smartphone size={24} />,
      color: 'bg-orange-500',
    },
  ];

  // Line chart data for revenue (in INR)
  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Revenue',
        data: [12000, 19000, 15000, 22000, 18000, 24000, 25000, 28000, 30000, 25000, 32000, 38000],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Bar chart data for device types
  const deviceTypeData = {
    labels: ['Smartphones', 'Laptops', 'Tablets', 'Smartwatches'],
    datasets: [
      {
        label: 'Devices Sold',
        data: [450, 290, 180, 120],
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(139, 92, 246, 0.7)',
          'rgba(249, 115, 22, 0.7)',
        ],
      },
    ],
  };

  // Doughnut chart data for brands
  const brandData = {
    labels: ['Apple', 'Samsung', 'Google', 'OnePlus', 'Others'],
    datasets: [
      {
        data: [35, 25, 15, 12, 13],
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(139, 92, 246, 0.7)',
          'rgba(249, 115, 22, 0.7)',
          'rgba(107, 114, 128, 0.7)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Recent orders data with INR amounts
  const recentOrders = [
    {
      id: 'ORD123456',
      customer: 'John Doe',
      device: 'iPhone 15 Pro Max',
      amount: '₹850',
      status: 'Completed',
      date: '2023-05-15',
    },
    {
      id: 'ORD123457',
      customer: 'Jane Smith',
      device: 'Samsung Galaxy S23 Ultra',
      amount: '₹700',
      status: 'Processing',
      date: '2023-05-14',
    },
    {
      id: 'ORD123458',
      customer: 'Robert Johnson',
      device: 'MacBook Pro 16" (M3)',
      amount: '₹1,500',
      status: 'Pending',
      date: '2023-05-14',
    },
    {
      id: 'ORD123459',
      customer: 'Emily Davis',
      device: 'iPad Pro 12.9"',
      amount: '₹700',
      status: 'Completed',
      date: '2023-05-13',
    },
    {
      id: 'ORD123460',
      customer: 'Michael Wilson',
      device: 'Apple Watch Series 9',
      amount: '₹250',
      status: 'Completed',
      date: '2023-05-12',
    },
  ];

  // System alerts (displayed in one line with professional styling)
  const systemAlerts = [
    {
      id: 1,
      type: 'warning',
      message: 'Low inventory alert: iPhone 15 Pro Max (2 units remaining)',
      time: '5 minutes ago'
    },
    {
      id: 2,
      type: 'error',
      message: 'Payment gateway timeout detected',
      time: '15 minutes ago'
    },
    {
      id: 3,
      type: 'success',
      message: 'Daily backup completed successfully',
      time: '1 hour ago'
    }
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Overview of your business performance and analytics
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-4">
          <button
            onClick={handleRefresh}
            className={`p-2 text-gray-400 hover:text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`}
          >
            <RefreshCw className="h-5 w-5" />
          </button>
          <div className="relative">
            <Calendar className="h-5 w-5 text-gray-400 mr-2" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* System Alerts - Professional Inline Design */}
      <div className="mb-8 flex flex-wrap items-center gap-4">
        {systemAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`
              flex items-center gap-3 p-3 rounded-md shadow-sm border-l-4
              ${alert.type === 'warning'
                ? 'border-yellow-400 bg-yellow-50 text-yellow-800'
                : alert.type === 'error'
                ? 'border-red-400 bg-red-50 text-red-800'
                : 'border-green-400 bg-green-50 text-green-800'}
            `}
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">{alert.message}</p>
              <p className="text-xs opacity-70">{alert.time}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${stat.color} text-white`}>
                  {stat.icon}
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.title}
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {stat.value}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <div className="flex items-center">
                  {stat.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span
                    className={`font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {stat.change}
                  </span>
                  <span className="ml-2 text-gray-500">from previous period</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Revenue Overview</h2>
          <div className="h-80">
            <Line 
              data={revenueData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return '₹' + value.toLocaleString();
                      }
                    }
                  }
                },
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return '₹' + context.raw.toLocaleString();
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Devices Sold by Type</h2>
          <div className="h-80">
            <Bar 
              data={deviceTypeData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="bg-white shadow rounded-lg p-6 lg:col-span-1">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Popular Brands</h2>
          <div className="h-64">
            <Doughnut 
              data={brandData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } }
              }}
            />
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Recent Orders</h2>
            <a href="/admin/orders" className="text-sm font-medium text-blue-600 hover:text-blue-500">
              View all
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Device
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.device}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.status === 'Completed'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'Processing'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
          <div className="space-y-4">
            <button className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
              <Bell className="h-5 w-5 mr-2" />
              Send Notifications
            </button>
            <button className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700">
              <Settings className="h-5 w-5 mr-2" />
              Update Settings
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">System Status</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Server Status</span>
              <span className="flex items-center text-green-600">
                <span className="h-2 w-2 bg-green-600 rounded-full mr-2"></span>
                Operational
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Payment Gateway</span>
              <span className="flex items-center text-green-600">
                <span className="h-2 w-2 bg-green-600 rounded-full mr-2"></span>
                Active
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">API Status</span>
              <span className="flex items-center text-green-600">
                <span className="h-2 w-2 bg-green-600 rounded-full mr-2"></span>
                Online
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[
              { action: 'New user registered', time: '5 minutes ago' },
              { action: 'Order #12345 updated', time: '15 minutes ago' },
              { action: 'Payment processed', time: '1 hour ago' },
            ].map((activity, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-gray-600">{activity.action}</span>
                <span className="text-gray-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
