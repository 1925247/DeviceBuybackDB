import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
import { PlusCircle, Pencil, Trash2, Route, ArrowDown, ArrowUp } from 'lucide-react';
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

interface RouteRule {
  id: number;
  path: string;
  pin_code?: string;
  partner_id?: number;
  region_id?: number;
  priority: number;
  is_active: boolean;
  description?: string;
}

interface Partner {
  id: number;
  name: string;
  logo?: string;
}

interface Region {
  id: number;
  name: string;
  code: string;
}

const RouteManagement: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<RouteRule | null>(null);
  const [formData, setFormData] = useState({
    path: '',
    pin_code: '',
    partner_id: '',
    region_id: '',
    priority: 0,
    is_active: true,
    description: '',
  });
  const { toast } = useToast();

  // Query hooks for fetching data
  const { data: routes, isLoading: isLoadingRoutes } = useQuery<RouteRule[]>({
    queryKey: ['/api/routes'],
    retry: 1,
    onError: () => {
      toast({
        title: 'Error loading routes',
        description: 'There was an error loading the route data.',
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

  const { data: regions, isLoading: isLoadingRegions } = useQuery<Region[]>({
    queryKey: ['/api/regions'],
    retry: 1,
    onError: () => {
      // Silent fail for regions as they might not be set up yet
    }
  });

  // Mutation hooks for creating, updating, and deleting routes
  const createRouteMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest('POST', '/api/routes', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/routes'] });
      setIsAddModalOpen(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Route created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create route',
        variant: 'destructive',
      });
    },
  });

  const updateRouteMutation = useMutation({
    mutationFn: async (data: typeof formData & { id: number }) => {
      return await apiRequest('PUT', `/api/routes/${data.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/routes'] });
      setIsEditModalOpen(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Route updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update route',
        variant: 'destructive',
      });
    },
  });

  const deleteRouteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('DELETE', `/api/routes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/routes'] });
      setIsDeleteModalOpen(false);
      setSelectedRoute(null);
      toast({
        title: 'Success',
        description: 'Route deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete route',
        variant: 'destructive',
      });
    },
  });

  const changePriorityMutation = useMutation({
    mutationFn: async ({ id, direction }: { id: number, direction: 'up' | 'down' }) => {
      return await apiRequest('POST', `/api/routes/${id}/priority`, { direction });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/routes'] });
      toast({
        title: 'Success',
        description: 'Route priority updated',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update priority',
        variant: 'destructive',
      });
    },
  });

  // Helper functions
  const resetForm = () => {
    setFormData({
      path: '',
      pin_code: '',
      partner_id: '',
      region_id: '',
      priority: 0,
      is_active: true,
      description: '',
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseInt(value) }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, is_active: checked }));
  };

  const handleAddRoute = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      partner_id: formData.partner_id ? parseInt(formData.partner_id) : undefined,
      region_id: formData.region_id ? parseInt(formData.region_id) : undefined,
    };
    createRouteMutation.mutate(data);
  };

  const handleEditRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRoute) {
      const data = {
        ...formData,
        id: selectedRoute.id,
        partner_id: formData.partner_id ? parseInt(formData.partner_id) : undefined,
        region_id: formData.region_id ? parseInt(formData.region_id) : undefined,
      };
      updateRouteMutation.mutate(data);
    }
  };

  const handleDeleteRoute = () => {
    if (selectedRoute) {
      deleteRouteMutation.mutate(selectedRoute.id);
    }
  };

  const handleChangePriority = (id: number, direction: 'up' | 'down') => {
    changePriorityMutation.mutate({ id, direction });
  };

  const openEditModal = (route: RouteRule) => {
    setSelectedRoute(route);
    setFormData({
      path: route.path,
      pin_code: route.pin_code || '',
      partner_id: route.partner_id ? route.partner_id.toString() : '',
      region_id: route.region_id ? route.region_id.toString() : '',
      priority: route.priority,
      is_active: route.is_active,
      description: route.description || '',
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (route: RouteRule) => {
    setSelectedRoute(route);
    setIsDeleteModalOpen(true);
  };

  // Loading state
  if (isLoadingRoutes || isLoadingPartners || isLoadingRegions) {
    return (
      <div className="py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Route Management</h1>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // Modal render functions (defined before they're used)
  const renderAddModal = () => (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Add New Route</DialogTitle>
        <DialogDescription>
          Create a new routing rule to direct customer requests.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleAddRoute} className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="path">Path Pattern</Label>
          <Input
            id="path"
            name="path"
            value={formData.path}
            onChange={handleInputChange}
            placeholder="e.g., /sell/:deviceType"
            required
          />
          <p className="text-xs text-gray-500">
            URL pattern to match for this route. Use :param for variables.
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="pin_code">PIN Code (Optional)</Label>
          <Input
            id="pin_code"
            name="pin_code"
            value={formData.pin_code}
            onChange={handleInputChange}
            placeholder="e.g., 12345"
          />
          <p className="text-xs text-gray-500">
            Optional PIN code for partner identification.
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="partner_id">Partner (Optional)</Label>
          <Select 
            value={formData.partner_id} 
            onValueChange={(value) => handleSelectChange('partner_id', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select partner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {partners?.map((partner) => (
                <SelectItem key={partner.id} value={partner.id.toString()}>
                  {partner.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="region_id">Region (Optional)</Label>
          <Select 
            value={formData.region_id} 
            onValueChange={(value) => handleSelectChange('region_id', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {regions?.map((region) => (
                <SelectItem key={region.id} value={region.id.toString()}>
                  {region.name} ({region.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Input
            id="priority"
            name="priority"
            type="number"
            min="0"
            value={formData.priority}
            onChange={handleNumberInputChange}
            required
          />
          <p className="text-xs text-gray-500">
            Higher priority routes are matched first. 0 is lowest priority.
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Input
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Brief description of this route's purpose"
          />
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
          <Button type="submit" disabled={createRouteMutation.isPending}>
            {createRouteMutation.isPending ? 'Creating...' : 'Create Route'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );

  // Error or empty state
  if (!routes || routes.length === 0) {
    return (
      <div className="py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Route Management</h1>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="mb-4 flex items-center gap-2">
                <PlusCircle size={16} />
                Add New Route
              </Button>
            </DialogTrigger>
            {renderAddModal()}
          </Dialog>
        </div>
        <div className="bg-amber-50 p-6 rounded-lg border border-amber-200 mb-8">
          <h3 className="text-lg font-medium text-amber-800 mb-2">No Routes Available</h3>
          <p className="text-amber-700 mb-4">
            You haven't set up any routes yet. Routes determine how customer requests are directed to partners and regions.
          </p>
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2"
          >
            <PlusCircle size={16} />
            Create Your First Route
          </Button>
        </div>
      </div>
    );
  }

  const getPartnerName = (partnerId?: number) => {
    if (!partnerId || !partners) return 'N/A';
    const partner = partners.find(p => p.id === partnerId);
    return partner ? partner.name : 'Unknown Partner';
  };

  const getRegionName = (regionId?: number) => {
    if (!regionId || !regions) return 'N/A';
    const region = regions.find(r => r.id === regionId);
    return region ? region.name : 'Unknown Region';
  };

  // renderAddModal already defined above

  const renderEditModal = () => (
    <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Route</DialogTitle>
          <DialogDescription>
            Update the route's details and settings.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleEditRoute} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-path">Path Pattern</Label>
            <Input
              id="edit-path"
              name="path"
              value={formData.path}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-pin_code">PIN Code</Label>
            <Input
              id="edit-pin_code"
              name="pin_code"
              value={formData.pin_code}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-partner_id">Partner</Label>
            <Select 
              value={formData.partner_id} 
              onValueChange={(value) => handleSelectChange('partner_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select partner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {partners?.map((partner) => (
                  <SelectItem key={partner.id} value={partner.id.toString()}>
                    {partner.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-region_id">Region</Label>
            <Select 
              value={formData.region_id} 
              onValueChange={(value) => handleSelectChange('region_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {regions?.map((region) => (
                  <SelectItem key={region.id} value={region.id.toString()}>
                    {region.name} ({region.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-priority">Priority</Label>
            <Input
              id="edit-priority"
              name="priority"
              type="number"
              min="0"
              value={formData.priority}
              onChange={handleNumberInputChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Input
              id="edit-description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
            />
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
            <Button type="submit" disabled={updateRouteMutation.isPending}>
              {updateRouteMutation.isPending ? 'Updating...' : 'Update Route'}
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
          <DialogTitle>Delete Route</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this route? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="font-medium">
            Path: {selectedRoute?.path}
          </p>
          {selectedRoute?.description && (
            <p className="text-gray-500 mt-1">
              {selectedRoute.description}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDeleteRoute}
            disabled={deleteRouteMutation.isPending}
          >
            {deleteRouteMutation.isPending ? 'Deleting...' : 'Delete Route'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Route Management</h1>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="mb-4 flex items-center gap-2">
              <PlusCircle size={16} />
              Add New Route
            </Button>
          </DialogTrigger>
          {renderAddModal()}
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Routing Rules</CardTitle>
          <CardDescription>
            Manage routing rules for directing customer requests to partners and regions.
            Higher priority routes are matched first.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Priority</TableHead>
                <TableHead>Path Pattern</TableHead>
                <TableHead>PIN Code</TableHead>
                <TableHead>Partner</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {routes.sort((a, b) => b.priority - a.priority).map((route) => (
                <TableRow key={route.id}>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <span className="font-mono">{route.priority}</span>
                      <div className="flex flex-col">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5"
                          onClick={() => handleChangePriority(route.id, 'up')}
                        >
                          <ArrowUp size={14} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5"
                          onClick={() => handleChangePriority(route.id, 'down')}
                        >
                          <ArrowDown size={14} />
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Route size={16} className="text-gray-500" />
                      {route.path}
                    </div>
                  </TableCell>
                  <TableCell>{route.pin_code || '—'}</TableCell>
                  <TableCell>{getPartnerName(route.partner_id)}</TableCell>
                  <TableCell>{getRegionName(route.region_id)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${route.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {route.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => openEditModal(route)}
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="icon"
                        onClick={() => openDeleteModal(route)}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Render modals */}
      {renderEditModal()}
      {renderDeleteModal()}
    </div>
  );
};

export default RouteManagement;