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
import { Pencil, Trash2, Eye, Phone, Mail, MapPin, CalendarClock } from 'lucide-react';
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

interface BuybackRequest {
  id: number;
  user_id: number;
  device_type: string;
  device_model_id: number;
  manufacturer: string;
  model: string;
  condition: string;
  offered_price: number;
  status: string;
  notes?: string;
  variant?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  pickup_address?: string;
  pickup_date?: string;
  pickup_time?: string;
  created_at: string;
  updated_at: string;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-gray-100 text-gray-800'
};

const AdminBuybacks: React.FC = () => {
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<BuybackRequest | null>(null);
  const [formData, setFormData] = useState({
    status: '',
    notes: '',
  });
  const { toast } = useToast();

  // Query hook for fetching buyback requests
  const { data: buybackRequests, isLoading: isLoadingRequests } = useQuery<BuybackRequest[]>({
    queryKey: ['/api/buyback-requests'],
  });

  // Mutation hook for updating a buyback request
  const updateRequestMutation = useMutation({
    mutationFn: async (data: { id: number; status: string; notes?: string }) => {
      const response = await fetch(`/api/buyback-requests/${data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: data.status,
          notes: data.notes,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update buyback request');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/buyback-requests'] });
      setIsEditModalOpen(false);
      toast({
        title: 'Success',
        description: 'Buyback request updated successfully',
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

  // Mutation hook for deleting a buyback request
  const deleteRequestMutation = useMutation({
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
      setIsDeleteModalOpen(false);
      setSelectedRequest(null);
      toast({
        title: 'Success',
        description: 'Buyback request deleted successfully',
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

  // Helper functions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRequest) {
      updateRequestMutation.mutate({
        id: selectedRequest.id,
        status: formData.status,
        notes: formData.notes,
      });
    }
  };

  const handleDeleteRequest = () => {
    if (selectedRequest) {
      deleteRequestMutation.mutate(selectedRequest.id);
    }
  };

  const viewRequest = (request: BuybackRequest) => {
    setSelectedRequest(request);
    setIsViewModalOpen(true);
  };

  const openEditModal = (request: BuybackRequest) => {
    setSelectedRequest(request);
    setFormData({
      status: request.status,
      notes: request.notes || '',
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (request: BuybackRequest) => {
    setSelectedRequest(request);
    setIsDeleteModalOpen(true);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoadingRequests) {
    return (
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Buyback Requests</h1>
        </div>
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
      </div>

      {buybackRequests && buybackRequests.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {buybackRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">#{request.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{request.model}</div>
                      <div className="text-sm text-gray-500">{request.manufacturer}</div>
                      {request.variant && (
                        <div className="text-xs text-gray-400">{request.variant}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {request.customer_name || "N/A"}
                  </TableCell>
                  <TableCell>{formatCurrency(Number(request.offered_price))}</TableCell>
                  <TableCell>
                    <Badge 
                      className={statusColors[request.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}
                    >
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(request.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewRequest(request)}
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(request)}
                        title="Edit status"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteModal(request)}
                        title="Delete request"
                        className="text-red-500 hover:text-red-700"
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
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-600">No buyback requests found.</p>
        </div>
      )}

      {/* View Details Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Buyback Request Details</DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Device Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Device</h3>
                    <p className="text-lg font-medium">{selectedRequest.model}</p>
                    <p className="text-sm text-gray-600">{selectedRequest.manufacturer}</p>
                    {selectedRequest.variant && (
                      <Badge variant="outline" className="mt-1">
                        {selectedRequest.variant}
                      </Badge>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Condition</h3>
                    <p>{selectedRequest.condition}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Offered Price</h3>
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(Number(selectedRequest.offered_price))}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    <Badge 
                      className={`${
                        statusColors[selectedRequest.status as keyof typeof statusColors]
                      } mt-1`}
                    >
                      {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                    </Badge>
                  </div>
                  
                  {selectedRequest.notes && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedRequest.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedRequest.customer_name && (
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </span>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Name</h3>
                        <p>{selectedRequest.customer_name}</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedRequest.customer_email && (
                    <div className="flex items-start gap-2">
                      <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Email</h3>
                        <p>{selectedRequest.customer_email}</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedRequest.customer_phone && (
                    <div className="flex items-start gap-2">
                      <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                        <p>{selectedRequest.customer_phone}</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedRequest.pickup_address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Pickup Address</h3>
                        <p className="whitespace-pre-wrap">{selectedRequest.pickup_address}</p>
                      </div>
                    </div>
                  )}
                  
                  {(selectedRequest.pickup_date || selectedRequest.pickup_time) && (
                    <div className="flex items-start gap-2">
                      <CalendarClock className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Pickup Schedule</h3>
                        <p>
                          {selectedRequest.pickup_date && (
                            <span className="font-medium">{selectedRequest.pickup_date}</span>
                          )}
                          {selectedRequest.pickup_date && selectedRequest.pickup_time && ' • '}
                          {selectedRequest.pickup_time}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <div className="text-sm text-gray-500 w-full border-t pt-3">
                    <p>Request date: {formatDate(selectedRequest.created_at)}</p>
                    <p>Last updated: {formatDate(selectedRequest.updated_at)}</p>
                  </div>
                </CardFooter>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Status Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Buyback Request</DialogTitle>
            <DialogDescription>
              Update the status and notes for this buyback request.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateRequest} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange('status', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="min-h-[100px] w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add notes about this request"
              />
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updateRequestMutation.isPending}
              >
                {updateRequestMutation.isPending ? 'Updating...' : 'Update Status'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Buyback Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this buyback request? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedRequest && (
              <div className="p-4 bg-gray-50 rounded-md">
                <p>
                  <span className="font-medium">Device:</span> {selectedRequest.model} ({selectedRequest.manufacturer})
                </p>
                {selectedRequest.customer_name && (
                  <p>
                    <span className="font-medium">Customer:</span> {selectedRequest.customer_name}
                  </p>
                )}
                <p>
                  <span className="font-medium">Price:</span> {formatCurrency(Number(selectedRequest.offered_price))}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="destructive"
              onClick={handleDeleteRequest}
              disabled={deleteRequestMutation.isPending}
            >
              {deleteRequestMutation.isPending ? 'Deleting...' : 'Delete Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBuybacks;