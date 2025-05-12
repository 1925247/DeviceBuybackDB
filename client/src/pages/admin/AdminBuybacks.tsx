import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { Edit, Trash2, Eye, Phone, Mail, MapPin, Calendar, Clock, UserPlus } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Badge,
} from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

interface BuybackRequest {
  id: number;
  user_id: number;
  device_model_id: number;
  device_type: string;
  manufacturer: string;
  model: string;
  condition: string;
  offered_price: string;
  variant: string | null;
  status: string;
  notes: string | null;
  pickup_address: string;
  pickup_date: string;
  pickup_time: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  assigned_to?: string;
  pickup_notes?: string;
  created_at?: string;
  updated_at?: string;
}

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'assigned', label: 'Assigned to Staff' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const getStatusColor = (status: string) => {
  switch(status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'assigned':
      return 'bg-indigo-100 text-indigo-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'processing':
      return 'bg-blue-100 text-blue-800';
    case 'completed':
      return 'bg-purple-100 text-purple-800';
    case 'cancelled':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const AdminBuybacks: React.FC = () => {
  const [currentTab, setCurrentTab] = useState('all');
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [statusUpdateModalOpen, setStatusUpdateModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<BuybackRequest | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [assignedStaff, setAssignedStaff] = useState('');
  const [pickupNotes, setPickupNotes] = useState('');
  const { toast } = useToast();

  // Query to fetch buyback requests
  const { data: buybackRequests, isLoading, refetch } = useQuery<{ requests: BuybackRequest[], total: number }>({
    queryKey: ['/api/buyback-requests'],
  });

  // Mutation to update buyback request status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      const response = await fetch(`/api/buyback-requests/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update status');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/buyback-requests'] });
      setStatusUpdateModalOpen(false);
      toast({
        title: 'Status Updated',
        description: 'The buyback request status has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Mutation to assign buyback request to staff
  const assignRequestMutation = useMutation({
    mutationFn: async ({ id, assignedTo, pickupNotes }: { id: number, assignedTo: string, pickupNotes: string }) => {
      const response = await fetch(`/api/buyback-requests/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          assigned_to: assignedTo, 
          pickup_notes: pickupNotes,
          status: 'assigned' 
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to assign request');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/buyback-requests'] });
      setAssignModalOpen(false);
      setAssignedStaff('');
      setPickupNotes('');
      toast({
        title: 'Request Assigned',
        description: 'The buyback request has been assigned successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mutation to delete buyback request
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/buyback-requests/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete buyback request');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/buyback-requests'] });
      setDeleteModalOpen(false);
      setSelectedRequest(null);
      toast({
        title: 'Request Deleted',
        description: 'The buyback request has been deleted successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleViewRequest = (request: BuybackRequest) => {
    setSelectedRequest(request);
    setViewModalOpen(true);
  };

  const handleDeleteRequest = (request: BuybackRequest) => {
    setSelectedRequest(request);
    setDeleteModalOpen(true);
  };

  const handleUpdateStatus = (request: BuybackRequest) => {
    setSelectedRequest(request);
    setNewStatus(request.status);
    setStatusUpdateModalOpen(true);
  };
  
  const handleAssignRequest = (request: BuybackRequest) => {
    setSelectedRequest(request);
    setAssignedStaff(request.assigned_to || '');
    setPickupNotes(request.pickup_notes || '');
    setAssignModalOpen(true);
  };

  const confirmDeleteRequest = () => {
    if (selectedRequest) {
      deleteMutation.mutate(selectedRequest.id);
    }
  };

  const confirmUpdateStatus = () => {
    if (selectedRequest && newStatus) {
      updateStatusMutation.mutate({ id: selectedRequest.id, status: newStatus });
    }
  };
  
  const confirmAssignRequest = () => {
    if (selectedRequest && assignedStaff) {
      assignRequestMutation.mutate({ 
        id: selectedRequest.id, 
        assignedTo: assignedStaff, 
        pickupNotes: pickupNotes 
      });
    }
  };

  const filteredRequests = buybackRequests?.requests.filter(request => {
    if (currentTab === 'all') return true;
    return request.status === currentTab;
  }) || [];

  if (isLoading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Buyback Requests</h1>
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading buyback requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Buyback Requests</h1>
        <Button onClick={() => refetch()} className="flex items-center gap-2">
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="all" className="mb-6" onValueChange={setCurrentTab}>
        <TabsList className="mb-2">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="assigned">Assigned</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={currentTab}>
          <Card>
            <CardHeader>
              <CardTitle>
                {currentTab === 'all' ? 'All' : currentTab.charAt(0).toUpperCase() + currentTab.slice(1)} Buyback Requests
              </CardTitle>
              <CardDescription>
                {filteredRequests.length} {filteredRequests.length === 1 ? 'request' : 'requests'} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredRequests.length > 0 ? (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Device</TableHead>
                        <TableHead>Condition</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">#{request.id}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>{request.customer_name}</span>
                              <span className="text-sm text-gray-500">{request.customer_email}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{request.manufacturer} {request.model}</span>
                              {request.variant && <span className="text-sm text-gray-500">{request.variant}</span>}
                            </div>
                          </TableCell>
                          <TableCell>{request.condition}</TableCell>
                          <TableCell className="font-medium">${request.offered_price}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(request.status)}>
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {request.assigned_to ? (
                              <div className="flex items-center text-sm">
                                <UserPlus className="h-3.5 w-3.5 mr-1 text-blue-500" />
                                <span>{request.assigned_to}</span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">Not assigned</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {request.created_at ? new Date(request.created_at).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewRequest(request)}
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleUpdateStatus(request)}
                                title="Update Status"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleAssignRequest(request)}
                                title="Assign to Staff"
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <UserPlus className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteRequest(request)}
                                title="Delete Request"
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">No buyback requests found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Request Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Buyback Request Details</DialogTitle>
            <DialogDescription>
              Complete information about this buyback request
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="font-semibold text-lg">
                          {selectedRequest.customer_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium">{selectedRequest.customer_name}</h3>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Mail className="h-3.5 w-3.5 mr-1" />
                          <span>{selectedRequest.customer_email}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Phone className="h-3.5 w-3.5 mr-1" />
                          <span>{selectedRequest.customer_phone}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <h3 className="text-sm font-medium mb-2">Pickup Information</h3>
                      <div className="rounded-md bg-gray-50 p-3 space-y-2">
                        <div className="flex items-start text-sm">
                          <MapPin className="h-4 w-4 mr-2 text-gray-500 mt-0.5" />
                          <span className="flex-1">{selectedRequest.pickup_address}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{selectedRequest.pickup_date}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{selectedRequest.pickup_time}</span>
                        </div>
                        
                        {selectedRequest.assigned_to && (
                        <div className="border-t border-gray-200 pt-2 mt-2">
                          <div className="flex items-center text-sm">
                            <UserPlus className="h-4 w-4 mr-2 text-gray-500" />
                            <span>Assigned to: <span className="font-medium">{selectedRequest.assigned_to}</span></span>
                          </div>
                          {selectedRequest.pickup_notes && (
                            <div className="text-sm mt-2 pl-6">
                              <p className="text-gray-500">Notes: {selectedRequest.pickup_notes}</p>
                            </div>
                          )}
                        </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Device Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-medium text-lg">
                        {selectedRequest.manufacturer} {selectedRequest.model}
                        {selectedRequest.variant && ` (${selectedRequest.variant})`}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {selectedRequest.device_type.charAt(0).toUpperCase() + selectedRequest.device_type.slice(1)}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium">Condition</h4>
                        <p className="mt-1">{selectedRequest.condition}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Offered Price</h4>
                        <p className="mt-1 text-xl font-bold">${selectedRequest.offered_price}</p>
                      </div>
                    </div>
                    
                    {selectedRequest.notes && (
                      <div className="pt-2">
                        <h4 className="text-sm font-medium mb-2">Additional Notes</h4>
                        <div className="rounded-md bg-gray-50 p-3 text-sm">
                          {selectedRequest.notes}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <div className="flex items-center justify-between border-t pt-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Current Status</p>
                  <Badge className={`${getStatusColor(selectedRequest.status)} text-sm px-3 py-1`}>
                    {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                  </Badge>
                </div>
                <div className="space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => handleUpdateStatus(selectedRequest)}
                  >
                    Update Status
                  </Button>
                  <Button onClick={() => setViewModalOpen(false)}>Close</Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Status Modal */}
      <Dialog open={statusUpdateModalOpen} onOpenChange={setStatusUpdateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Status</DialogTitle>
            <DialogDescription>
              Change the status of this buyback request
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="py-4">
              <div className="mb-4">
                <p className="text-sm mb-1">Request #{selectedRequest.id}: {selectedRequest.manufacturer} {selectedRequest.model}</p>
                <p className="text-sm text-gray-500">Current Status: <span className="font-medium">{selectedRequest.status}</span></p>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="status">New Status</Label>
                <Select
                  value={newStatus}
                  onValueChange={setNewStatus}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setStatusUpdateModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={confirmUpdateStatus} disabled={updateStatusMutation.isPending}>
                  {updateStatusMutation.isPending ? 'Updating...' : 'Update Status'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Buyback Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this buyback request? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="py-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <p><span className="font-medium">Request ID:</span> #{selectedRequest.id}</p>
                <p><span className="font-medium">Customer:</span> {selectedRequest.customer_name}</p>
                <p><span className="font-medium">Device:</span> {selectedRequest.manufacturer} {selectedRequest.model}</p>
                <p><span className="font-medium">Offered Price:</span> ${selectedRequest.offered_price}</p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteRequest}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Staff Assignment Dialog */}
      <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Request to Staff</DialogTitle>
            <DialogDescription>
              Assign this buyback request to a staff member for processing and pickup.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="deviceInfo">Device Information</Label>
              <div id="deviceInfo" className="text-sm p-2 bg-gray-50 rounded-md">
                {selectedRequest && (
                  <>
                    <p><span className="font-medium">{selectedRequest.manufacturer}</span> {selectedRequest.model}</p>
                    <p className="text-gray-500">{selectedRequest.condition} condition</p>
                    {selectedRequest.variant && <p className="text-gray-500">Variant: {selectedRequest.variant}</p>}
                  </>
                )}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="assignedStaff">Assign To</Label>
              <Select
                value={assignedStaff}
                onValueChange={setAssignedStaff}
              >
                <SelectTrigger id="assignedStaff">
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="john.doe">John Doe</SelectItem>
                  <SelectItem value="jane.smith">Jane Smith</SelectItem>
                  <SelectItem value="robert.johnson">Robert Johnson</SelectItem>
                  <SelectItem value="emily.williams">Emily Williams</SelectItem>
                  <SelectItem value="michael.brown">Michael Brown</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pickupNotes">Pickup Notes</Label>
              <Input
                id="pickupNotes"
                value={pickupNotes}
                onChange={(e) => setPickupNotes(e.target.value)}
                placeholder="Add any special instructions for pickup"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmAssignRequest}
              disabled={!assignedStaff}
            >
              Assign Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBuybacks;