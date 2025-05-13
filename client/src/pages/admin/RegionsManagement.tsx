import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { PlusCircle, Pencil, Trash2, ChevronDown, MapPin } from 'lucide-react';
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';

interface Region {
  id: number;
  name: string;
  code: string;
  is_active: boolean;
  description?: string;
  tax_rate?: number;
  currency_code: string;
  shipping_zones?: string[];
  created_at: string;
  updated_at: string;
}

interface Partner {
  id: number;
  name: string;
  email: string;
  logo?: string;
  is_active: boolean;
  region_ids: number[];
}

interface PartnerWithRegions extends Partner {
  regions: Region[];
}

const RegionsManagement: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPartnerAssignModalOpen, setIsPartnerAssignModalOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    is_active: true,
    description: '',
    tax_rate: 0,
    currency_code: 'USD',
    shipping_zones: [],
  });
  const { toast } = useToast();

  // Query hooks for fetching data
  const { data: regions, isLoading: isLoadingRegions } = useQuery<Region[]>({
    queryKey: ['/api/regions'],
    retry: 1,
    onError: () => {
      toast({
        title: 'Error loading regions',
        description: 'There was an error loading the regions data.',
        variant: 'destructive',
      });
    }
  });

  const { data: partners, isLoading: isLoadingPartners } = useQuery<Partner[]>({
    queryKey: ['/api/partners'],
    retry: 1,
    onError: () => {
      // Silent fail for partners as they might not be set up yet
    }
  });

  // Partner data with region info
  const partnersWithRegions = React.useMemo(() => {
    if (!partners || !regions) return [];
    
    return partners.map(partner => {
      const partnerRegions = regions.filter(region => 
        partner.region_ids.includes(region.id)
      );
      
      return {
        ...partner,
        regions: partnerRegions,
      };
    });
  }, [partners, regions]);

  // Mutation hooks for creating, updating, and deleting regions
  const createRegionMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest('POST', '/api/regions', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/regions'] });
      setIsAddModalOpen(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Region created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create region',
        variant: 'destructive',
      });
    },
  });

  const updateRegionMutation = useMutation({
    mutationFn: async (data: typeof formData & { id: number }) => {
      return await apiRequest('PUT', `/api/regions/${data.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/regions'] });
      setIsEditModalOpen(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Region updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update region',
        variant: 'destructive',
      });
    },
  });

  const deleteRegionMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('DELETE', `/api/regions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/regions'] });
      setIsDeleteModalOpen(false);
      setSelectedRegion(null);
      toast({
        title: 'Success',
        description: 'Region deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete region',
        variant: 'destructive',
      });
    },
  });

  // Helper functions
  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      is_active: true,
      description: '',
      tax_rate: 0,
      currency_code: 'USD',
      shipping_zones: [],
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: parseFloat(value) }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, is_active: checked }));
  };

  const handleAddRegion = (e: React.FormEvent) => {
    e.preventDefault();
    createRegionMutation.mutate(formData);
  };

  const handleEditRegion = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRegion) {
      updateRegionMutation.mutate({ ...formData, id: selectedRegion.id });
    }
  };

  const handleDeleteRegion = () => {
    if (selectedRegion) {
      deleteRegionMutation.mutate(selectedRegion.id);
    }
  };

  const openEditModal = (region: Region) => {
    setSelectedRegion(region);
    setFormData({
      name: region.name,
      code: region.code,
      is_active: region.is_active,
      description: region.description || '',
      tax_rate: region.tax_rate || 0,
      currency_code: region.currency_code,
      shipping_zones: region.shipping_zones || [],
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (region: Region) => {
    setSelectedRegion(region);
    setIsDeleteModalOpen(true);
  };

  const openPartnerAssignModal = (region: Region) => {
    setSelectedRegion(region);
    setIsPartnerAssignModalOpen(true);
  };

  // Loading state
  if (isLoadingRegions) {
    return (
      <div className="py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Region Management</h1>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // Error or empty state
  if (!regions) {
    return (
      <div className="py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Region Management</h1>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="mb-4 flex items-center gap-2">
                <PlusCircle size={16} />
                Add New Region
              </Button>
            </DialogTrigger>
            {renderAddModal()}
          </Dialog>
        </div>
        <div className="bg-amber-50 p-6 rounded-lg border border-amber-200 mb-8">
          <h3 className="text-lg font-medium text-amber-800 mb-2">No Regions Available</h3>
          <p className="text-amber-700 mb-4">
            You haven't set up any geographical regions yet. Regions are essential for configuring region-specific 
            pricing, tax rates, and partner assignments.
          </p>
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2"
          >
            <PlusCircle size={16} />
            Create Your First Region
          </Button>
        </div>
      </div>
    );
  }

  const renderAddModal = () => (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Add New Region</DialogTitle>
        <DialogDescription>
          Create a new geographical region for setting pricing, taxes, 
          and partner assignments.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleAddRegion} className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="name">Region Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., North America, Europe, Asia"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="code">Region Code</Label>
          <Input
            id="code"
            name="code"
            value={formData.code}
            onChange={handleInputChange}
            placeholder="e.g., NA, EU, AS"
            required
          />
          <p className="text-xs text-gray-500">
            A unique code to identify this region in your system.
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Brief description of this region"
            rows={3}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tax_rate">Tax Rate (%)</Label>
            <Input
              id="tax_rate"
              name="tax_rate"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={formData.tax_rate}
              onChange={handleNumberInputChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="currency_code">Currency</Label>
            <Select 
              value={formData.currency_code} 
              onValueChange={(value) => handleSelectChange('currency_code', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
                <SelectItem value="JPY">JPY (¥)</SelectItem>
                <SelectItem value="CAD">CAD ($)</SelectItem>
                <SelectItem value="AUD">AUD ($)</SelectItem>
                <SelectItem value="INR">INR (₹)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            checked={formData.is_active}
            onCheckedChange={handleSwitchChange}
            id="is_active"
          />
          <Label htmlFor="is_active">Active</Label>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={createRegionMutation.isPending}>
            {createRegionMutation.isPending ? 'Creating...' : 'Create Region'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );

  const renderEditModal = () => (
    <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Region</DialogTitle>
          <DialogDescription>
            Update the region's details and settings.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleEditRegion} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Region Name</Label>
            <Input
              id="edit-name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-code">Region Code</Label>
            <Input
              id="edit-code"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-tax_rate">Tax Rate (%)</Label>
              <Input
                id="edit-tax_rate"
                name="tax_rate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.tax_rate}
                onChange={handleNumberInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-currency_code">Currency</Label>
              <Select 
                value={formData.currency_code} 
                onValueChange={(value) => handleSelectChange('currency_code', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="JPY">JPY (¥)</SelectItem>
                  <SelectItem value="CAD">CAD ($)</SelectItem>
                  <SelectItem value="AUD">AUD ($)</SelectItem>
                  <SelectItem value="INR">INR (₹)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.is_active}
              onCheckedChange={handleSwitchChange}
              id="edit-is_active"
            />
            <Label htmlFor="edit-is_active">Active</Label>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateRegionMutation.isPending}>
              {updateRegionMutation.isPending ? 'Updating...' : 'Update Region'}
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
          <DialogTitle>Delete Region</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this region? This action cannot be undone and may affect products, 
            partners, and pricing associated with this region.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="font-medium">
            Region: {selectedRegion?.name} ({selectedRegion?.code})
          </p>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDeleteRegion}
            disabled={deleteRegionMutation.isPending}
          >
            {deleteRegionMutation.isPending ? 'Deleting...' : 'Delete Region'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const renderPartnerAssignModal = () => (
    <Dialog open={isPartnerAssignModalOpen} onOpenChange={setIsPartnerAssignModalOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign Partners to {selectedRegion?.name}</DialogTitle>
          <DialogDescription>
            Select which partners should operate in this region.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {/* Partner assignment controls would go here */}
          <p className="text-sm text-gray-600 mb-4">
            This feature will be implemented soon. It will allow you to assign multiple partners to this region.
          </p>
        </div>
        <DialogFooter>
          <Button type="button" onClick={() => setIsPartnerAssignModalOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Region Management</h1>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="mb-4 flex items-center gap-2">
              <PlusCircle size={16} />
              Add New Region
            </Button>
          </DialogTrigger>
          {renderAddModal()}
        </Dialog>
      </div>

      <Tabs defaultValue="regions" className="mb-8">
        <TabsList>
          <TabsTrigger value="regions">Regions</TabsTrigger>
          <TabsTrigger value="partners">Partners by Region</TabsTrigger>
        </TabsList>
        
        <TabsContent value="regions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Geographical Regions</CardTitle>
              <CardDescription>
                Manage regions for region-specific pricing, tax rates, and partner assignments.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Tax Rate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {regions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No regions found. Add your first region using the button above.
                      </TableCell>
                    </TableRow>
                  ) : (
                    regions.map((region) => (
                      <TableRow key={region.id}>
                        <TableCell className="font-medium">{region.name}</TableCell>
                        <TableCell>{region.code}</TableCell>
                        <TableCell>{region.currency_code}</TableCell>
                        <TableCell>{region.tax_rate ? `${region.tax_rate}%` : 'N/A'}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${region.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                            {region.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => openEditModal(region)}
                              title="Edit"
                            >
                              <Pencil size={16} />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => openPartnerAssignModal(region)}
                              title="Assign Partners"
                            >
                              <MapPin size={16} />
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="icon"
                              onClick={() => openDeleteModal(region)}
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
        
        <TabsContent value="partners" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Partners by Region</CardTitle>
              <CardDescription>
                View which partners are assigned to each region.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!partners || partners.length === 0 ? (
                <div className="py-4 text-center text-gray-500">
                  No partners have been created yet.
                </div>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {partnersWithRegions.map((partner) => (
                    <AccordionItem key={partner.id} value={`partner-${partner.id}`}>
                      <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
                        <div className="flex items-center gap-2">
                          {partner.logo && (
                            <img 
                              src={partner.logo} 
                              alt={partner.name} 
                              className="w-6 h-6 rounded-full object-contain" 
                            />
                          )}
                          <span className="font-medium">{partner.name}</span>
                          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${partner.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                            {partner.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Contact: {partner.email}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Assigned Regions:</h4>
                            {partner.regions.length === 0 ? (
                              <p className="text-sm text-gray-500">No regions assigned.</p>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {partner.regions.map((region) => (
                                  <span 
                                    key={region.id}
                                    className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full"
                                  >
                                    {region.name} ({region.code})
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Render modals */}
      {renderEditModal()}
      {renderDeleteModal()}
      {renderPartnerAssignModal()}
    </div>
  );
};

export default RegionsManagement;