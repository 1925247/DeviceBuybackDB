import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
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
  UserCog
} from 'lucide-react';

interface BuybackRequest {
  id: number;
  user_id: number;
  device_type: string;
  manufacturer: string;
  model: string;
  status: string;
  created_at: string;
  updated_at: string;
  partner_id: number | null;
  questionnaire_answers?: Record<string, string>;
  imei?: string;
  serial_number?: string;
  estimated_value?: string;
  final_price?: string;
}

interface Partner {
  id: number;
  name: string;
  email: string;
}

export default function AdminBuybacks() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedBuybackId, setSelectedBuybackId] = useState<number | undefined>(undefined);

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

  const openAssignDialog = (requestId: number) => {
    setSelectedBuybackId(requestId);
    setAssignDialogOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Buyback Requests Management</h1>
        <Button variant="outline">
          Export Data
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Requests</p>
              <h3 className="text-2xl font-bold">{buybackData.length}</h3>
            </div>
            <PieChart className="h-8 w-8 text-primary opacity-80" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">New Today</p>
              <h3 className="text-2xl font-bold">
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
            <Calendar className="h-8 w-8 text-green-600 opacity-80" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Assigned</p>
              <h3 className="text-2xl font-bold">{
                buybackData.filter((r: BuybackRequest) => r.partner_id !== null).length
              }</h3>
            </div>
            <UserCheck className="h-8 w-8 text-blue-600 opacity-80" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Value</p>
              <h3 className="text-2xl font-bold">${
                buybackData.reduce((sum: number, request: BuybackRequest) => {
                  const value = parseFloat(request.estimated_value || '0');
                  return sum + (isNaN(value) ? 0 : value);
                }, 0).toFixed(2)
              }</h3>
            </div>
            <DollarSign className="h-8 w-8 text-yellow-600 opacity-80" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Requests</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="assigned">Assigned</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
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
                                  <DropdownMenuItem>
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Mark as Complete
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <DollarSign className="mr-2 h-4 w-4" />
                                    Update Value
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
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
    </div>
  );
}