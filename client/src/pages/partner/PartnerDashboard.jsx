import React from 'react';
import { BarChart3, Users, DollarSign, Package } from 'lucide-react';

const PartnerDashboard = () => {
  const stats = [
    { name: 'Total Sales', value: '$12,345', icon: DollarSign, color: 'text-green-600' },
    { name: 'Active Orders', value: '23', icon: Package, color: 'text-blue-600' },
    { name: 'Customers', value: '156', icon: Users, color: 'text-purple-600' },
    { name: 'Revenue', value: '$8,765', icon: BarChart3, color: 'text-orange-600' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Partner Dashboard</h1>
            <p className="mt-2 text-gray-600">Welcome to your partner portal</p>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <div key={stat.name} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <IconComponent className={`h-8 w-8 ${stat.color}`} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-500">No recent activity to display.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerDashboard;