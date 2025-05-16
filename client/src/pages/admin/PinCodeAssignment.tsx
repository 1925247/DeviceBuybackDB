import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { getLocationFromPincode } from '../../api/pincode';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { 
  MapPin, 
  Search, 
  Plus, 
  RefreshCw, 
  Edit, 
  Trash, 
  SaveIcon,
  Building,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose 
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PinCode {
  id: number;
  code: string;
  city: string;
  state: string;
  isMetro: boolean;
  isActive: boolean;
  partnerId?: number;
  partnerName?: string;
  createdAt: string;
  updatedAt: string;
}

interface Partner {
  id: number;
  name: string;
  slug: string;
  city: string;
  state: string;
}

const PinCodeAssignment: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [partnerFilter, setPartnerFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddPincodeOpen, setIsAddPincodeOpen] = useState(false);
  const [isAssignPartnerOpen, setIsAssignPartnerOpen] = useState(false);
  const [isEditPincodeOpen, setIsEditPincodeOpen] = useState(false);
  const [selectedPincode, setSelectedPincode] = useState<PinCode | null>(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');
  
  // Form state
  const [newPincode, setNewPincode] = useState({
    code: '',
    city: '',
    state: '',
    isMetro: false,
    isActive: true
  });
  
  const [isLoadingPincodeData, setIsLoadingPincodeData] = useState(false);
  
  // Function to fetch PIN code information
  const fetchPincodeInfo = async (pincode: string) => {
    try {
      setIsLoadingPincodeData(true);
      
      // First, check if the PIN code already exists in our database
      const existingPincodes = pincodes?.filter(p => p.code === pincode);
      
      if (existingPincodes && existingPincodes.length > 0) {
        const existingPincode = existingPincodes[0];
        setNewPincode(prev => ({
          ...prev,
          city: existingPincode.city,
          state: existingPincode.state,
          isMetro: existingPincode.isMetro
        }));
        
        toast({
          title: 'PIN Code Found',
          description: `Address details loaded for ${pincode}`,
        });
        return;
      }
      
      // Try to fetch from the reliable public postal PIN code API
      try {
        const location = await getLocationFromPincode(pincode);
        if (location && location.city && location.state) {
          setNewPincode(prev => ({
            ...prev,
            city: location.city,
            state: location.state,
            // Most major cities are metro areas in India (Delhi, Mumbai, etc.)
            isMetro: ['Delhi', 'Mumbai', 'Kolkata', 'Chennai', 'Bangalore', 
                      'Hyderabad', 'Pune', 'Ahmedabad'].includes(location.city) || prev.isMetro
          }));
          
          toast({
            title: 'PIN Code Found',
            description: `Address details loaded for ${pincode}`,
          });
          return;
        }
      } catch (apiError) {
        console.error('Public PIN code API error:', apiError);
      }
      
      // Fallback to our internal API if public API fails
      const response = await fetch(`/api/indian/postal-codes/${pincode}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.city && data.state) {
          setNewPincode(prev => ({
            ...prev,
            city: data.city,
            state: data.state,
            // Most major cities are metro areas in India (Delhi, Mumbai, etc.)
            isMetro: data.isMetro || ['Delhi', 'Mumbai', 'Kolkata', 'Chennai', 'Bangalore', 
                      'Hyderabad', 'Pune', 'Ahmedabad'].includes(data.city) || prev.isMetro
          }));
          
          toast({
            title: 'PIN Code Found',
            description: `Address details loaded for ${pincode}`,
          });
        } else {
          toast({
            title: 'PIN Code Not Found',
            description: 'Please enter city and state manually',
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: 'PIN Code Not Found',
          description: 'Please enter city and state manually',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching PIN code data:', error);
      toast({
        title: 'Error',
        description: 'Failed to lookup PIN code information',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingPincodeData(false);
    }
  };
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const perPage = 10;
  
  // Fetch pincodes
  const { data: pincodes, isLoading: isLoadingPincodes } = useQuery<PinCode[]>({
    queryKey: ['/api/pincodes', stateFilter, partnerFilter, statusFilter, currentPage],
    queryFn: async () => {
      let url = `/api/pincodes?page=${currentPage}&limit=${perPage}`;
      
      if (stateFilter !== 'all') {
        url += `&state=${stateFilter}`;
      }
      
      if (partnerFilter !== 'all') {
        url += `&partnerId=${partnerFilter}`;
      }
      
      if (statusFilter !== 'all') {
        url += `&isActive=${statusFilter === 'active'}`;
      }
      
      return apiRequest('GET', url).then(res => res.json());
    },
  });
  
  // Fetch partners for dropdown
  const { data: partners, isLoading: isLoadingPartners } = useQuery<Partner[]>({
    queryKey: ['/api/partners'],
    queryFn: async () => {
      return apiRequest('GET', '/api/partners?status=approved').then(res => res.json());
    },
  });
  
  // Fetch states for dropdown
  const { data: states, isLoading: isLoadingStates } = useQuery<string[]>({
    queryKey: ['/api/states'],
    queryFn: async () => {
      return apiRequest('GET', '/api/states').then(res => res.json());
    },
  });
  
  // Add new pincode mutation
  const addPincodeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/pincodes', newPincode).then(res => res.json());
    },
    onSuccess: () => {
      toast({
        title: 'Pincode Added',
        description: 'The pincode has been successfully added.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/pincodes'] });
      setIsAddPincodeOpen(false);
      setNewPincode({
        code: '',
        city: '',
        state: '',
        isMetro: false,
        isActive: true
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add pincode',
        variant: 'destructive',
      });
    }
  });
  
  // Assign partner mutation
  const assignPartnerMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPincode || !selectedPartnerId) return;
      
      return apiRequest('PUT', `/api/pincodes/${selectedPincode.id}/assign`, {
        partnerId: parseInt(selectedPartnerId)
      }).then(res => res.json());
    },
    onSuccess: () => {
      toast({
        title: 'Partner Assigned',
        description: 'The partner has been successfully assigned to this pincode.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/pincodes'] });
      setIsAssignPartnerOpen(false);
      setSelectedPartnerId('');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to assign partner',
        variant: 'destructive',
      });
    }
  });
  
  // Edit pincode mutation
  const editPincodeMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPincode) return;
      
      return apiRequest('PUT', `/api/pincodes/${selectedPincode.id}`, {
        code: selectedPincode.code,
        city: selectedPincode.city,
        state: selectedPincode.state,
        isMetro: selectedPincode.isMetro,
        isActive: selectedPincode.isActive
      }).then(res => res.json());
    },
    onSuccess: () => {
      toast({
        title: 'Pincode Updated',
        description: 'The pincode has been successfully updated.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/pincodes'] });
      setIsEditPincodeOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update pincode',
        variant: 'destructive',
      });
    }
  });
  
  // Remove partner assignment mutation
  const removeAssignmentMutation = useMutation({
    mutationFn: async (pincodeId: number) => {
      return apiRequest('PUT', `/api/pincodes/${pincodeId}/unassign`, {}).then(res => res.json());
    },
    onSuccess: () => {
      toast({
        title: 'Assignment Removed',
        description: 'The partner assignment has been removed from this pincode.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/pincodes'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove partner assignment',
        variant: 'destructive',
      });
    }
  });
  
  // Filter pincodes based on search term
  const filteredPincodes = pincodes?.filter(pincode => 
    pincode.code.includes(searchTerm) ||
    pincode.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pincode.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (pincode.partnerName && pincode.partnerName.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const handleOpenAssignPartner = (pincode: PinCode) => {
    setSelectedPincode(pincode);
    setSelectedPartnerId(pincode.partnerId?.toString() || '');
    setIsAssignPartnerOpen(true);
  };
  
  const handleOpenEditPincode = (pincode: PinCode) => {
    setSelectedPincode(pincode);
    setIsEditPincodeOpen(true);
  };
  
  const handleRemoveAssignment = (pincodeId: number) => {
    removeAssignmentMutation.mutate(pincodeId);
  };
  
  return (
    <div className="px-4 md:px-6 py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">PIN Code Assignment</h1>
        
        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsAddPincodeOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add PIN Code
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative flex items-center">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search PIN codes..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div>
          <Select value={stateFilter} onValueChange={setStateFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by State" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {states?.map(state => (
                <SelectItem key={state} value={state}>{state}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Select value={partnerFilter} onValueChange={setPartnerFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Partner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Partners</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {partners?.map(partner => (
                <SelectItem key={partner.id.toString()} value={partner.id.toString()}>
                  {partner.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
          {isLoadingPincodes ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredPincodes?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No PIN codes found matching the criteria.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PIN Code</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned Partner</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPincodes?.map((pincode) => (
                  <TableRow key={pincode.id}>
                    <TableCell className="font-medium">{pincode.code}</TableCell>
                    <TableCell>
                      <div>{pincode.city}</div>
                      <div className="text-sm text-gray-500">{pincode.state}</div>
                    </TableCell>
                    <TableCell>
                      {pincode.isMetro ? (
                        <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                          Metro
                        </Badge>
                      ) : (
                        <Badge variant="outline">Regular</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {pincode.isActive ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {pincode.partnerName ? (
                        <div className="flex items-center">
                          <Building className="h-4 w-4 mr-2 text-blue-600" />
                          <span>{pincode.partnerName}</span>
                        </div>
                      ) : (
                        <span className="text-gray-500 italic">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenEditPincode(pincode)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit PIN Code
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenAssignPartner(pincode)}>
                              <Building className="h-4 w-4 mr-2" />
                              {pincode.partnerId ? 'Reassign Partner' : 'Assign Partner'}
                            </DropdownMenuItem>
                            {pincode.partnerId && (
                              <DropdownMenuItem onClick={() => handleRemoveAssignment(pincode.id)}>
                                <XCircle className="h-4 w-4 mr-2" />
                                Remove Assignment
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter className="flex items-center justify-between p-4 border-t">
          <div className="text-sm text-gray-500">
            Showing page {currentPage} of pincodes
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(page => Math.max(page - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(page => page + 1)}
              disabled={filteredPincodes?.length < perPage}
            >
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      {/* Add PIN Code Dialog */}
      <Dialog open={isAddPincodeOpen} onOpenChange={setIsAddPincodeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New PIN Code</DialogTitle>
            <DialogDescription>
              Enter the details to add a new PIN code to the system.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="code" className="text-right">
                PIN Code
              </Label>
              <div className="col-span-3 flex gap-2">
                <Input
                  id="code"
                  placeholder="e.g. 110001"
                  className="flex-1"
                  value={newPincode.code}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewPincode({...newPincode, code: value});
                    
                    // Auto-lookup when 6 digits are entered
                    if (value.length === 6 && /^\d{6}$/.test(value)) {
                      fetchPincodeInfo(value);
                    }
                  }}
                />
                {isLoadingPincodeData && (
                  <div className="flex items-center">
                    <RefreshCw className="h-4 w-4 animate-spin text-gray-500" />
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="city" className="text-right">
                City
              </Label>
              <Input
                id="city"
                placeholder="e.g. New Delhi"
                className="col-span-3"
                value={newPincode.city}
                onChange={(e) => setNewPincode({...newPincode, city: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="state" className="text-right">
                State
              </Label>
              <Select 
                value={newPincode.state} 
                onValueChange={(value) => setNewPincode({...newPincode, state: value})}
              >
                <SelectTrigger id="state" className="col-span-3">
                  <SelectValue placeholder="Select State" />
                </SelectTrigger>
                <SelectContent>
                  {states?.map(state => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isMetro" className="text-right">
                Metro Area
              </Label>
              <Select 
                value={newPincode.isMetro.toString()} 
                onValueChange={(value) => setNewPincode({...newPincode, isMetro: value === 'true'})}
              >
                <SelectTrigger id="isMetro" className="col-span-3">
                  <SelectValue placeholder="Is this a metro area?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isActive" className="text-right">
                Status
              </Label>
              <Select 
                value={newPincode.isActive.toString()} 
                onValueChange={(value) => setNewPincode({...newPincode, isActive: value === 'true'})}
              >
                <SelectTrigger id="isActive" className="col-span-3">
                  <SelectValue placeholder="Set status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAddPincodeOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => addPincodeMutation.mutate()}
              disabled={addPincodeMutation.isPending || !newPincode.code || !newPincode.city || !newPincode.state}
            >
              {addPincodeMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add PIN Code
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Assign Partner Dialog */}
      <Dialog open={isAssignPartnerOpen} onOpenChange={setIsAssignPartnerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Partner to PIN Code</DialogTitle>
            <DialogDescription>
              {selectedPincode && (
                <>
                  Assign a partner to PIN code {selectedPincode.code} in {selectedPincode.city}, {selectedPincode.state}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="partnerId" className="text-right">
                Partner
              </Label>
              <Select 
                value={selectedPartnerId} 
                onValueChange={setSelectedPartnerId}
              >
                <SelectTrigger id="partnerId" className="col-span-3">
                  <SelectValue placeholder="Select Partner" />
                </SelectTrigger>
                <SelectContent>
                  {partners?.map(partner => (
                    <SelectItem key={partner.id.toString()} value={partner.id.toString()}>
                      {partner.name} ({partner.city}, {partner.state})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAssignPartnerOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => assignPartnerMutation.mutate()}
              disabled={assignPartnerMutation.isPending || !selectedPartnerId}
            >
              {assignPartnerMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Assign Partner
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit PIN Code Dialog */}
      <Dialog open={isEditPincodeOpen} onOpenChange={setIsEditPincodeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit PIN Code</DialogTitle>
            <DialogDescription>
              {selectedPincode && (
                <>
                  Update details for PIN code {selectedPincode.code}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPincode && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-code" className="text-right">
                  PIN Code
                </Label>
                <Input
                  id="edit-code"
                  className="col-span-3"
                  value={selectedPincode.code}
                  onChange={(e) => setSelectedPincode({...selectedPincode, code: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-city" className="text-right">
                  City
                </Label>
                <Input
                  id="edit-city"
                  className="col-span-3"
                  value={selectedPincode.city}
                  onChange={(e) => setSelectedPincode({...selectedPincode, city: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-state" className="text-right">
                  State
                </Label>
                <Select 
                  value={selectedPincode.state} 
                  onValueChange={(value) => setSelectedPincode({...selectedPincode, state: value})}
                >
                  <SelectTrigger id="edit-state" className="col-span-3">
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent>
                    {states?.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-isMetro" className="text-right">
                  Metro Area
                </Label>
                <Select 
                  value={selectedPincode.isMetro.toString()} 
                  onValueChange={(value) => setSelectedPincode({...selectedPincode, isMetro: value === 'true'})}
                >
                  <SelectTrigger id="edit-isMetro" className="col-span-3">
                    <SelectValue placeholder="Is this a metro area?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-isActive" className="text-right">
                  Status
                </Label>
                <Select 
                  value={selectedPincode.isActive.toString()} 
                  onValueChange={(value) => setSelectedPincode({...selectedPincode, isActive: value === 'true'})}
                >
                  <SelectTrigger id="edit-isActive" className="col-span-3">
                    <SelectValue placeholder="Set status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditPincodeOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => editPincodeMutation.mutate()}
              disabled={editPincodeMutation.isPending || !selectedPincode?.code || !selectedPincode?.city || !selectedPincode?.state}
            >
              {editPincodeMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <SaveIcon className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PinCodeAssignment;