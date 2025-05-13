import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { PlusCircle, Pencil, Trash2, CheckCircle, ExternalLink } from 'lucide-react';
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
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface BuybackRequest {
  id: number;
  user_id: number;
  device_type: string;
  manufacturer: string;
  model: string;
  condition: string;
  estimated_value: string;
  final_value?: string;
  status: string;
  partner_id?: number;
  region_id?: number;
  created_at: string;
  updated_at: string;
  questionnaire_answers?: any;
  contact_info?: {
    name: string;
    email: string;
    phone: string;
    address?: string;
  };
}

interface Partner {
  id: number;
  name: string;
  email: string;
  logo?: string;
}

interface Region {
  id: number;
  name: string;
  code: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-purple-100 text-purple-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

const AdminBuybacks: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('recent');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedBuyback, setSelectedBuyback] = useState<BuybackRequest | null>(null);
  const [formData, setFormData] = useState({
    status: '',
    final_value: '',
    partner_id: '',
    region_id: '',
    notes: '',
  });
  const { toast } = useToast();

  // Query hooks for fetching data
  const { data, isLoading: isLoadingBuybacks } = useQuery<{ requests: BuybackRequest[] }>({
    queryKey: ['/api/buyback-requests', selectedStatus],
    queryFn: async () => {
      const url = selectedStatus 
        ? `/api/buyback-requests?status=${selectedStatus}` 
        : '/api/buyback-requests';
      return apiRequest('GET', url).then(res => res.json());
    },
  });
  
  // Extract the buybacks array from the response
  const buybacks = data?.requests || [];

  const { data: recentData, isLoading: isLoadingRecent } = useQuery<{ requests: BuybackRequest[] }>({
    queryKey: ['/api/buyback-requests/recent'],
    queryFn: async () => {
      return apiRequest('GET', '/api/buyback-requests/recent').then(res => res.json());
    },
  });
  
  // Extract the recent buybacks array from the response
  const recentBuybacks = recentData?.requests || [];

  const { data: partners, isLoading: isLoadingPartners } = useQuery<Partner[]>({
    queryKey: ['/api/partners'],
    queryFn: async () => {
      return apiRequest('GET', '/api/partners').then(res => res.json());
    },
    retry: 1,
  });

  const { data: regions, isLoading: isLoadingRegions } = useQuery<Region[]>({
    queryKey: ['/api/regions'],
    queryFn: async () => {
      return apiRequest('GET', '/api/regions').then(res => res.json());
    },
    retry: 1,
  });

  // Mutation hooks for updating and deleting buyback requests
  const updateBuybackMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      return apiRequest('PUT', `/api/buyback-requests/${id}`, data).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/buyback-requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/buyback-requests/recent'] });
      setIsEditModalOpen(false);
      setIsAssignModalOpen(false);
      setSelectedBuyback(null);
      resetForm();
      toast({
        title: 'Success',
        description: 'Buyback request updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update buyback request',
        variant: 'destructive',
      });
    },
  });

  const deleteBuybackMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/buyback-requests/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/buyback-requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/buyback-requests/recent'] });
      setIsDeleteModalOpen(false);
      setSelectedBuyback(null);
      toast({
        title: 'Success',
        description: 'Buyback request deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete buyback request',
        variant: 'destructive',
      });
    },
  });

  const assignPartnerMutation = useMutation({
    mutationFn: async (data: { buybackRequestId: number, partnerId: number }) => {
      return apiRequest('POST', '/api/partners/assign-buyback', data).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/buyback-requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/buyback-requests/recent'] });
      setIsAssignModalOpen(false);
      setSelectedBuyback(null);
      resetForm();
      toast({
        title: 'Success',
        description: 'Partner assigned successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to assign partner',
        variant: 'destructive',
      });
    },
  });

  // Helper functions
  const resetForm = () => {
    setFormData({
      status: '',
      final_value: '',
      partner_id: '',
      region_id: '',
      notes: '',
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusFilter = (status: string | null) => {
    setSelectedStatus(status);
  };

  const handleEditBuyback = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBuyback) {
      const data: any = {};
      
      if (formData.status) data.status = formData.status;
      if (formData.final_value) data.final_value = formData.final_value;
      if (formData.partner_id) data.partner_id = parseInt(formData.partner_id);
      if (formData.region_id) data.region_id = parseInt(formData.region_id);
      if (formData.notes) data.notes = formData.notes;
      
      updateBuybackMutation.mutate({ id: selectedBuyback.id, data });
    }
  };

  const handleDeleteBuyback = () => {
    if (selectedBuyback) {
      deleteBuybackMutation.mutate(selectedBuyback.id);
    }
  };

  const handleAssignPartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBuyback && formData.partner_id) {
      assignPartnerMutation.mutate({
        buybackRequestId: selectedBuyback.id,
        partnerId: parseInt(formData.partner_id),
      });
    }
  };

  const openEditModal = (buyback: BuybackRequest) => {
    setSelectedBuyback(buyback);
    setFormData({
      status: buyback.status,
      final_value: buyback.final_value || buyback.estimated_value,
      partner_id: buyback.partner_id ? buyback.partner_id.toString() : '',
      region_id: buyback.region_id ? buyback.region_id.toString() : '',
      notes: '',
    });
    setIsEditModalOpen(true);
  };

  const openAssignModal = (buyback: BuybackRequest) => {
    setSelectedBuyback(buyback);
    setFormData({
      ...formData,
      partner_id: buyback.partner_id ? buyback.partner_id.toString() : '',
    });
    setIsAssignModalOpen(true);
  };

  const openDeleteModal = (buyback: BuybackRequest) => {
    setSelectedBuyback(buyback);
    setIsDeleteModalOpen(true);
  };

  const openDetailsModal = (buyback: BuybackRequest) => {
    setSelectedBuyback(buyback);
    setIsDetailsModalOpen(true);
  };

  const getPartnerName = (partnerId?: number) => {
    if (!partnerId || !partners) return 'Unassigned';
    const partner = partners.find(p => p.id === partnerId);
    return partner ? partner.name : 'Unknown Partner';
  };

  const getRegionName = (regionId?: number) => {
    if (!regionId || !regions) return 'Global';
    const region = regions.find(r => r.id === regionId);
    return region ? region.name : 'Unknown Region';
  };

  // Loading state
  if ((isLoadingBuybacks && selectedTab === 'all') || (isLoadingRecent && selectedTab === 'recent')) {
    return (
      <div className="py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Buyback Management</h1>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  const renderEditModal = () => (
    <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Buyback Request</DialogTitle>
          <DialogDescription>
            Update the status and details of this buyback request.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleEditBuyback} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium">Current Status</label>
              <div className={`px-3 py-2 rounded-md text-sm font-medium ${statusColors[selectedBuyback?.status || 'pending']}`}>
                {selectedBuyback?.status.toUpperCase()}
              </div>
            </div>
            
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium">Update Status</label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => handleSelectChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium">Estimated Value</label>
              <div className="px-3 py-2 rounded-md border border-gray-200 text-sm">
                ${selectedBuyback?.estimated_value}
              </div>
            </div>
            
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium">Final Value</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
                <Input
                  name="final_value"
                  type="text"
                  value={formData.final_value}
                  onChange={handleInputChange}
                  className="pl-7"
                  placeholder="Enter final value"
                />
              </div>
            </div>
            
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium">Assigned Partner</label>
              <Select 
                value={formData.partner_id} 
                onValueChange={(value) => handleSelectChange('partner_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select partner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {partners?.map((partner) => (
                    <SelectItem key={partner.id} value={partner.id.toString()}>
                      {partner.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium">Region</label>
              <Select 
                value={formData.region_id} 
                onValueChange={(value) => handleSelectChange('region_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Global</SelectItem>
                  {regions?.map((region) => (
                    <SelectItem key={region.id} value={region.id.toString()}>
                      {region.name} ({region.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium">Notes</label>
              <Input
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Add optional notes"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateBuybackMutation.isPending}>
              {updateBuybackMutation.isPending ? 'Updating...' : 'Update Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  const renderAssignModal = () => (
    <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign to Partner</DialogTitle>
          <DialogDescription>
            Assign this buyback request to a partner for processing.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleAssignPartner} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Buyback Request</label>
            <div className="px-3 py-2 rounded-md border border-gray-200 text-sm">
              {selectedBuyback?.manufacturer} {selectedBuyback?.model} - ${selectedBuyback?.estimated_value}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Partner</label>
            <Select 
              value={formData.partner_id} 
              onValueChange={(value) => handleSelectChange('partner_id', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select partner" />
              </SelectTrigger>
              <SelectContent>
                {partners?.map((partner) => (
                  <SelectItem key={partner.id} value={partner.id.toString()}>
                    {partner.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={assignPartnerMutation.isPending || !formData.partner_id}>
              {assignPartnerMutation.isPending ? 'Assigning...' : 'Assign Partner'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  const renderDeleteModal = () => (
    <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Buyback Request</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this buyback request? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="font-medium">
            {selectedBuyback?.manufacturer} {selectedBuyback?.model} - ${selectedBuyback?.estimated_value}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Status: {selectedBuyback?.status.toUpperCase()}
          </p>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDeleteBuyback}
            disabled={deleteBuybackMutation.isPending}
          >
            {deleteBuybackMutation.isPending ? 'Deleting...' : 'Delete Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const renderDetailsModal = () => (
    <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Buyback Request Details</DialogTitle>
          <DialogDescription>
            Detailed information about this buyback request.
          </DialogDescription>
        </DialogHeader>
        {selectedBuyback && (
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Request ID</h3>
                <p className="mt-1">{selectedBuyback.id}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <span className={`mt-1 inline-block px-2 py-1 rounded-full text-xs font-medium ${statusColors[selectedBuyback.status]}`}>
                  {selectedBuyback.status.toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Created</h3>
                <p className="mt-1">{format(new Date(selectedBuyback.created_at), 'MMM d, yyyy')}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                <p className="mt-1">{format(new Date(selectedBuyback.updated_at), 'MMM d, yyyy')}</p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-base font-medium">Device Information</h3>
              <div className="mt-2 grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Device Type</h4>
                  <p className="mt-1">{selectedBuyback.device_type}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Manufacturer</h4>
                  <p className="mt-1">{selectedBuyback.manufacturer}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Model</h4>
                  <p className="mt-1">{selectedBuyback.model}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Condition</h4>
                  <p className="mt-1">{selectedBuyback.condition}</p>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-base font-medium">Valuation</h3>
              <div className="mt-2 grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Estimated Value</h4>
                  <p className="mt-1 text-lg font-semibold">${selectedBuyback.estimated_value}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Final Value</h4>
                  <p className="mt-1 text-lg font-semibold">
                    {selectedBuyback.final_value ? `$${selectedBuyback.final_value}` : '—'}
                  </p>
                </div>
              </div>
            </div>
            
            {selectedBuyback.contact_info && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-base font-medium">Contact Information</h3>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Name</h4>
                    <p className="mt-1">{selectedBuyback.contact_info.name}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Email</h4>
                    <p className="mt-1">{selectedBuyback.contact_info.email}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Phone</h4>
                    <p className="mt-1">{selectedBuyback.contact_info.phone}</p>
                  </div>
                  {selectedBuyback.contact_info.address && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Address</h4>
                      <p className="mt-1">{selectedBuyback.contact_info.address}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {selectedBuyback.questionnaire_answers && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-base font-medium">Questionnaire Answers</h3>
                <div className="mt-2 space-y-3">
                  {Object.entries(selectedBuyback.questionnaire_answers).map(([question, answer], index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-md">
                      <h4 className="text-sm font-medium">{question}</h4>
                      <p className="mt-1 text-sm">{String(answer)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-base font-medium">Assignment</h3>
              <div className="mt-2 grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Partner</h4>
                  <p className="mt-1">{getPartnerName(selectedBuyback.partner_id)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Region</h4>
                  <p className="mt-1">{getRegionName(selectedBuyback.region_id)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button type="button" onClick={() => setIsDetailsModalOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Buyback Management</h1>
      </div>

      <Tabs defaultValue="recent" value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="recent">Recent Requests</TabsTrigger>
          <TabsTrigger value="all">All Requests</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Recent Buyback Requests</CardTitle>
              <CardDescription>
                Recent buyback requests from users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Est. Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Partner</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(!recentBuybacks || recentBuybacks.length === 0) ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No recent buyback requests found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentBuybacks.map((buyback) => (
                      <TableRow key={buyback.id}>
                        <TableCell>{buyback.id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{buyback.manufacturer} {buyback.model}</p>
                            <p className="text-xs text-gray-500">{buyback.device_type}</p>
                          </div>
                        </TableCell>
                        <TableCell>${buyback.estimated_value}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[buyback.status]}>
                            {buyback.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>{format(new Date(buyback.created_at), 'MMM d, yyyy')}</TableCell>
                        <TableCell>{getPartnerName(buyback.partner_id)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => openDetailsModal(buyback)}
                              title="View Details"
                            >
                              <ExternalLink size={16} />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => openEditModal(buyback)}
                              title="Edit"
                            >
                              <Pencil size={16} />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => openAssignModal(buyback)}
                              title="Assign to Partner"
                            >
                              <CheckCircle size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>All Buyback Requests</CardTitle>
                  <CardDescription>
                    View and manage all buyback requests in the system
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedStatus === null ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusFilter(null)}
                  >
                    All
                  </Button>
                  <Button
                    variant={selectedStatus === 'pending' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusFilter('pending')}
                  >
                    Pending
                  </Button>
                  <Button
                    variant={selectedStatus === 'approved' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusFilter('approved')}
                  >
                    Approved
                  </Button>
                  <Button
                    variant={selectedStatus === 'processing' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusFilter('processing')}
                  >
                    Processing
                  </Button>
                  <Button
                    variant={selectedStatus === 'completed' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusFilter('completed')}
                  >
                    Completed
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Est. Value</TableHead>
                    <TableHead>Final Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Partner</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(!buybacks || buybacks.length === 0) ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        No buyback requests found matching the selected filter.
                      </TableCell>
                    </TableRow>
                  ) : (
                    buybacks.map((buyback) => (
                      <TableRow key={buyback.id}>
                        <TableCell>{buyback.id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{buyback.manufacturer} {buyback.model}</p>
                            <p className="text-xs text-gray-500">{buyback.device_type}</p>
                          </div>
                        </TableCell>
                        <TableCell>${buyback.estimated_value}</TableCell>
                        <TableCell>{buyback.final_value ? `$${buyback.final_value}` : '—'}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[buyback.status]}>
                            {buyback.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>{getPartnerName(buyback.partner_id)}</TableCell>
                        <TableCell>{getRegionName(buyback.region_id)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => openDetailsModal(buyback)}
                              title="View Details"
                            >
                              <ExternalLink size={16} />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => openEditModal(buyback)}
                              title="Edit"
                            >
                              <Pencil size={16} />
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="icon"
                              onClick={() => openDeleteModal(buyback)}
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Render modals */}
      {renderEditModal()}
      {renderAssignModal()}
      {renderDeleteModal()}
      {renderDetailsModal()}
    </div>
  );
};

export default AdminBuybacks;