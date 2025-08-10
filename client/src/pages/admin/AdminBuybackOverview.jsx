import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Eye, Edit, Clock, CheckCircle, XCircle, Phone, Mail, MapPin, Package, IndianRupee, Calendar, User, FileText } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AdminBuybackOverview = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedLead, setSelectedLead] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/buyback-requests');
      if (response.ok) {
        const data = await response.json();
        setLeads(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch leads');
        setLeads([]);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'agent_assigned': 'bg-purple-100 text-purple-800',
      'picked_up': 'bg-indigo-100 text-indigo-800',
      'evaluated': 'bg-orange-100 text-orange-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'in_progress': 
      case 'agent_assigned':
      case 'picked_up': 
      case 'evaluated': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const generateOrderId = (lead) => {
    return lead.order_id || `GS2025${String(lead.id).padStart(5, '0')}`;
  };

  const getAgentName = (lead) => {
    if (lead.agent_first_name && lead.agent_last_name) {
      return `${lead.agent_first_name} ${lead.agent_last_name}`;
    }
    return lead.agent_id ? 'Agent Assigned' : 'Not Assigned';
  };

  const filteredAndSortedLeads = leads
    .filter(lead => {
      const customerName = lead.customer_name || lead.name || '';
      const customerEmail = lead.customer_email || lead.email || '';
      const customerPhone = lead.customer_phone || lead.phone || '';
      const deviceInfo = `${lead.manufacturer || ''} ${lead.model || ''}`.trim();
      
      const matchesSearch = searchTerm === '' || 
        customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customerPhone.includes(searchTerm) ||
        generateOrderId(lead).toLowerCase().includes(searchTerm.toLowerCase()) ||
        deviceInfo.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt);
        case 'oldest':
          return new Date(a.created_at || a.createdAt) - new Date(b.created_at || b.createdAt);
        case 'price_high':
          return (b.final_price || 0) - (a.final_price || 0);
        case 'price_low':
          return (a.final_price || 0) - (b.final_price || 0);
        case 'name':
          return (a.customer_name || a.name || '').localeCompare(b.customer_name || b.name || '');
        default:
          return 0;
      }
    });

  const exportToCSV = () => {
    const headers = [
      'Order ID', 'Customer Name', 'Email', 'Phone', 'Device Info', 
      'Status', 'Final Price', 'Agent Name', 'Created Date', 'Updated Date', 'Address'
    ];
    
    const csvData = filteredAndSortedLeads.map(lead => [
      generateOrderId(lead),
      lead.customer_name || '',
      lead.customer_email || '',
      lead.customer_phone || '',
      `${lead.manufacturer || ''} ${lead.model || ''}`.trim(),
      lead.status || '',
      lead.final_price || 0,
      getAgentName(lead),
      formatDate(lead.created_at),
      formatDate(lead.updated_at),
      lead.pickup_address || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `buyback-leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatsData = () => {
    const total = leads.length;
    const completed = leads.filter(l => l.status === 'completed').length;
    const pending = leads.filter(l => ['pending', 'in_progress', 'agent_assigned'].includes(l.status)).length;
    const cancelled = leads.filter(l => l.status === 'cancelled').length;
    const totalValue = leads.reduce((sum, l) => sum + (l.final_price || 0), 0);
    
    return { total, completed, pending, cancelled, totalValue };
  };

  const stats = getStatsData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Buyback Lead Management</h1>
            <p className="text-gray-600 mt-2">Complete overview of all buyback requests and their status</p>
          </div>
          <button
            onClick={exportToCSV}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Total Leads</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-gray-600">Completed</span>
          </div>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.completed}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            <span className="text-sm font-medium text-gray-600">Pending</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium text-gray-600">Cancelled</span>
          </div>
          <p className="text-2xl font-bold text-red-600 mt-1">{stats.cancelled}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-2">
            <IndianRupee className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-600">Total Value</span>
          </div>
          <p className="text-2xl font-bold text-purple-600 mt-1">{formatPrice(stats.totalValue)}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by name, email, phone, order ID, or device..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="agent_assigned">Agent Assigned</option>
              <option value="picked_up">Picked Up</option>
              <option value="evaluated">Evaluated</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price_high">Price High to Low</option>
              <option value="price_low">Price Low to High</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Device Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-lg font-medium">No leads found</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
                  </td>
                </tr>
              ) : (
                filteredAndSortedLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {generateOrderId(lead)}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {lead.id}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2">
                        <User className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {lead.customer_name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {lead.customer_email || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {lead.customer_phone || 'N/A'}
                          </div>
                          {lead.agent_first_name && (
                            <div className="text-xs text-blue-600 mt-1">
                              Agent: {getAgentName(lead)}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {`${lead.manufacturer || ''} ${lead.model || ''}`.trim() || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        Type: {lead.device_type || 'N/A'}
                      </div>
                      {lead.condition && (
                        <div className="text-sm text-gray-500">
                          Condition: {lead.condition}
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                        {getStatusIcon(lead.status)}
                        {lead.status?.replace('_', ' ').toUpperCase() || 'PENDING'}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatPrice(lead.final_price || lead.finalPrice)}
                      </div>
                      {lead.quoted_price && lead.quoted_price !== lead.final_price && (
                        <div className="text-xs text-gray-500">
                          Quoted: {formatPrice(lead.quoted_price)}
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(lead.created_at || lead.createdAt)}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedLead(lead);
                          setShowDetails(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results Count */}
      <div className="mt-4 text-sm text-gray-600 text-center">
        Showing {filteredAndSortedLeads.length} of {leads.length} leads
      </div>

      {/* Lead Details Modal */}
      {showDetails && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Lead Details - {generateOrderId(selectedLead)}</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              {/* Lead Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
                  <div className="space-y-2">
                    <p><strong>Name:</strong> {selectedLead.customer_name || 'N/A'}</p>
                    <p><strong>Email:</strong> {selectedLead.customer_email || 'N/A'}</p>
                    <p><strong>Phone:</strong> {selectedLead.customer_phone || 'N/A'}</p>
                    <p><strong>Address:</strong> {selectedLead.pickup_address || 'N/A'}</p>
                    <p><strong>Pin Code:</strong> {selectedLead.pin_code || 'N/A'}</p>
                  </div>
                </div>

                {/* Device Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">Device Information</h3>
                  <div className="space-y-2">
                    <p><strong>Device:</strong> {`${selectedLead.manufacturer || ''} ${selectedLead.model || ''}`.trim() || 'N/A'}</p>
                    <p><strong>Type:</strong> {selectedLead.device_type || 'N/A'}</p>
                    <p><strong>Brand:</strong> {selectedLead.manufacturer || 'N/A'}</p>
                    <p><strong>Model:</strong> {selectedLead.model || 'N/A'}</p>
                    <p><strong>Condition:</strong> {selectedLead.condition || 'N/A'}</p>
                  </div>
                </div>

                {/* Pricing Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">Pricing Information</h3>
                  <div className="space-y-2">
                    <p><strong>Offered Price:</strong> {formatPrice(selectedLead.offered_price)}</p>
                    <p><strong>Final Price:</strong> {formatPrice(selectedLead.final_price)}</p>
                    {selectedLead.gst_amount && (
                      <p><strong>GST Amount:</strong> {formatPrice(selectedLead.gst_amount)}</p>
                    )}
                  </div>
                </div>

                {/* Status & Timeline */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">Status & Timeline</h3>
                  <div className="space-y-2">
                    <p><strong>Status:</strong> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedLead.status)}`}>
                        {selectedLead.status?.replace('_', ' ').toUpperCase() || 'PENDING'}
                      </span>
                    </p>
                    <p><strong>Created:</strong> {formatDate(selectedLead.created_at || selectedLead.createdAt)}</p>
                    <p><strong>Updated:</strong> {formatDate(selectedLead.updated_at || selectedLead.updatedAt)}</p>
                    <p><strong>Agent:</strong> {getAgentName(selectedLead)}</p>
                    {selectedLead.agent_email && (
                      <p><strong>Agent Email:</strong> {selectedLead.agent_email}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              {(selectedLead.notes || selectedLead.assessment_details || selectedLead.questions_answers) && (
                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">Additional Information</h3>
                  <div className="space-y-3">
                    {selectedLead.notes && (
                      <div>
                        <strong>Notes:</strong>
                        <p className="mt-1 text-gray-700">{selectedLead.notes}</p>
                      </div>
                    )}
                    {selectedLead.assessment_details && (
                      <div>
                        <strong>Assessment Details:</strong>
                        <p className="mt-1 text-gray-700">{JSON.stringify(selectedLead.assessment_details, null, 2)}</p>
                      </div>
                    )}
                    {selectedLead.questions_answers && (
                      <div>
                        <strong>Q&A:</strong>
                        <p className="mt-1 text-gray-700">{JSON.stringify(selectedLead.questions_answers, null, 2)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Close Button */}
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBuybackOverview;