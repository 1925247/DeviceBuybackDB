import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, User, Calendar, DollarSign, MapPin, Phone, Eye, LogOut, Shield, Clock, CheckCircle } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const SecureAgentDashboard = () => {
  const [leads, setLeads] = useState([]);
  const [leadCounts, setLeadCounts] = useState({ total: 0, pending: 0, in_progress: 0, completed: 0 });
  const [agentInfo, setAgentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthentication();
    fetchAgentLeads();
  }, []);

  const checkAuthentication = () => {
    const agentToken = sessionStorage.getItem('agentToken');
    const agentId = sessionStorage.getItem('agentId');
    const agentName = sessionStorage.getItem('agentName');

    if (!agentToken || !agentId) {
      navigate('/agent-login');
      return;
    }

    setAgentInfo({
      agent_id: agentId,
      full_name: agentName
    });
  };

  const fetchAgentLeads = async () => {
    try {
      const agentId = sessionStorage.getItem('agentId');
      const agentToken = sessionStorage.getItem('agentToken');

      // Fetching leads for agent

      if (!agentId || !agentToken) {
        navigate('/agent-login');
        return;
      }

      const response = await fetch(`/api/agent/leads/${agentId}`, {
        headers: {
          'Authorization': `Bearer ${agentToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401 || response.status === 403) {
        handleLogout();
        return;
      }

      if (response.ok) {
        const data = await response.json();
        
        // Handle new API response format
        if (data.leads && data.counts) {
          setLeads(data.leads || []);
          setLeadCounts(data.counts);
        } else {
          // Fallback for old format
          setLeads(data || []);
          setLeadCounts({
            total: data?.length || 0,
            pending: data?.filter(l => l.status === 'assigned').length || 0,
            in_progress: data?.filter(l => l.status === 'in_progress').length || 0,
            completed: data?.filter(l => l.status === 'completed').length || 0
          });
        }
        setError(''); // Clear any previous errors
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch leads');
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('agentToken');
    sessionStorage.removeItem('agentId');
    sessionStorage.removeItem('agentName');
    navigate('/agent-login');
  };

  const handleReEvaluate = (leadId) => {
    navigate(`/agent/re-evaluate/${leadId}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'assigned': return <Clock className="h-4 w-4" />;
      case 'in_progress': return <Eye className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-0 sm:h-16 space-y-2 sm:space-y-0">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Agent Portal</h1>
                <p className="text-sm text-gray-500">Secure access for pickup agents</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center text-sm text-gray-700">
                <User className="h-4 w-4 mr-2" />
                <span className="truncate">Welcome, {agentInfo?.full_name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-sm text-red-600 hover:text-red-700 border border-red-200 rounded-md hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-2">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow p-3 sm:p-6">
            <div className="flex items-center">
              <Package className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <div className="ml-2 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Leads</p>
                <p className="text-lg sm:text-2xl font-semibold text-gray-900">{leadCounts.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-3 sm:p-6">
            <div className="flex items-center">
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
              <div className="ml-2 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Pending</p>
                <p className="text-lg sm:text-2xl font-semibold text-gray-900">
                  {leadCounts.pending}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-3 sm:p-6">
            <div className="flex items-center">
              <Eye className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
              <div className="ml-2 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-lg sm:text-2xl font-semibold text-gray-900">
                  {leadCounts.in_progress}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-3 sm:p-6">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              <div className="ml-2 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Completed</p>
                <p className="text-lg sm:text-2xl font-semibold text-gray-900">
                  {leadCounts.completed}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">My Assigned Leads</h2>
            <p className="text-sm text-gray-500">Only leads assigned to you are visible</p>
          </div>
          
          {/* Mobile Cards View */}
          <div className="block sm:hidden">
            <div className="space-y-4 p-4">
              {leads.map(lead => (
                <div key={lead.lead_id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">Lead #{lead.lead_id}</p>
                      <p className="text-sm text-gray-500">{new Date(lead.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                      {getStatusIcon(lead.status)}
                      <span className="ml-1 capitalize">{lead.status?.replace('_', ' ')}</span>
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{lead.customer_name}</p>
                      <p className="text-xs text-gray-500 flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {lead.customer_phone}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-900">{lead.manufacturer} {lead.model}</p>
                      <p className="text-sm text-blue-600">₹{parseFloat(lead.customer_price || 0).toLocaleString('en-IN')}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {lead.pickup_address || 'Address not provided'}
                      </p>
                    </div>
                  </div>
                  
                  {(lead.status === 'assigned' || lead.status === 'in_progress') && (
                    <div className="mt-3 flex space-x-2">
                      <button
                        onClick={() => handleReEvaluate(lead.lead_id)}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700"
                      >
                        Re-Evaluate
                      </button>
                      <button
                        onClick={() => navigate(`/agent/complete/${lead.lead_id}`)}
                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-700"
                      >
                        Complete
                      </button>
                    </div>
                  )}
                </div>
              ))}
              
              {leads.length === 0 && (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No leads assigned</h3>
                  <p className="text-gray-500">You don't have any leads assigned to you yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lead Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Device & Pricing
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pickup Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leads.map(lead => (
                  <tr key={lead.lead_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          Lead #{lead.lead_id}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(lead.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {lead.customer_name}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {lead.customer_phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {lead.manufacturer} {lead.model}
                        </div>
                        <div className="text-sm text-gray-500">
                          Base: ₹{parseFloat(lead.base_price || 0).toLocaleString('en-IN')}
                        </div>
                        <div className="text-sm text-blue-600">
                          Customer: ₹{parseFloat(lead.customer_price || 0).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-gray-900 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {lead.pickup_date ? new Date(lead.pickup_date).toLocaleDateString() : 'Not scheduled'}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {lead.pickup_address || 'Address not provided'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                        {getStatusIcon(lead.status)}
                        <span className="ml-1 capitalize">{lead.status?.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {lead.status === 'assigned' || lead.status === 'in_progress' ? (
                        <div className="flex space-x-2 justify-end">
                          <button
                            onClick={() => handleReEvaluate(lead.lead_id)}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            Re-Evaluate
                          </button>
                          <button
                            onClick={() => navigate(`/agent/complete/${lead.lead_id}`)}
                            className="text-green-600 hover:text-green-900 font-medium"
                          >
                            Complete
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400">
                          {lead.status === 'completed' ? 'Completed' : 'No action'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {leads.length === 0 && (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No leads assigned</h3>
                <p className="text-gray-500">You don't have any leads assigned to you yet.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SecureAgentDashboard;