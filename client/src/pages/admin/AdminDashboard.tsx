import React from 'react';

const AdminDashboard: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Devices</h2>
          <div className="text-3xl font-bold text-indigo-600">124</div>
          <p className="text-gray-500 text-sm mt-1">Total devices in inventory</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Orders</h2>
          <div className="text-3xl font-bold text-green-600">36</div>
          <p className="text-gray-500 text-sm mt-1">Orders this month</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Buyback Requests</h2>
          <div className="text-3xl font-bold text-blue-600">18</div>
          <p className="text-gray-500 text-sm mt-1">Pending requests</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Users</h2>
          <div className="text-3xl font-bold text-purple-600">412</div>
          <p className="text-gray-500 text-sm mt-1">Registered accounts</p>
        </div>
      </div>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
          <div className="divide-y">
            <div className="py-3 flex justify-between">
              <div>
                <div className="font-medium">Order #12345</div>
                <div className="text-sm text-gray-500">iPhone 13 Pro</div>
              </div>
              <div className="text-right">
                <div className="font-medium">$799.00</div>
                <div className="text-sm text-green-600">Completed</div>
              </div>
            </div>
            <div className="py-3 flex justify-between">
              <div>
                <div className="font-medium">Order #12344</div>
                <div className="text-sm text-gray-500">MacBook Pro 2021</div>
              </div>
              <div className="text-right">
                <div className="font-medium">$1,499.00</div>
                <div className="text-sm text-yellow-600">Processing</div>
              </div>
            </div>
            <div className="py-3 flex justify-between">
              <div>
                <div className="font-medium">Order #12343</div>
                <div className="text-sm text-gray-500">Samsung Galaxy S22</div>
              </div>
              <div className="text-right">
                <div className="font-medium">$699.00</div>
                <div className="text-sm text-green-600">Completed</div>
              </div>
            </div>
          </div>
          <a href="#" className="block text-indigo-600 hover:text-indigo-800 text-sm mt-4">View all orders →</a>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Buyback Requests</h2>
          <div className="divide-y">
            <div className="py-3 flex justify-between">
              <div>
                <div className="font-medium">Request #45678</div>
                <div className="text-sm text-gray-500">iPhone 12, Good Condition</div>
              </div>
              <div className="text-right">
                <div className="font-medium">$350.00</div>
                <div className="text-sm text-yellow-600">Pending Approval</div>
              </div>
            </div>
            <div className="py-3 flex justify-between">
              <div>
                <div className="font-medium">Request #45677</div>
                <div className="text-sm text-gray-500">Google Pixel 6, Excellent</div>
              </div>
              <div className="text-right">
                <div className="font-medium">$320.00</div>
                <div className="text-sm text-blue-600">Awaiting Inspection</div>
              </div>
            </div>
            <div className="py-3 flex justify-between">
              <div>
                <div className="font-medium">Request #45676</div>
                <div className="text-sm text-gray-500">iPad Pro 2020, Fair</div>
              </div>
              <div className="text-right">
                <div className="font-medium">$280.00</div>
                <div className="text-sm text-green-600">Approved</div>
              </div>
            </div>
          </div>
          <a href="#" className="block text-indigo-600 hover:text-indigo-800 text-sm mt-4">View all requests →</a>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;