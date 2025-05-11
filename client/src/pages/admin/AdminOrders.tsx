import React from 'react';

const AdminOrders = () => {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage customer orders and track their status
          </p>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {[
            {
              id: 'ORD123456',
              customer: 'John Doe',
              device: 'iPhone 15 Pro Max',
              amount: '$850',
              status: 'Completed',
              date: '2023-05-15',
            },
            {
              id: 'ORD123457',
              customer: 'Jane Smith',
              device: 'Samsung Galaxy S23 Ultra',
              amount: '$700',
              status: 'Processing',
              date: '2023-05-14',
            },
            {
              id: 'ORD123458',
              customer: 'Robert Johnson',
              device: 'MacBook Pro 16" (M3)',
              amount: '$1,500',
              status: 'Pending',
              date: '2023-05-14',
            },
            {
              id: 'ORD123459',
              customer: 'Emily Davis',
              device: 'iPad Pro 12.9"',
              amount: '$700',
              status: 'Completed',
              date: '2023-05-13',
            },
            {
              id: 'ORD123460',
              customer: 'Michael Wilson',
              device: 'Apple Watch Series 9',
              amount: '$250',
              status: 'Completed',
              date: '2023-05-12',
            },
          ].map((order) => (
            <li key={order.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <p className="text-sm font-medium text-blue-600 truncate">{order.id}</p>
                    <div className="ml-4 flex-shrink-0">
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
                    </div>
                  </div>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className="text-sm text-gray-500">{order.date}</p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      {order.customer}
                    </p>
                    <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                      {order.device}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <p className="font-medium">{order.amount}</p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminOrders;