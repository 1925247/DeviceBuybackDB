import React from 'react';
import { Link } from 'react-router-dom';
import { useUsers, useUsersCount } from '@/hooks/use-users';
import { useOrders, useRecentOrders } from '@/hooks/use-orders';
import { useBuybackRequests, useBuybackRequestsCount, useRecentBuybackRequests } from '@/hooks/use-buyback-requests';
import { Skeleton } from '@/components/ui/skeleton';

// Get status color based on status string
const getOrderStatusColor = (status: string) => {
  switch(status?.toLowerCase()) {
    case 'completed':
      return 'text-green-600';
    case 'processing':
      return 'text-yellow-600';
    case 'pending':
      return 'text-blue-600';
    case 'cancelled':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
};

// Get buyback request status color
const getBuybackStatusColor = (status: string) => {
  switch(status?.toLowerCase()) {
    case 'approved':
      return 'text-green-600';
    case 'pending':
      return 'text-yellow-600';
    case 'awaiting inspection':
      return 'text-blue-600';
    case 'rejected':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
};

// Format price to currency
const formatPrice = (price: string | number) => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(numPrice);
};

const AdminDashboard: React.FC = () => {
  // Fetch data
  const { data: usersCountData, isLoading: isLoadingUsersCount } = useUsersCount();
  const { data: buybackRequestsData, isLoading: isLoadingBuybackRequests } = useBuybackRequestsCount();
  const { data: pendingBuybackRequestsData, isLoading: isLoadingPendingRequests } = useBuybackRequestsCount('pending');
  const { data: recentOrdersData, isLoading: isLoadingRecentOrders } = useRecentOrders(3);
  const { data: recentBuybackRequestsData, isLoading: isLoadingRecentBuybackRequests } = useRecentBuybackRequests(3);
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Devices</h2>
          {isLoadingUsersCount ? (
            <Skeleton className="h-10 w-20" />
          ) : (
            <div className="text-3xl font-bold text-indigo-600">
              {usersCountData?.deviceCount || 0}
            </div>
          )}
          <p className="text-gray-500 text-sm mt-1">Total devices in inventory</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Orders</h2>
          {isLoadingUsersCount ? (
            <Skeleton className="h-10 w-20" />
          ) : (
            <div className="text-3xl font-bold text-green-600">
              {usersCountData?.orderCount || 0}
            </div>
          )}
          <p className="text-gray-500 text-sm mt-1">Orders this month</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Buyback Requests</h2>
          {isLoadingPendingRequests ? (
            <Skeleton className="h-10 w-20" />
          ) : (
            <div className="text-3xl font-bold text-blue-600">
              {pendingBuybackRequestsData?.count || 0}
            </div>
          )}
          <p className="text-gray-500 text-sm mt-1">Pending requests</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Users</h2>
          {isLoadingUsersCount ? (
            <Skeleton className="h-10 w-20" />
          ) : (
            <div className="text-3xl font-bold text-purple-600">
              {usersCountData?.count || 0}
            </div>
          )}
          <p className="text-gray-500 text-sm mt-1">Registered accounts</p>
        </div>
      </div>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
          {isLoadingRecentOrders ? (
            <div className="space-y-2">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : (
            <div className="divide-y">
              {recentOrdersData && recentOrdersData.length > 0 ? (
                recentOrdersData.map((order: any) => (
                  <div key={order.id} className="py-3 flex justify-between">
                    <div>
                      <div className="font-medium">Order #{order.id}</div>
                      <div className="text-sm text-gray-500">{order.product_name || order.items?.[0]?.name || 'Product'}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatPrice(order.total_price || order.total || 0)}</div>
                      <div className={`text-sm ${getOrderStatusColor(order.status)}`}>{order.status || 'Pending'}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-3 text-center text-gray-500">No recent orders</div>
              )}
            </div>
          )}
          <Link to="/admin/orders" className="block text-indigo-600 hover:text-indigo-800 text-sm mt-4">
            View all orders →
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Buyback Requests</h2>
          {isLoadingRecentBuybackRequests ? (
            <div className="space-y-2">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : (
            <div className="divide-y">
              {recentBuybackRequestsData && recentBuybackRequestsData.length > 0 ? (
                recentBuybackRequestsData.map((request: any) => (
                  <div key={request.id} className="py-3 flex justify-between">
                    <div>
                      <div className="font-medium">Request #{request.id}</div>
                      <div className="text-sm text-gray-500">
                        {request.manufacturer} {request.model}, {request.condition}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatPrice(request.offered_price || 0)}</div>
                      <div className={`text-sm ${getBuybackStatusColor(request.status)}`}>
                        {request.status || 'Pending'}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-3 text-center text-gray-500">No recent buyback requests</div>
              )}
            </div>
          )}
          <Link to="/admin/buybacks" className="block text-indigo-600 hover:text-indigo-800 text-sm mt-4">
            View all requests →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;