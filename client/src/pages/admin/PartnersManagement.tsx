import React, { useState, useEffect } from 'react';
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
import { PlusCircle, Pencil, Trash2, CheckCircle, ExternalLink, Building, Map, MapPin } from 'lucide-react';
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
  CardFooter,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';

interface Partner {
  id: number;
  name: string;
  email: string;
  logo?: string;
  contact_person?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  region_ids?: number[];
  active?: boolean;
  created_at: string;
  updated_at: string;
}

interface Region {
  id: number;
  name: string;
  code: string;
}

const PartnersManagement: React.FC = () => {
  // State for partners
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isShowDetailsOpen, setIsShowDetailsOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    logo: '',
    contact_person: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    region_ids: [] as number[],
    active: true,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  const { toast } = useToast();

  // Query partners
  const { data: partners, isLoading: isLoadingPartners } = useQuery<Partner[]>({
    queryKey: ['/api/partners'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/partners');
      return response.json();
    },
  });

  // Query regions
  const { data: regions, isLoading: isLoadingRegions } = useQuery<Region[]>({
    queryKey: ['/api/regions'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/regions');
      return response.json();
    },
    retry: 1,
  });

  // Create mutation
  const createPartnerMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest('POST', '/api/partners', data).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/partners'] });
      setIsAddModalOpen(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Partner created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create partner',
        variant: 'destructive',
      });
    },
  });

  // Update mutation
  const updatePartnerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<typeof formData> }) => {
      return apiRequest('PUT', `/api/partners/${id}`, data).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/partners'] });
      setIsEditModalOpen(false);
      setSelectedPartner(null);
      resetForm();
      toast({
        title: 'Success',
        description: 'Partner updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update partner',
        variant: 'destructive',
      });
    },
  });

  // Delete mutation
  const deletePartnerMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/partners/${id}`).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/partners'] });
      setIsDeleteModalOpen(false);
      setSelectedPartner(null);
      toast({
        title: 'Success',
        description: 'Partner deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete partner',
        variant: 'destructive',
      });
    },
  });

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      logo: '',
      contact_person: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      country: '',
      postal_code: '',
      region_ids: [],
      active: true,
    });
  };

  // Handle create form submit
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createPartnerMutation.mutate(formData);
  };

  // Handle update form submit
  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPartner) {
      updatePartnerMutation.mutate({ id: selectedPartner.id, data: formData });
    }
  };

  // Handle delete
  const handleDelete = () => {
    if (selectedPartner) {
      deletePartnerMutation.mutate(selectedPartner.id);
    }
  };

  // Handle edit click
  const handleEditClick = (partner: Partner) => {
    setSelectedPartner(partner);
    setFormData({
      name: partner.name || '',
      email: partner.email || '',
      logo: partner.logo || '',
      contact_person: partner.contact_person || '',
      phone: partner.phone || '',
      address: partner.address || '',
      city: partner.city || '',
      state: partner.state || '',
      country: partner.country || '',
      postal_code: partner.postal_code || '',
      region_ids: partner.region_ids || [],
      active: partner.active !== undefined ? partner.active : true,
    });
    setIsEditModalOpen(true);
  };

  // Handle delete click
  const handleDeleteClick = (partner: Partner) => {
    setSelectedPartner(partner);
    setIsDeleteModalOpen(true);
  };

  // Handle details click
  const handleDetailsClick = (partner: Partner) => {
    setSelectedPartner(partner);
    setIsShowDetailsOpen(true);
  };

  // Handle form change
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle checkbox change
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  // Handle region selection
  const handleRegionChange = (regionId: number) => {
    setFormData(prev => {
      const currentRegions = [...prev.region_ids];
      if (currentRegions.includes(regionId)) {
        return {
          ...prev,
          region_ids: currentRegions.filter(id => id !== regionId),
        };
      } else {
        return {
          ...prev,
          region_ids: [...currentRegions, regionId],
        };
      }
    });
  };

  // Filter partners by search query and tab
  const filteredPartners = partners?.filter(partner => {
    const matchesSearch = !searchQuery || 
      partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = 
      selectedTab === 'all' || 
      (selectedTab === 'active' && partner.active) || 
      (selectedTab === 'inactive' && !partner.active);
    
    return matchesSearch && matchesTab;
  });

  // Get region name by id
  const getRegionName = (regionId: number) => {
    return regions?.find(region => region.id === regionId)?.name || 'Unknown';
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Partner Management</h1>
        <Button
          onClick={() => {
            resetForm();
            setIsAddModalOpen(true);
          }}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Add Partner
        </Button>
      </div>

      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <Input
              placeholder="Search partners..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <Tabs
            value={selectedTab}
            onValueChange={setSelectedTab}
            className="w-full md:w-auto"
          >
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Regions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingPartners ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                      <span className="ml-2">Loading partners...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredPartners?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No partners found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPartners?.map((partner) => (
                  <TableRow key={partner.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        {partner.logo ? (
                          <img
                            src={partner.logo}
                            alt={partner.name}
                            className="w-8 h-8 mr-2 rounded-full object-cover"
                          />
                        ) : (
                          <Building className="w-5 h-5 mr-2 text-gray-400" />
                        )}
                        {partner.name}
                      </div>
                    </TableCell>
                    <TableCell>{partner.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {partner.region_ids && partner.region_ids.length > 0 ? (
                          partner.region_ids.map(regionId => (
                            <Badge key={regionId} variant="outline" className="flex items-center">
                              <Map className="w-3 h-3 mr-1" />
                              {getRegionName(regionId)}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-gray-400 text-sm">No regions assigned</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {partner.active ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500">
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-2">
                        <Button
                          onClick={() => handleDetailsClick(partner)}
                          size="icon"
                          variant="ghost"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleEditClick(partner)}
                          size="icon"
                          variant="ghost"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteClick(partner)}
                          size="icon"
                          variant="ghost"
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Add Partner Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Partner</DialogTitle>
            <DialogDescription>
              Add a new partner to the system. They will be able to receive buyback requests based on region allocation.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Partner Name <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter partner name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo">Logo URL</Label>
                <Input
                  id="logo"
                  name="logo"
                  placeholder="Enter logo URL"
                  value={formData.logo}
                  onChange={handleFormChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_person">Contact Person</Label>
                <Input
                  id="contact_person"
                  name="contact_person"
                  placeholder="Enter contact person name"
                  value={formData.contact_person}
                  onChange={handleFormChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={handleFormChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="Enter address"
                  value={formData.address}
                  onChange={handleFormChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  placeholder="Enter city"
                  value={formData.city}
                  onChange={handleFormChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  name="state"
                  placeholder="Enter state or province"
                  value={formData.state}
                  onChange={handleFormChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  name="country"
                  placeholder="Enter country"
                  value={formData.country}
                  onChange={handleFormChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postal_code">Postal Code</Label>
                <Input
                  id="postal_code"
                  name="postal_code"
                  placeholder="Enter postal code"
                  value={formData.postal_code}
                  onChange={handleFormChange}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Regions</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {isLoadingRegions ? (
                    <div className="col-span-3 py-2">Loading regions...</div>
                  ) : regions && regions.length > 0 ? (
                    regions.map(region => (
                      <div key={region.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`region-${region.id}`}
                          checked={formData.region_ids.includes(region.id)}
                          onCheckedChange={() => handleRegionChange(region.id)}
                        />
                        <label
                          htmlFor={`region-${region.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {region.name}
                        </label>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 py-2 text-gray-500">
                      No regions available. Please create regions first.
                    </div>
                  )}
                </div>
              </div>
              <div className="col-span-2 space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="active"
                    name="active"
                    checked={formData.active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: !!checked }))}
                  />
                  <label
                    htmlFor="active"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Active
                  </label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  setIsAddModalOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                disabled={createPartnerMutation.isPending}
              >
                {createPartnerMutation.isPending ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Creating...
                  </>
                ) : (
                  'Create Partner'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Partner Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Partner</DialogTitle>
            <DialogDescription>
              Update partner information and region allocations.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Partner Name <span className="text-red-500">*</span></Label>
                <Input
                  id="edit-name"
                  name="name"
                  placeholder="Enter partner name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email Address <span className="text-red-500">*</span></Label>
                <Input
                  id="edit-email"
                  name="email"
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-logo">Logo URL</Label>
                <Input
                  id="edit-logo"
                  name="logo"
                  placeholder="Enter logo URL"
                  value={formData.logo}
                  onChange={handleFormChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-contact_person">Contact Person</Label>
                <Input
                  id="edit-contact_person"
                  name="contact_person"
                  placeholder="Enter contact person name"
                  value={formData.contact_person}
                  onChange={handleFormChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input
                  id="edit-phone"
                  name="phone"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={handleFormChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address">Address</Label>
                <Input
                  id="edit-address"
                  name="address"
                  placeholder="Enter address"
                  value={formData.address}
                  onChange={handleFormChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-city">City</Label>
                <Input
                  id="edit-city"
                  name="city"
                  placeholder="Enter city"
                  value={formData.city}
                  onChange={handleFormChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-state">State/Province</Label>
                <Input
                  id="edit-state"
                  name="state"
                  placeholder="Enter state or province"
                  value={formData.state}
                  onChange={handleFormChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-country">Country</Label>
                <Input
                  id="edit-country"
                  name="country"
                  placeholder="Enter country"
                  value={formData.country}
                  onChange={handleFormChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-postal_code">Postal Code</Label>
                <Input
                  id="edit-postal_code"
                  name="postal_code"
                  placeholder="Enter postal code"
                  value={formData.postal_code}
                  onChange={handleFormChange}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Regions</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {isLoadingRegions ? (
                    <div className="col-span-3 py-2">Loading regions...</div>
                  ) : regions && regions.length > 0 ? (
                    regions.map(region => (
                      <div key={region.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-region-${region.id}`}
                          checked={formData.region_ids.includes(region.id)}
                          onCheckedChange={() => handleRegionChange(region.id)}
                        />
                        <label
                          htmlFor={`edit-region-${region.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {region.name}
                        </label>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 py-2 text-gray-500">
                      No regions available. Please create regions first.
                    </div>
                  )}
                </div>
              </div>
              <div className="col-span-2 space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-active"
                    name="active"
                    checked={formData.active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: !!checked }))}
                  />
                  <label
                    htmlFor="edit-active"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Active
                  </label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedPartner(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                disabled={updatePartnerMutation.isPending}
              >
                {updatePartnerMutation.isPending ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Updating...
                  </>
                ) : (
                  'Update Partner'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete partner "{selectedPartner?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedPartner(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deletePartnerMutation.isPending}
            >
              {deletePartnerMutation.isPending ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Deleting...
                </>
              ) : (
                'Delete Partner'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Partner Details Modal */}
      <Dialog open={isShowDetailsOpen} onOpenChange={setIsShowDetailsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Partner Details</DialogTitle>
          </DialogHeader>
          {selectedPartner && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                {selectedPartner.logo ? (
                  <img
                    src={selectedPartner.logo}
                    alt={selectedPartner.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Building className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-medium">{selectedPartner.name}</h3>
                  <p className="text-sm text-gray-500">{selectedPartner.email}</p>
                  <Badge className={selectedPartner.active ? "bg-green-100 text-green-800 mt-1" : "bg-gray-100 text-gray-800 mt-1"}>
                    {selectedPartner.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Contact Person</h4>
                  <p className="text-sm">{selectedPartner.contact_person || 'Not specified'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Phone</h4>
                  <p className="text-sm">{selectedPartner.phone || 'Not specified'}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Address</h4>
                <p className="text-sm">
                  {[
                    selectedPartner.address,
                    selectedPartner.city,
                    selectedPartner.state,
                    selectedPartner.postal_code,
                    selectedPartner.country,
                  ]
                    .filter(Boolean)
                    .join(', ') || 'No address specified'}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Assigned Regions</h4>
                {selectedPartner.region_ids && selectedPartner.region_ids.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedPartner.region_ids.map(regionId => (
                      <Badge key={regionId} className="flex items-center gap-1 py-1 px-2">
                        <MapPin className="w-3 h-3" />
                        {getRegionName(regionId)}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No regions assigned</p>
                )}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>ID: {selectedPartner.id}</span>
                  <span>
                    Created: {new Date(selectedPartner.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsShowDetailsOpen(false);
                setSelectedPartner(null);
              }}
            >
              Close
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (selectedPartner) {
                  setIsShowDetailsOpen(false);
                  handleEditClick(selectedPartner);
                }
              }}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
            >
              <Pencil className="mr-2 h-4 w-4" /> Edit Partner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PartnersManagement;