import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, Target, Users, DollarSign, BarChart3, 
  PieChart, ExternalLink, Filter, Calendar, Download,
  Globe, Search, Share2, Mail, Smartphone
} from 'lucide-react';

const AdminLeadAnalytics = () => {
  const [dateRange, setDateRange] = useState('7d');
  const [selectedSource, setSelectedSource] = useState('all');

  const { data: requests = [], isLoading, error } = useQuery({
    queryKey: ['/api/buyback-requests'],
    refetchInterval: 30000,
    retry: 3,
    retryDelay: 1000
  });

  // Process lead analytics data
  const analytics = useMemo(() => {
    if (!requests.length) return null;

    // Filter by date range
    const now = new Date();
    const daysBack = {
      '1d': 1,
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

    // Source analysis
    const sourceStats = {};
    const mediumStats = {};
    const campaignStats = {};
    let totalValue = 0;

    filteredRequests.forEach(req => {
      const source = req.lead_source || req.utm_source || 'direct';
      const medium = req.lead_medium || req.utm_medium || 'none';
      const campaign = req.utm_campaign || 'none';
      const value = req.offered_price || 0;

      // Source stats
      if (!sourceStats[source]) {
        sourceStats[source] = { count: 0, value: 0, conversions: 0 };
      }
      sourceStats[source].count++;
      sourceStats[source].value += value;
      if (req.status === 'completed') sourceStats[source].conversions++;

      // Medium stats
      if (!mediumStats[medium]) {
        mediumStats[medium] = { count: 0, value: 0, conversions: 0 };
      }
      mediumStats[medium].count++;
      mediumStats[medium].value += value;
      if (req.status === 'completed') mediumStats[medium].conversions++;

      // Campaign stats
      if (campaign !== 'none') {
        if (!campaignStats[campaign]) {
          campaignStats[campaign] = { count: 0, value: 0, conversions: 0, source, medium };
        }
        campaignStats[campaign].count++;
        campaignStats[campaign].value += value;
        if (req.status === 'completed') campaignStats[campaign].conversions++;
      }

      totalValue += value;
    });

    // Convert to arrays and sort
    const sourceArray = Object.entries(sourceStats)
      .map(([name, stats]) => ({
        name,
        ...stats,
        conversionRate: stats.count > 0 ? (stats.conversions / stats.count) * 100 : 0,
        avgValue: stats.count > 0 ? stats.value / stats.count : 0
      }))
      .sort((a, b) => b.count - a.count);

    const mediumArray = Object.entries(mediumStats)
      .map(([name, stats]) => ({
        name,
        ...stats,
        conversionRate: stats.count > 0 ? (stats.conversions / stats.count) * 100 : 0,
        avgValue: stats.count > 0 ? stats.value / stats.count : 0
      }))
      .sort((a, b) => b.count - a.count);

    const campaignArray = Object.entries(campaignStats)
      .map(([name, stats]) => ({
        name,
        ...stats,
        conversionRate: stats.count > 0 ? (stats.conversions / stats.count) * 100 : 0,
        avgValue: stats.count > 0 ? stats.value / stats.count : 0
      }))
      .sort((a, b) => b.count - a.count);

    return {
      totalLeads: filteredRequests.length,
      totalValue,
      totalConversions: filteredRequests.filter(r => r.status === 'completed').length,
      overallConversionRate: filteredRequests.length > 0 
        ? (filteredRequests.filter(r => r.status === 'completed').length / filteredRequests.length) * 100 
        : 0,
      avgLeadValue: filteredRequests.length > 0 ? totalValue / filteredRequests.length : 0,
      sources: sourceArray,
      mediums: mediumArray,
      campaigns: campaignArray
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
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Error fetching data:', error);
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-red-800 font-medium">Error Loading Analytics</h3>
          <p className="text-red-600 text-sm mt-1">
            Failed to load analytics data. Please refresh the page.
          </p>
          <details className="mt-2">
            <summary className="text-red-700 cursor-pointer text-sm">Error Details</summary>
            <pre className="text-xs text-red-600 mt-1 bg-red-100 p-2 rounded overflow-auto">
              {JSON.stringify(error, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Lead Data</h3>
          <p className="text-gray-500">Start getting leads to see analytics here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Lead Analytics</h1>
        <p className="text-gray-600">Track and analyze lead sources and conversion performance</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="1d">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>
          
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export Report
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
              <p className="text-2xl font-bold text-gray-900">₹{analytics.avgLeadValue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lead Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Sources</h3>
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
                        {source.conversions} conversions ({source.conversionRate.toFixed(1)}%)
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{source.count} leads</p>
                    <p className="text-sm text-gray-600">₹{source.value.toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic Mediums</h3>
          <div className="space-y-4">
            {analytics.mediums.map(medium => (
              <div key={medium.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium text-gray-900 capitalize">{medium.name}</span>
                  <p className="text-xs text-gray-500">
                    {medium.conversions} conversions ({medium.conversionRate.toFixed(1)}%)
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{medium.count} leads</p>
                  <p className="text-sm text-gray-600">₹{medium.value.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Campaign Performance */}
      {analytics.campaigns.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Performance</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source/Medium
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Leads
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conversions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conversion Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Value
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.campaigns.map(campaign => (
                  <tr key={campaign.name} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{campaign.source}/{campaign.medium}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{campaign.count}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{campaign.conversions}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{campaign.conversionRate.toFixed(1)}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">₹{campaign.value.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">₹{campaign.avgValue.toLocaleString()}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLeadAnalytics;