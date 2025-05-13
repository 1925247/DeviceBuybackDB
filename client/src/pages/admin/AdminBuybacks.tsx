import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AssignBuybackForm } from '@/components/admin/AssignBuybackForm';
import { ReassessDeviceForm } from '@/components/admin/ReassessDeviceForm';
import InvoiceModal from '@/components/admin/InvoiceModal';
import BuybackDetailsModal from '@/components/admin/BuybackDetailsModal';
import { 
  MoreHorizontal, 
  Search, 
  Filter, 
  UserCheck, 
  Calendar, 
  PieChart, 
  ArrowUpDown, 
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  X,
  UserCog,
  FileText,
  Printer,
  Eye
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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch buyback requests
  const { data: buybackData = [], isLoading: isLoadingBuybacks } = useQuery({
    queryKey: ['/api/buyback-requests'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/buyback-requests');
      return response.json();
    },
  });

  // Fetch partners for displaying assigned partner names
  const { data: partners = [], isLoading: isLoadingPartners } = useQuery({
    queryKey: ['/api/partners'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/partners');
      return response.json();
    },
  });

  // Filter the buyback requests based on search and status filters
  const filteredBuybacks = buybackData.filter((request: BuybackRequest) => {
    const matchesSearch = 
      searchTerm === '' || 
      request.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.device_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.imei && request.imei.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (request.serial_number && request.serial_number.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = 
      statusFilter === 'all' || 
      request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getPartnerName = (partnerId: number | null) => {
    if (!partnerId || partners.length === 0) return "Unassigned";
    const partner = partners.find((p: Partner) => p.id === partnerId);
    return partner ? partner.name : "Unknown Partner";
  };

  const getPartnerById = (partnerId: number | null): Partner | null => {
    if (!partnerId || partners.length === 0) return null;
    return partners.find((p: Partner) => p.id === partnerId) || null;
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          <Clock className="w-3.5 h-3.5 mr-1.5" /> Pending
        </Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Processing
        </Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Completed
        </Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <X className="w-3.5 h-3.5 mr-1.5" /> Cancelled
        </Badge>;
      case 'assigned':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
          <UserCog className="w-3.5 h-3.5 mr-1.5" /> Assigned
        </Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
          <AlertTriangle className="w-3.5 h-3.5 mr-1.5" /> {status || 'Unknown'}
        </Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Mutation to update buyback request status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      const response = await apiRequest('PUT', `/api/buyback-requests/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Buyback request status updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/buyback-requests'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to update status: ${error.message || 'Unknown error'}`,
        variant: 'destructive'
      });
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

  const exportToExcel = () => {
    try {
      // Create headers for the CSV
      const headers = [
        'ID', 
        'Device Type', 
        'Manufacturer', 
        'Model', 
        'Status', 
        'Assigned To', 
        'Created Date', 
        'Value', 
        'Condition'
      ];
      
      // Format data for CSV
      const csvData = buybackData.map((request: BuybackRequest) => {
        return [
          request.id,
          request.device_type,
          request.manufacturer,
          request.model,
          request.status,
          getPartnerName(request.partner_id),
          formatDate(request.created_at),
          request.final_price || request.offered_price || request.estimated_value || '0.00',
          request.condition || 'N/A'
        ];
      });
      
      // Add headers to the beginning
      csvData.unshift(headers);
      
      // Convert to CSV format
      const csvContent = csvData.map(row => row.join(',')).join('\n');
      
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
        description: 'Buyback requests data has been exported to CSV',
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'There was a problem exporting the data',
        variant: 'destructive'
      });
      console.error('Export error:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Buyback Requests Management</h1>
        <Button onClick={exportToExcel} className="bg-white text-black border border-gray-200 hover:bg-gray-100">
          Export Data
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Requests</p>
              <h3 className="text-4xl font-bold mt-1">{buybackData.length}</h3>
            </div>
            <div className="bg-blue-50 p-3 rounded-full">
              <PieChart className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">New Today</p>
              <h3 className="text-4xl font-bold mt-1">
                {buybackData.filter((r: BuybackRequest) => {
                  const today = new Date();
                  const createdDate = new Date(r.created_at);
                  return (
                    createdDate.getDate() === today.getDate() &&
                    createdDate.getMonth() === today.getMonth() &&
                    createdDate.getFullYear() === today.getFullYear()
                  );
                }).length}
              </h3>
            </div>
            <div className="bg-green-50 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Assigned</p>
              <h3 className="text-4xl font-bold mt-1">{
                buybackData.filter((r: BuybackRequest) => r.partner_id !== null).length
              }</h3>
            </div>
            <div className="bg-purple-50 p-3 rounded-full">
              <UserCheck className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Value</p>
              <h3 className="text-4xl font-bold mt-1 text-amber-600">${
                buybackData.reduce((sum: number, request: BuybackRequest) => {
                  const value = parseFloat(request.final_price || request.offered_price || request.estimated_value || '0');
                  return sum + (isNaN(value) ? 0 : value);
                }, 0).toFixed(2)
              }</h3>
            </div>
            <div className="bg-amber-50 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-md shadow-sm p-4 mb-4">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Buyback Requests</h2>
            <p className="text-sm text-muted-foreground">Manage all incoming device buyback requests</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="all" className="bg-white rounded-md shadow-sm p-4">
        <div className="flex justify-between items-center mb-4">
          <TabsList className="bg-gray-100 p-1 rounded-md">
            <TabsTrigger value="all" className="rounded-sm data-[state=active]:bg-white">All Requests</TabsTrigger>
            <TabsTrigger value="pending" className="rounded-sm data-[state=active]:bg-white">Pending</TabsTrigger>
            <TabsTrigger value="assigned" className="rounded-sm data-[state=active]:bg-white">Assigned</TabsTrigger>
            <TabsTrigger value="completed" className="rounded-sm data-[state=active]:bg-white">Completed</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search requests..."
                className="pl-8 w-[250px] bg-gray-50 border-gray-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] bg-gray-50 border-gray-200">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <TabsContent value="all" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle>Buyback Requests</CardTitle>
                  <CardDescription>
                    Manage all incoming device buyback requests
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search requests..."
                      className="pl-8 w-full md:w-auto"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <SelectValue placeholder="Filter by status" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingBuybacks || isLoadingPartners ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">ID</TableHead>
                        <TableHead>Device</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead className="hidden md:table-cell">
                          <div className="flex items-center gap-1">
                            Date
                            <ArrowUpDown className="h-3.5 w-3.5" />
                          </div>
                        </TableHead>
                        <TableHead className="hidden md:table-cell">Value</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBuybacks.length > 0 ? (
                        buybackData.map((request: BuybackRequest) => (
                          <TableRow key={request.id}>
                            <TableCell className="font-medium">#{request.id}</TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{request.manufacturer} {request.model}</p>
                                <p className="text-xs text-muted-foreground">{request.device_type}</p>
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(request.status)}</TableCell>
                            <TableCell>
                              {request.partner_id ? (
                                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                  {getPartnerName(request.partner_id)}
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">
                                  Unassigned
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {formatDate(request.created_at)}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {request.estimated_value ? `$${request.estimated_value}` : 'N/A'}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => openAssignDialog(request.id)}>
                                    <UserCheck className="mr-2 h-4 w-4" />
                                    Assign Partner
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => markAsComplete(request.id)}>
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Mark as Complete
                                  </DropdownMenuItem>
                                  {request.status === 'completed' && (
                                    <DropdownMenuItem onClick={() => openInvoiceModal(request)}>
                                      <FileText className="mr-2 h-4 w-4" />
                                      View/Print Invoice
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem onClick={() => cancelRequest(request.id)}>
                                    <X className="mr-2 h-4 w-4" />
                                    Cancel Request
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            No buyback requests found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="pending" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Requests</CardTitle>
              <CardDescription>
                Newly submitted requests waiting for processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Similar table with filtered data */}
              <p className="text-muted-foreground text-center py-4">
                Showing only pending requests. Click the "All Requests" tab to see everything.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="assigned" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Assigned Requests</CardTitle>
              <CardDescription>
                Requests assigned to partners for processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Similar table with filtered data */}
              <p className="text-muted-foreground text-center py-4">
                Showing only assigned requests. Click the "All Requests" tab to see everything.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="completed" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed Requests</CardTitle>
              <CardDescription>
                Successfully processed and completed buybacks
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Similar table with filtered data */}
              <p className="text-muted-foreground text-center py-4">
                Showing only completed requests. Click the "All Requests" tab to see everything.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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