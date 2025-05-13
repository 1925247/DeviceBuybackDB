import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { AssignBuybackForm } from '@/components/admin/AssignBuybackForm';
import { ReassessDeviceForm } from '@/components/admin/ReassessDeviceForm';
import InvoiceModal from '@/components/admin/InvoiceModal';
import BuybackDetailsModal from '@/components/admin/BuybackDetailsModal';
import { 
  Search,
  Filter, 
  UserCheck, 
  Calendar, 
  BarChart3,
  Clock,
  RefreshCw,
  CheckCircle2,
  X,
  UserCog,
  FileText,
  Printer,
  Eye,
  Edit,
  MoreVertical,
  ChevronDown,
  DollarSign,
  Clipboard
} from 'lucide-react';

interface BuybackRequest {
  id: number;
  user_id: number;
  device_type: string;
  manufacturer: string;
  model: string;
  condition: string;
  status: string;
  created_at: string;
  updated_at: string;
  partner_id: number | null;
  questionnaire_answers?: Record<string, string>;
  imei?: string;
  serial_number?: string;
  estimated_value?: string;
  offered_price?: string;
  final_price?: string;
}

interface Partner {
  id: number;
  name: string;
  email: string;
  phone?: string;
  region_id?: number;
}

export default function AdminBuybacks() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [reassessDialogOpen, setReassessDialogOpen] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedBuybackId, setSelectedBuybackId] = useState<number | undefined>(undefined);
  const [selectedBuyback, setSelectedBuyback] = useState<BuybackRequest | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Close any open dropdowns when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-dropdown]') && !target.closest('[data-dropdown-toggle]')) {
        document.querySelectorAll('[data-dropdown]').forEach(el => {
          el.classList.add('hidden');
        });
      }
    };
    
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // Fetch buyback requests with error handling and better caching strategy
  const { data: buybackData = [], isLoading: isLoadingBuybacks, error: buybackError, refetch: refetchBuybacks } = useQuery({
    queryKey: ['/api/buyback-requests'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/buyback-requests');
        if (!response.ok) {
          throw new Error(`Failed to fetch buyback requests: ${response.statusText}`);
        }
        return response.json();
      } catch (err) {
        console.error("Error fetching buyback requests:", err);
        throw err;
      }
    },
    staleTime: 0, // Always refetch on component mount
    refetchOnWindowFocus: true, // Refetch when window gets focus
    refetchInterval: 5000, // Poll for updates every 5 seconds
    refetchIntervalInBackground: false // Only poll when tab is active
  });

  // Fetch partners for displaying assigned partner names with error handling
  const { data: partners = [], isLoading: isLoadingPartners, error: partnersError, refetch: refetchPartners } = useQuery({
    queryKey: ['/api/partners'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/partners');
        if (!response.ok) {
          throw new Error(`Failed to fetch partners: ${response.statusText}`);
        }
        return response.json();
      } catch (err) {
        console.error("Error fetching partners:", err);
        throw err;
      }
    },
    staleTime: 30000, // Cache data for 30 seconds
    refetchOnWindowFocus: true // Refetch when window gets focus
  });
  
  // Fetch regions for displaying region names in export and filtering
  const { data: regions = [], isLoading: isLoadingRegions, error: regionsError } = useQuery({
    queryKey: ['/api/regions'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/regions');
        if (!response.ok) {
          throw new Error(`Failed to fetch regions: ${response.statusText}`);
        }
        return response.json();
      } catch (err) {
        console.error("Error fetching regions:", err);
        throw err;
      }
    },
    staleTime: 300000, // Cache data for 5 minutes
    refetchOnWindowFocus: false // No need to continuously refetch regions
  });
  
  // Show error toast if data fetching fails
  useEffect(() => {
    if (buybackError) {
      toast({
        title: 'Error Fetching Data',
        description: `Failed to fetch buyback requests: ${(buybackError as Error).message}`,
        variant: 'destructive'
      });
    }
    
    if (partnersError) {
      toast({
        title: 'Error Fetching Data',
        description: `Failed to fetch partners: ${(partnersError as Error).message}`,
        variant: 'destructive'
      });
    }
    
    if (regionsError) {
      toast({
        title: 'Error Fetching Data',
        description: `Failed to fetch regions: ${(regionsError as Error).message}`,
        variant: 'destructive'
      });
    }
  }, [buybackError, partnersError, regionsError, toast]);

  // Generate filtered buybacks based on active tab, search, and status filter
  const getFilteredBuybacks = () => {
    return buybackData.filter((request: BuybackRequest) => {
      // Search filter
      const matchesSearch = 
        searchTerm === '' || 
        request.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.device_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (request.imei && request.imei.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (request.serial_number && request.serial_number.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Status filter
      const matchesStatus = 
        statusFilter === 'all' || 
        request.status === statusFilter;
      
      // Tab filter
      let matchesTab = true;
      if (activeTab === 'pending') {
        matchesTab = request.status === 'pending';
      } else if (activeTab === 'assigned') {
        matchesTab = request.status === 'assigned' || !!request.partner_id;
      } else if (activeTab === 'completed') {
        matchesTab = request.status === 'completed';
      }
      
      return matchesSearch && matchesStatus && matchesTab;
    });
  };

  const filteredBuybacks = getFilteredBuybacks();

  const getPartnerName = (partnerId: number | null) => {
    if (!partnerId || partners.length === 0) return "Unassigned";
    const partner = partners.find((p: Partner) => p.id === partnerId);
    return partner ? partner.name : "Unknown Partner";
  };

  const getPartnerById = (partnerId: number | null): Partner | null => {
    if (!partnerId || partners.length === 0) return null;
    return partners.find((p: Partner) => p.id === partnerId) || null;
  };
  
  const getRegionName = (regionId: number | null): string => {
    if (!regionId || regions.length === 0) return "";
    const region = regions.find((r: any) => r.id === regionId);
    return region ? region.name : "";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Mutation to update buyback request status with improved error handling and optimistic updates
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      try {
        const response = await apiRequest('PUT', `/api/buyback-requests/${id}`, { status });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
          throw new Error(errorData.message || `Failed to update status: ${response.statusText}`);
        }
        return response.json();
      } catch (err) {
        console.error('Error updating buyback status:', err);
        throw err;
      }
    },
    onMutate: async ({ id, status }) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ['/api/buyback-requests'] });
      
      // Snapshot of the previous value
      const previousBuybackRequests = queryClient.getQueryData(['/api/buyback-requests']);
      
      // Optimistically update to the new value
      queryClient.setQueryData(['/api/buyback-requests'], (old: any[]) => {
        return old?.map(request => 
          request.id === id ? { ...request, status } : request
        ) || [];
      });
      
      // Return a context object with the snapshotted value
      return { previousBuybackRequests };
    },
    onSuccess: (data) => {
      toast({
        title: 'Success',
        description: 'Buyback request status updated successfully',
      });
      // Force a refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['/api/buyback-requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/buyback-requests/count'] });
      queryClient.invalidateQueries({ queryKey: ['/api/buyback-requests/recent'] });
    },
    onError: (error: any, variables, context) => {
      // Revert back to the previous value if mutation fails
      if (context?.previousBuybackRequests) {
        queryClient.setQueryData(['/api/buyback-requests'], context.previousBuybackRequests);
      }
      
      toast({
        title: 'Error',
        description: `Failed to update status: ${error.message || 'Unknown error'}`,
        variant: 'destructive'
      });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the correct data
      queryClient.invalidateQueries({ queryKey: ['/api/buyback-requests'] });
    }
  });

  // Function to mark a buyback request as complete
  const markAsComplete = (requestId: number) => {
    updateStatusMutation.mutate({ id: requestId, status: 'completed' });
  };

  // Function to cancel a buyback request
  const cancelRequest = (requestId: number) => {
    updateStatusMutation.mutate({ id: requestId, status: 'cancelled' });
  };

  // Function to view detailed buyback information
  const viewBuybackDetails = (request: BuybackRequest) => {
    setSelectedBuyback(request);
    setDetailsModalOpen(true);
  };

  // Function to open the assign dialog
  const openAssignDialog = (requestId: number) => {
    setSelectedBuybackId(requestId);
    setAssignDialogOpen(true);
  };
  
  // Function to open the reassess device dialog
  const openReassessDialog = (request: BuybackRequest) => {
    setSelectedBuyback(request);
    setReassessDialogOpen(true);
  };
  
  // Function to open the invoice modal
  const openInvoiceModal = (request: BuybackRequest) => {
    setSelectedBuyback(request);
    setInvoiceModalOpen(true);
  };

  // Export data to Excel/CSV with enhanced data fields
  const exportToExcel = () => {
    try {
      // Create comprehensive headers for the CSV
      const headers = [
        'ID', 
        'Device Type', 
        'Manufacturer', 
        'Model', 
        'Status', 
        'Assigned Partner', 
        'Partner Email',
        'Partner Phone',
        'Created Date', 
        'Updated Date',
        'IMEI',
        'Serial Number',
        'Estimated Value', 
        'Offered Price',
        'Final Price',
        'Condition',
        'Region',
        'PIN Code'
      ];
      
      // Get additional questionnaire answer headers from the first request that has them
      const sampleRequest = buybackData.find(r => r.questionnaire_answers && Object.keys(r.questionnaire_answers).length > 0);
      const questionnaireHeaders = sampleRequest?.questionnaire_answers ? 
        Object.keys(sampleRequest.questionnaire_answers) : [];
      
      // Add questionnaire headers to main headers
      const allHeaders = [...headers, ...questionnaireHeaders];
      
      // Format data for CSV with proper escaping for CSV values
      const csvData = buybackData.map((request: BuybackRequest) => {
        // Get partner details
        const partner = partners.find(p => p.id === request.partner_id);
        
        // Base request data
        const baseData = [
          request.id,
          request.device_type || '',
          request.manufacturer || '',
          request.model || '',
          request.status || 'pending',
          partner?.name || '',
          partner?.email || '',
          partner?.phone || '',
          formatDate(request.created_at),
          formatDate(request.updated_at),
          request.imei || '',
          request.serial_number || '',
          request.estimated_value || '0.00',
          request.offered_price || request.estimated_value || '0.00',
          request.final_price || request.offered_price || request.estimated_value || '0.00',
          request.condition || 'N/A',
          request.region_id ? getRegionName(request.region_id) : '',
          request.pin_code || ''
        ];
        
        // Add questionnaire answers in the same order as headers
        const answersData = questionnaireHeaders.map(header => {
          return request.questionnaire_answers && request.questionnaire_answers[header] ? 
            request.questionnaire_answers[header] : '';
        });
        
        return [...baseData, ...answersData];
      });
      
      // Add headers to the beginning
      csvData.unshift(allHeaders);
      
      // Convert to CSV format with proper escaping
      const csvContent = csvData.map(row => 
        row.map(value => {
          // If the value contains commas, quotes, or newlines, wrap it in quotes
          // Also escape any quotes inside the value by doubling them
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      ).join('\n');
      
      // Create a blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `buyback-requests-${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: 'Export Successful',
        description: 'Buyback requests exported with complete data including questionnaire answers',
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: 'Export Failed',
        description: `Failed to export data: ${(error as any).message || 'Unknown error'}`,
        variant: 'destructive'
      });
    }
  };

  // Count new requests today
  const getNewToday = () => {
    return buybackData.filter((r: BuybackRequest) => {
      const today = new Date();
      const createdDate = new Date(r.created_at);
      return (
        createdDate.getDate() === today.getDate() &&
        createdDate.getMonth() === today.getMonth() &&
        createdDate.getFullYear() === today.getFullYear()
      );
    }).length;
  };

  // Calculate total value
  const getTotalValue = () => {
    return buybackData.reduce((sum: number, request: BuybackRequest) => {
      const value = parseFloat(request.final_price || request.offered_price || request.estimated_value || '0');
      return sum + (isNaN(value) ? 0 : value);
    }, 0).toFixed(2);
  };

  // Get assigned count
  const getAssignedCount = () => {
    return buybackData.filter((r: BuybackRequest) => r.partner_id !== null).length;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Buyback Requests Management</h1>
        <button
          onClick={exportToExcel}
          className="bg-white text-gray-800 px-4 py-2 rounded-md border border-gray-200 hover:bg-gray-100 flex items-center text-sm font-medium"
        >
          Export Data
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm flex items-center justify-between">
          <div>
            <p className="text-gray-500 font-medium text-sm">Total Requests</p>
            <h3 className="text-3xl font-bold mt-1">{buybackData.length}</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm flex items-center justify-between">
          <div>
            <p className="text-gray-500 font-medium text-sm">New Today</p>
            <h3 className="text-3xl font-bold mt-1">{getNewToday()}</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm flex items-center justify-between">
          <div>
            <p className="text-gray-500 font-medium text-sm">Assigned</p>
            <h3 className="text-3xl font-bold mt-1">{getAssignedCount()}</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm flex items-center justify-between">
          <div>
            <p className="text-gray-500 font-medium text-sm">Total Value</p>
            <h3 className="text-3xl font-bold mt-1 text-amber-600">${getTotalValue()}</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-amber-600" />
          </div>
        </div>
      </div>

      {/* Title and Description */}
      <div className="bg-white p-5 rounded-lg shadow-sm mb-4">
        <div className="flex flex-col space-y-1">
          <h2 className="text-xl font-semibold">Buyback Requests</h2>
          <p className="text-sm text-gray-500">Manage all incoming device buyback requests</p>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div className="bg-white rounded-lg shadow-sm mb-4">
        <div className="border-b border-gray-200">
          <div className="flex justify-between p-4">
            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-md">
              <button 
                className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'all' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
                onClick={() => setActiveTab('all')}
              >
                All Requests
              </button>
              <button 
                className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'pending' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
                onClick={() => setActiveTab('pending')}
              >
                Pending
              </button>
              <button 
                className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'assigned' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
                onClick={() => setActiveTab('assigned')}
              >
                Assigned
              </button>
              <button 
                className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'completed' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
                onClick={() => setActiveTab('completed')}
              >
                Completed
              </button>
            </div>
            
            {/* Filters */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search requests..."
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-md bg-gray-50 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="relative inline-block text-left">
                <div>
                  <button
                    type="button"
                    className="inline-flex justify-center w-full rounded-md border border-gray-200 px-4 py-2 bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none"
                    id="status-filter-menu"
                    onClick={() => {
                      const menu = document.getElementById('status-filter-dropdown');
                      menu?.classList.toggle('hidden');
                    }}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    {statusFilter === 'all' ? 'All Statuses' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                    <ChevronDown className="h-4 w-4 ml-2 -mr-1" />
                  </button>
                </div>

                <div 
                  className="hidden origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                  id="status-filter-dropdown"
                >
                  <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="status-filter-menu">
                    <button
                      className={`block px-4 py-2 text-sm w-full text-left ${statusFilter === 'all' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} hover:bg-gray-100`}
                      role="menuitem"
                      onClick={() => {
                        setStatusFilter('all');
                        document.getElementById('status-filter-dropdown')?.classList.add('hidden');
                      }}
                    >
                      All Statuses
                    </button>
                    <button
                      className={`block px-4 py-2 text-sm w-full text-left ${statusFilter === 'pending' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} hover:bg-gray-100`}
                      role="menuitem"
                      onClick={() => {
                        setStatusFilter('pending');
                        document.getElementById('status-filter-dropdown')?.classList.add('hidden');
                      }}
                    >
                      Pending
                    </button>
                    <button
                      className={`block px-4 py-2 text-sm w-full text-left ${statusFilter === 'assigned' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} hover:bg-gray-100`}
                      role="menuitem"
                      onClick={() => {
                        setStatusFilter('assigned');
                        document.getElementById('status-filter-dropdown')?.classList.add('hidden');
                      }}
                    >
                      Assigned
                    </button>
                    <button
                      className={`block px-4 py-2 text-sm w-full text-left ${statusFilter === 'processing' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} hover:bg-gray-100`}
                      role="menuitem"
                      onClick={() => {
                        setStatusFilter('processing');
                        document.getElementById('status-filter-dropdown')?.classList.add('hidden');
                      }}
                    >
                      Processing
                    </button>
                    <button
                      className={`block px-4 py-2 text-sm w-full text-left ${statusFilter === 'completed' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} hover:bg-gray-100`}
                      role="menuitem"
                      onClick={() => {
                        setStatusFilter('completed');
                        document.getElementById('status-filter-dropdown')?.classList.add('hidden');
                      }}
                    >
                      Completed
                    </button>
                    <button
                      className={`block px-4 py-2 text-sm w-full text-left ${statusFilter === 'cancelled' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} hover:bg-gray-100`}
                      role="menuitem"
                      onClick={() => {
                        setStatusFilter('cancelled');
                        document.getElementById('status-filter-dropdown')?.classList.add('hidden');
                      }}
                    >
                      Cancelled
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Requests Table */}
        {isLoadingBuybacks || isLoadingPartners ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Device</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Assigned To</th>
                  <th className="px-6 py-3 hidden md:table-cell">Date</th>
                  <th className="px-6 py-3 hidden md:table-cell">Value</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBuybacks.length > 0 ? (
                  filteredBuybacks.map((request: BuybackRequest) => (
                    <tr 
                      key={request.id} 
                      className="bg-white border-b hover:bg-gray-50 cursor-pointer"
                      onClick={() => viewBuybackDetails(request)}
                    >
                      <td className="px-6 py-4 font-medium">#{request.id}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium">{request.manufacturer} {request.model}</p>
                          <p className="text-xs text-gray-500">{request.device_type}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {request.status === 'pending' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-800">
                            <Clock className="w-3.5 h-3.5 mr-1" /> Pending
                          </span>
                        )}
                        {request.status === 'processing' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-800">
                            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Processing
                          </span>
                        )}
                        {request.status === 'completed' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-800">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Completed
                          </span>
                        )}
                        {request.status === 'cancelled' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-800">
                            <X className="w-3.5 h-3.5 mr-1" /> Cancelled
                          </span>
                        )}
                        {request.status === 'assigned' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-800">
                            <UserCog className="w-3.5 h-3.5 mr-1" /> Assigned
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {request.partner_id ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-800">
                            {getPartnerName(request.partner_id)}
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs hidden md:table-cell">
                        {new Date(request.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className={request.final_price ? 'text-green-700 font-medium' : 'text-amber-700 font-medium'}>
                          ${request.final_price || request.offered_price || request.estimated_value || '0.00'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-3">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              viewBuybackDetails(request);
                            }}
                            className="text-gray-500 hover:text-gray-700"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              openReassessDialog(request);
                            }}
                            className="text-gray-500 hover:text-gray-700"
                            title="Edit/Reassess"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          
                          <div className="relative">
                            <button
                              data-dropdown-toggle={`dropdown-${request.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                const dropdown = document.getElementById(`dropdown-${request.id}`);
                                
                                // Close all dropdowns first
                                document.querySelectorAll('[data-dropdown]').forEach(el => {
                                  if (el.id !== `dropdown-${request.id}`) {
                                    el.classList.add('hidden');
                                  }
                                });
                                
                                // Toggle this dropdown
                                dropdown?.classList.toggle('hidden');
                              }}
                              className="text-gray-500 hover:text-gray-700"
                              title="More Options"
                            >
                              <MoreVertical className="w-5 h-5" />
                            </button>
                            
                            <div
                              id={`dropdown-${request.id}`}
                              data-dropdown
                              className="hidden absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                              role="menu"
                              aria-orientation="vertical"
                              aria-labelledby="menu-button"
                              tabIndex={-1}
                            >
                              <div className="py-1" role="none">
                                {request.status === 'completed' && (
                                  <button
                                    className="text-gray-700 hover:bg-gray-100 block px-4 py-2 text-sm w-full text-left flex items-center"
                                    role="menuitem"
                                    tabIndex={-1}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openInvoiceModal(request);
                                      document.getElementById(`dropdown-${request.id}`)?.classList.add('hidden');
                                    }}
                                  >
                                    <FileText className="mr-2 h-4 w-4" />
                                    View Invoice
                                  </button>
                                )}
                                
                                {request.status !== 'completed' && request.status !== 'cancelled' && !request.partner_id && (
                                  <button
                                    className="text-gray-700 hover:bg-gray-100 block px-4 py-2 text-sm w-full text-left flex items-center"
                                    role="menuitem"
                                    tabIndex={-1}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openAssignDialog(request.id);
                                      document.getElementById(`dropdown-${request.id}`)?.classList.add('hidden');
                                    }}
                                  >
                                    <UserCheck className="mr-2 h-4 w-4" />
                                    Assign Partner
                                  </button>
                                )}
                                
                                {(request.status === 'assigned' || request.status === 'processing') && (
                                  <button
                                    className="text-gray-700 hover:bg-gray-100 block px-4 py-2 text-sm w-full text-left flex items-center"
                                    role="menuitem"
                                    tabIndex={-1}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openReassessDialog(request);
                                      document.getElementById(`dropdown-${request.id}`)?.classList.add('hidden');
                                    }}
                                  >
                                    <Clipboard className="mr-2 h-4 w-4" />
                                    Reassess Device
                                  </button>
                                )}
                                
                                {request.status !== 'completed' && request.status !== 'cancelled' && (
                                  <button
                                    className="text-gray-700 hover:bg-gray-100 block px-4 py-2 text-sm w-full text-left flex items-center"
                                    role="menuitem"
                                    tabIndex={-1}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markAsComplete(request.id);
                                      document.getElementById(`dropdown-${request.id}`)?.classList.add('hidden');
                                    }}
                                  >
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Mark as Complete
                                  </button>
                                )}
                                
                                {/* Export single request */}
                                <button
                                  className="text-gray-700 hover:bg-gray-100 block px-4 py-2 text-sm w-full text-left flex items-center"
                                  role="menuitem"
                                  tabIndex={-1}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Export just this request
                                    const headers = ['ID', 'Device Type', 'Manufacturer', 'Model', 'Status', 'Assigned To', 'Value'];
                                    const data = [
                                      [
                                        request.id.toString(),
                                        request.device_type,
                                        request.manufacturer,
                                        request.model,
                                        request.status,
                                        getPartnerName(request.partner_id),
                                        request.final_price || request.offered_price || request.estimated_value || '0.00'
                                      ]
                                    ];
                                    
                                    data.unshift(headers);
                                    const csvContent = data.map(row => row.join(',')).join('\n');
                                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                                    const url = URL.createObjectURL(blob);
                                    const link = document.createElement('a');
                                    link.setAttribute('href', url);
                                    link.setAttribute('download', `buyback-request-${request.id}.csv`);
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                    
                                    document.getElementById(`dropdown-${request.id}`)?.classList.add('hidden');
                                    
                                    toast({
                                      title: 'Export Successful',
                                      description: `Buyback request #${request.id} exported`,
                                    });
                                  }}
                                >
                                  <FileText className="mr-2 h-4 w-4" />
                                  Export Request
                                </button>
                                
                                {request.status !== 'completed' && request.status !== 'cancelled' && (
                                  <>
                                    <div className="border-t border-gray-100 my-1"></div>
                                    <button
                                      className="text-red-600 hover:bg-gray-100 block px-4 py-2 text-sm w-full text-left flex items-center"
                                      role="menuitem"
                                      tabIndex={-1}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        cancelRequest(request.id);
                                        document.getElementById(`dropdown-${request.id}`)?.classList.add('hidden');
                                      }}
                                    >
                                      <X className="mr-2 h-4 w-4" />
                                      Cancel Request
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="bg-white">
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No buyback requests found matching the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing <span className="font-medium">{Math.min(filteredBuybacks.length, 10)}</span> of <span className="font-medium">{filteredBuybacks.length}</span> results
        </div>
        <div className="flex space-x-2">
          <button
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={true}
          >
            Previous
          </button>
          <button 
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={filteredBuybacks.length <= 10}
          >
            Next
          </button>
        </div>
      </div>

      {/* Partner Assignment Dialog */}
      <AssignBuybackForm
        open={assignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
        buybackRequestId={selectedBuybackId}
      />

      {/* Reassess Device Dialog */}
      {selectedBuyback && (
        <ReassessDeviceForm
          open={reassessDialogOpen}
          onClose={() => setReassessDialogOpen(false)}
          buybackRequest={selectedBuyback}
        />
      )}

      {/* Invoice Modal */}
      {selectedBuyback && (
        <InvoiceModal
          open={invoiceModalOpen}
          onClose={() => setInvoiceModalOpen(false)}
          buybackRequest={selectedBuyback}
        />
      )}

      {/* Buyback Details Modal */}
      {selectedBuyback && (
        <BuybackDetailsModal
          open={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          buybackRequest={selectedBuyback}
          partner={getPartnerById(selectedBuyback.partner_id)}
          onAssignPartner={() => {
            setDetailsModalOpen(false);
            openAssignDialog(selectedBuyback.id);
          }}
          onReassessDevice={() => {
            setDetailsModalOpen(false);
            openReassessDialog(selectedBuyback);
          }}
          onMarkComplete={() => {
            setDetailsModalOpen(false);
            markAsComplete(selectedBuyback.id);
          }}
          onViewInvoice={() => {
            setDetailsModalOpen(false);
            openInvoiceModal(selectedBuyback);
          }}
          onCancel={() => {
            setDetailsModalOpen(false);
            cancelRequest(selectedBuyback.id);
          }}
        />
      )}
    </div>
  );
}