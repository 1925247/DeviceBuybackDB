import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, Target, Users, DollarSign, BarChart3, 
  PieChart, ExternalLink, Filter, Calendar, Download,
  Globe, Search, Share2, Mail, Smartphone, Package, Clock
} from 'lucide-react';

const AdminAnalyticsSimple = () => {
  const [dateRange, setDateRange] = useState('30d');

  const { data: requests = [], isLoading, error } = useQuery({
    queryKey: ['/api/buyback-requests'],
    refetchInterval: 30000,
    retry: 1
  });

  // Simple analytics processing
  const analytics = useMemo(() => {
    if (!requests.length) return {
      totalLeads: 0,
      totalValue: 0,
      totalConversions: 0,
      overallConversionRate: 0,
      avgLeadValue: 0,
      sources: [],
      mediums: [],
      recentRequests: []
    };

    // Filter by date range
    const now = new Date();
    const daysBack = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      'all': Infinity
    }[dateRange];

    const filteredRequests = requests.filter(req => {
      if (daysBack === Infinity) return true;
      const reqDate = new Date(req.created_at);
      const cutoff = new Date(now - daysBack * 24 * 60 * 60 * 1000);
      return reqDate >= cutoff;
    });

    // Calculate basic stats
    const totalValue = filteredRequests.reduce((sum, req) => sum + (req.offered_price || 0), 0);
    const completedRequests = filteredRequests.filter(r => r.status === 'completed');
    
    // Source analysis
    const sourceCount = {};
    filteredRequests.forEach(req => {
      const source = req.lead_source || req.utm_source || 'direct';
      sourceCount[source] = (sourceCount[source] || 0) + 1;
    });

    const sources = Object.entries(sourceCount)
      .map(([name, count]) => ({ name, count, percentage: (count / filteredRequests.length * 100).toFixed(1) }))
      .sort((a, b) => b.count - a.count);

    // Medium analysis
    const mediumCount = {};
    filteredRequests.forEach(req => {
      const medium = req.lead_medium || req.utm_medium || 'none';
      mediumCount[medium] = (mediumCount[medium] || 0) + 1;
    });

    const mediums = Object.entries(mediumCount)
      .map(([name, count]) => ({ name, count, percentage: (count / filteredRequests.length * 100).toFixed(1) }))
      .sort((a, b) => b.count - a.count);

    return {
      totalLeads: filteredRequests.length,
      totalValue,
      totalConversions: completedRequests.length,
      overallConversionRate: filteredRequests.length > 0 
        ? (completedRequests.length / filteredRequests.length) * 100 
        : 0,
      avgLeadValue: filteredRequests.length > 0 ? totalValue / filteredRequests.length : 0,
      sources: sources.slice(0, 10),
      mediums: mediums.slice(0, 10),
      recentRequests: filteredRequests.slice(0, 5)
    };
  }, [requests, dateRange]);

  const getSourceIcon = (source) => {
    const iconMap = {
      'google': Search,
      'facebook': Share2,
      'instagram': Smartphone,
      'twitter': Share2,
      'linkedin': Share2,
      'email': Mail,
      'direct': Globe,
      'organic': Search
    };
    return iconMap[source] || Target;
  };

  const getSourceColor = (source) => {
    const colorMap = {
      'google': 'bg-blue-100 text-blue-800',
      'facebook': 'bg-blue-100 text-blue-800',
      'instagram': 'bg-pink-100 text-pink-800',
      'twitter': 'bg-blue-100 text-blue-800',
      'linkedin': 'bg-blue-100 text-blue-800',
      'email': 'bg-orange-100 text-orange-800',
      'direct': 'bg-green-100 text-green-800',
      'organic': 'bg-green-100 text-green-800'
    };
    return colorMap[source] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
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
          <h3 className="text-red-800 font-medium">Unable to Load Analytics</h3>
          <p className="text-red-600 text-sm mt-1">
            There was an issue loading the analytics data. Please check if the buyback requests API is working properly.
          </p>
          <div className="mt-3">
            <button 
              onClick={() => window.location.reload()} 
              className="text-red-700 hover:text-red-900 text-sm underline"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Lead Analytics Dashboard</h1>
        <p className="text-gray-600">Track lead sources and conversion performance</p>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Leads</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalLeads}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.overallConversionRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">₹{analytics.totalValue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Target className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Lead Value</p>
              <p className="text-2xl font-bold text-gray-900">₹{Math.round(analytics.avgLeadValue).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lead Sources and Traffic Mediums */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Lead Sources */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Lead Sources</h3>
          {analytics.sources.length > 0 ? (
            <div className="space-y-4">
              {analytics.sources.map(source => {
                const IconComponent = getSourceIcon(source.name);
                return (
                  <div key={source.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <IconComponent className="h-5 w-5 text-gray-500 mr-3" />
                      <div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSourceColor(source.name)}`}>
                          {source.name}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {source.percentage}% of total leads
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{source.count}</p>
                      <p className="text-xs text-gray-500">leads</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No lead source data available</p>
            </div>
          )}
        </div>

        {/* Traffic Mediums */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic Mediums</h3>
          {analytics.mediums.length > 0 ? (
            <div className="space-y-4">
              {analytics.mediums.map(medium => (
                <div key={medium.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium text-gray-900 capitalize">{medium.name}</span>
                    <p className="text-xs text-gray-500">
                      {medium.percentage}% of traffic
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{medium.count}</p>
                    <p className="text-xs text-gray-500">leads</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No traffic medium data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Requests */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Buyback Requests</h3>
        {analytics.recentRequests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Device
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.recentRequests.map(request => (
                  <tr key={request.id || request.order_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {request.customer_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {request.customer_email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {request.manufacturer} {request.model}
                      </div>
                      <div className="text-sm text-gray-500 capitalize">
                        {request.device_type}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSourceColor(request.lead_source || request.utm_source || 'direct')}`}>
                        {request.lead_source || request.utm_source || 'direct'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{request.offered_price?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        request.status === 'completed' ? 'bg-green-100 text-green-800' :
                        request.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        request.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {request.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No recent requests to display</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAnalyticsSimple;