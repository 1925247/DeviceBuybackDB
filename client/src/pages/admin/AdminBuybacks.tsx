import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { AssignBuybackForm } from '@/components/admin/AssignBuybackForm';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

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

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500',
  approved: 'bg-blue-500',
  rejected: 'bg-red-500',
  assigned: 'bg-purple-500',
  processing: 'bg-indigo-500',
  completed: 'bg-green-500',
  cancelled: 'bg-gray-500'
};

export default function AdminBuybacks() {
  const [page, setPage] = useState(1);
  const [selectedTab, setSelectedTab] = useState('all');
  const [detailsRequest, setDetailsRequest] = useState<BuybackRequest | null>(null);
  const queryClient = useQueryClient();
  const limit = 10;

  // Fetch buyback requests
  const { data: buybackData, isLoading } = useQuery({
    queryKey: ['/api/buyback-requests', page, selectedTab],
    queryFn: async () => {
      const statusParam = selectedTab !== 'all' ? `&status=${selectedTab}` : '';
      const response = await apiRequest('GET', `/api/buyback-requests?page=${page}&limit=${limit}${statusParam}`);
      return response.json();
    }
  });

  // Fetch partners for reference
  const { data: partners } = useQuery({
    queryKey: ['/api/partners'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/partners');
      return response.json();
    }
  });

  // Mutation for updating buyback request status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest('PUT', `/api/buyback-requests/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Status Updated',
        description: 'Buyback request status has been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/buyback-requests'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to update status: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Find partner name by ID
  const getPartnerName = (partnerId: number | null) => {
    if (!partnerId || !partners) return 'Not Assigned';
    const partner = partners.find((p: Partner) => p.id === partnerId);
    return partner ? partner.name : 'Unknown Partner';
  };

  // Handle pagination
  const handlePreviousPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (buybackData && buybackData.length === limit) {
      setPage(page + 1);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Buyback Requests Management</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Buyback Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="assigned">Assigned</TabsTrigger>
                  <TabsTrigger value="approved">Approved</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
                
                <TabsContent value={selectedTab}>
                  {isLoading ? (
                    <div className="py-10 text-center">Loading buyback requests...</div>
                  ) : (
                    <>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Device</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Partner</TableHead>
                            <TableHead>Submitted</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {buybackData && buybackData.length > 0 ? (
                            buybackData.map((request: BuybackRequest) => (
                              <TableRow key={request.id}>
                                <TableCell>#{request.id}</TableCell>
                                <TableCell>
                                  <div className="font-medium">{request.manufacturer} {request.model}</div>
                                  <div className="text-sm text-gray-500">{request.device_type}</div>
                                </TableCell>
                                <TableCell>
                                  <Badge className={statusColors[request.status] || 'bg-gray-500'}>
                                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                  </Badge>
                                </TableCell>
                                <TableCell>{getPartnerName(request.partner_id)}</TableCell>
                                <TableCell>{formatDate(request.created_at)}</TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => setDetailsRequest(request)}>
                                        View Details
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => 
                                        updateStatusMutation.mutate({ 
                                          id: request.id, 
                                          status: 'approved' 
                                        })
                                      }>
                                        Approve
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => 
                                        updateStatusMutation.mutate({ 
                                          id: request.id, 
                                          status: 'rejected'
                                        })
                                      }>
                                        Reject
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => 
                                        updateStatusMutation.mutate({ 
                                          id: request.id, 
                                          status: 'completed'
                                        })
                                      }>
                                        Mark Completed
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-10">
                                No buyback requests found
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                      
                      <div className="flex items-center justify-end space-x-2 mt-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handlePreviousPage}
                          disabled={page === 1}
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Previous
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleNextPage}
                          disabled={!buybackData || buybackData.length < limit}
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <AssignBuybackForm />
        </div>
      </div>

      {/* Buyback Request Details Dialog */}
      {detailsRequest && (
        <Dialog open={!!detailsRequest} onOpenChange={(open) => !open && setDetailsRequest(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Buyback Request Details</DialogTitle>
              <DialogDescription>
                Request #{detailsRequest.id} submitted on {formatDate(detailsRequest.created_at)}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Device Information</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Type:</span> {detailsRequest.device_type}</p>
                  <p><span className="font-medium">Manufacturer:</span> {detailsRequest.manufacturer}</p>
                  <p><span className="font-medium">Model:</span> {detailsRequest.model}</p>
                  {detailsRequest.imei && <p><span className="font-medium">IMEI:</span> {detailsRequest.imei}</p>}
                  {detailsRequest.serial_number && <p><span className="font-medium">Serial:</span> {detailsRequest.serial_number}</p>}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Status Information</h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="font-medium">Status:</span> 
                    <Badge className={`ml-2 ${statusColors[detailsRequest.status] || 'bg-gray-500'}`}>
                      {detailsRequest.status.charAt(0).toUpperCase() + detailsRequest.status.slice(1)}
                    </Badge>
                  </p>
                  <p>
                    <span className="font-medium">Partner:</span> {getPartnerName(detailsRequest.partner_id)}
                  </p>
                  <p>
                    <span className="font-medium">Estimated Value:</span> 
                    {detailsRequest.estimated_value ? `$${detailsRequest.estimated_value}` : 'Not evaluated yet'}
                  </p>
                  <p>
                    <span className="font-medium">Final Price:</span> 
                    {detailsRequest.final_price ? `$${detailsRequest.final_price}` : 'Not finalized'}
                  </p>
                </div>
              </div>

              {detailsRequest.questionnaire_answers && (
                <div className="col-span-1 md:col-span-2 mt-4">
                  <h3 className="font-semibold mb-2">Device Condition</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Object.entries(detailsRequest.questionnaire_answers).map(([question, answer], idx) => (
                      <div key={idx} className="text-sm">
                        <span className="font-medium">{question}:</span> {answer}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
              {detailsRequest.status === 'pending' && (
                <Button 
                  onClick={() => {
                    updateStatusMutation.mutate({ 
                      id: detailsRequest.id, 
                      status: 'approved' 
                    });
                    setDetailsRequest(null);
                  }}
                >
                  Approve Request
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}