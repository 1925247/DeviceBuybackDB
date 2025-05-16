import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
import { PlusCircle, Pencil, Trash2, Plus, X } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FileUpload from '@/components/ui/file-upload';
import {
  ScrollArea,
  ScrollBar,
} from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface DeviceType {
  id: number;
  name: string;
  slug: string;
  icon: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface Brand {
  id: number;
  name: string;
  slug: string;
  logo: string;
}

interface BrandDeviceType {
  id: number;
  brand_id: number;
  device_type_id: number;
  brand_name: string;
  device_type_name: string;
  created_at: string;
  updated_at: string;
}

const AdminDeviceTypes: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDeviceType, setSelectedDeviceType] = useState<DeviceType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon: '',
    active: true,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAssignBrandsModalOpen, setIsAssignBrandsModalOpen] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState<number[]>([]);
  const { toast } = useToast();

  // Query hooks for fetching data
  const { data: deviceTypes, isLoading: isLoadingDeviceTypes } = useQuery<DeviceType[]>({
    queryKey: ['/api/device-types'],
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: 1000,
  });

  const { data: brands, isLoading: isLoadingBrands } = useQuery<Brand[]>({
    queryKey: ['/api/brands'],
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: 1000,
  });

  const { data: brandDeviceTypes, isLoading: isLoadingBrandDeviceTypes } = useQuery<BrandDeviceType[]>({
    queryKey: ['/api/brand-device-types'],
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: 1000,
    refetchOnWindowFocus: false
  });

  // When assigning brands, we want to pre-select the ones that are already assigned
  useEffect(() => {
    if (selectedDeviceType && brandDeviceTypes) {
      const assignedBrands = brandDeviceTypes
        .filter(relation => relation.device_type_id === selectedDeviceType.id)
        .map(relation => relation.brand_id);
      setSelectedBrands(assignedBrands);
    } else if (selectedDeviceType) {
      // Reset to empty array if no brand-device relationships found
      setSelectedBrands([]);
    }
  }, [selectedDeviceType, brandDeviceTypes]);

  // Mutation hooks
  const createDeviceTypeMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest('POST', '/api/device-types', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/device-types'] });
      setIsAddModalOpen(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Device type created successfully',
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

  const updateDeviceTypeMutation = useMutation({
    mutationFn: async (data: typeof formData & { id: number }) => {
      return apiRequest('PUT', `/api/device-types/${data.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/device-types'] });
      setIsEditModalOpen(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Device type updated successfully',
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

  const deleteDeviceTypeMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/device-types/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/device-types'] });
      setIsDeleteModalOpen(false);
      setSelectedDeviceType(null);
      toast({
        title: 'Success',
        description: 'Device type deleted successfully',
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

  const createBrandDeviceTypeMutation = useMutation({
    mutationFn: async (data: { brand_id: number; device_type_id: number }) => {
      return apiRequest('POST', '/api/brand-device-types', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/brand-device-types'] });
      toast({
        title: 'Success',
        description: 'Brand associated with device type successfully',
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

  const deleteBrandDeviceTypeMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/brand-device-types/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/brand-device-types'] });
      toast({
        title: 'Success',
        description: 'Brand removed from device type successfully',
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

  // Upload icon mutation
  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload image');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      setFormData(prev => ({ ...prev, icon: data.url }));
      toast({
        title: 'Success',
        description: 'Icon uploaded successfully',
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
  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      icon: '',
      active: true,
    });
    setSelectedFile(null);
  };
  
  const handleFileUpload = (file: File) => {
    setSelectedFile(file);
    uploadImageMutation.mutate(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleAddDeviceType = (e: React.FormEvent) => {
    e.preventDefault();
    createDeviceTypeMutation.mutate(formData);
  };

  const handleEditDeviceType = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDeviceType) {
      updateDeviceTypeMutation.mutate({ ...formData, id: selectedDeviceType.id });
    }
  };

  const handleDeleteDeviceType = () => {
    if (selectedDeviceType) {
      deleteDeviceTypeMutation.mutate(selectedDeviceType.id);
    }
  };

  const openEditModal = (deviceType: DeviceType) => {
    setSelectedDeviceType(deviceType);
    setFormData({
      name: deviceType.name,
      slug: deviceType.slug,
      icon: deviceType.icon || '',
      active: deviceType.active,
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (deviceType: DeviceType) => {
    setSelectedDeviceType(deviceType);
    setIsDeleteModalOpen(true);
  };

  const openAssignBrandsModal = (deviceType: DeviceType) => {
    setSelectedDeviceType(deviceType);
    setIsAssignBrandsModalOpen(true);
  };

  const handleAssignBrand = (brandId: number) => {
    if (selectedDeviceType) {
      createBrandDeviceTypeMutation.mutate({
        brand_id: brandId,
        device_type_id: selectedDeviceType.id
      });
    }
  };

  const handleRemoveBrand = (relationId: number) => {
    deleteBrandDeviceTypeMutation.mutate(relationId);
  };

  const toggleBrandSelection = (brandId: number) => {
    setSelectedBrands(prev => {
      if (prev.includes(brandId)) {
        return prev.filter(id => id !== brandId);
      } else {
        return [...prev, brandId];
      }
    });
  };

  const saveSelectedBrands = () => {
    if (!selectedDeviceType) return;
    
    // Use safe defaults if brandDeviceTypes is undefined
    const safeDisplayBrandDeviceTypes = displayBrandDeviceTypes || [];
    
    // Get current relations for this device type
    const currentRelations = safeDisplayBrandDeviceTypes.filter(
      relation => relation.device_type_id === selectedDeviceType.id
    );
    
    // Brands to remove - they exist in current relations but not in selectedBrands
    const brandsToRemove = currentRelations.filter(
      relation => !selectedBrands.includes(relation.brand_id)
    );
    
    // Brands to add - they exist in selectedBrands but not in current relations
    const currentBrandIds = currentRelations.map(relation => relation.brand_id);
    const brandsToAdd = selectedBrands.filter(
      brandId => !currentBrandIds.includes(brandId)
    );
    
    // Remove first, then add
    Promise.all(
      brandsToRemove.map(relation => 
        deleteBrandDeviceTypeMutation.mutateAsync(relation.id)
      )
    ).then(() => {
      return Promise.all(
        brandsToAdd.map(brandId => 
          createBrandDeviceTypeMutation.mutateAsync({
            brand_id: brandId,
            device_type_id: selectedDeviceType.id
          })
        )
      );
    }).then(() => {
      setIsAssignBrandsModalOpen(false);
      toast({
        title: 'Success',
        description: 'Brand assignments updated successfully',
      });
    }).catch(error => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    });
  };

  // Loading state
  if (isLoadingDeviceTypes || isLoadingBrands || isLoadingBrandDeviceTypes) {
    return (
      <div className="py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Device Type Management</h1>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // Use sample data if the real data fails to load
  const displayDeviceTypes = deviceTypes || [
    {
      id: 1,
      name: "Smartphone",
      slug: "smartphones",
      icon: "smartphone",
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      name: "Laptop",
      slug: "laptops",
      icon: "laptop",
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 3,
      name: "Tablet",
      slug: "tablets",
      icon: "tablet",
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 4,
      name: "Smartwatch",
      slug: "smartwatches",
      icon: "watch",
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
  
  const displayBrands = brands || [];
  const displayBrandDeviceTypes = brandDeviceTypes || [];

  // Render functions
  const renderAddModal = () => (
    <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
      <DialogTrigger asChild>
        <Button className="mb-4 flex items-center gap-2">
          <PlusCircle size={16} />
          Add New Device Type
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Device Type</DialogTitle>
          <DialogDescription>
            Create a new device type for your catalog.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleAddDeviceType} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Device Type Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              required
            />
            <p className="text-xs text-gray-500">
              Used in URLs. Should be lowercase with hyphens instead of spaces.
            </p>
          </div>
          
          <div className="space-y-2">
            <FileUpload
              onFileChange={handleFileUpload}
              onUrlChange={(url) => setFormData((prev) => ({ ...prev, icon: url }))}
              initialUrl={formData.icon}
              label="Icon"
              description="Upload an icon or enter a URL (recommended size: 64x64px)"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="active"
              name="active"
              checked={formData.active}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, active: checked === true }))
              }
            />
            <Label htmlFor="active">Active</Label>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createDeviceTypeMutation.isPending}>
              {createDeviceTypeMutation.isPending ? 'Creating...' : 'Create Device Type'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  const renderEditModal = () => (
    <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Device Type</DialogTitle>
          <DialogDescription>
            Update the details of your device type.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleEditDeviceType} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Device Type Name</Label>
            <Input
              id="edit-name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-slug">Slug</Label>
            <Input
              id="edit-slug"
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              required
            />
            <p className="text-xs text-gray-500">
              Used in URLs. Should be lowercase with hyphens instead of spaces.
            </p>
          </div>
          
          <div className="space-y-2">
            <FileUpload
              onFileChange={handleFileUpload}
              onUrlChange={(url) => setFormData((prev) => ({ ...prev, icon: url }))}
              initialUrl={formData.icon}
              label="Icon"
              description="Upload an icon or enter a URL (recommended size: 64x64px)"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="edit-active"
              name="active"
              checked={formData.active}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, active: checked === true }))
              }
            />
            <Label htmlFor="edit-active">Active</Label>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateDeviceTypeMutation.isPending}>
              {updateDeviceTypeMutation.isPending ? 'Updating...' : 'Update Device Type'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  const renderDeleteModal = () => (
    <Dialog open={isDeleteModalOpen} onOpenChange={(open) => {
      if (!deleteDeviceTypeMutation.isPending) {
        setIsDeleteModalOpen(open);
      }
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Device Type</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this device type? This action cannot be undone and may affect device models and buyback requests associated with this type.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-lg">{selectedDeviceType?.name}</span>
            {selectedDeviceType?.icon && (
              <img 
                src={selectedDeviceType.icon} 
                alt={`${selectedDeviceType.name} icon`} 
                className="h-6 w-auto"
              />
            )}
          </div>
          
          {deleteDeviceTypeMutation.error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
              <p className="font-medium mb-1">Error:</p>
              <p>{(deleteDeviceTypeMutation.error as Error).message}</p>
              
              {(deleteDeviceTypeMutation.error as Error).message.includes('models associated') && (
                <div className="mt-2 text-xs">
                  <p className="font-medium">Recommendation:</p>
                  <p>Please delete all device models associated with this device type first, then try again.</p>
                </div>
              )}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setIsDeleteModalOpen(false)}
            disabled={deleteDeviceTypeMutation.isPending}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDeleteDeviceType}
            disabled={deleteDeviceTypeMutation.isPending}
          >
            {deleteDeviceTypeMutation.isPending ? 'Deleting...' : 'Delete Device Type'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const renderAssignBrandsModal = () => (
    <Dialog open={isAssignBrandsModalOpen} onOpenChange={setIsAssignBrandsModalOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign Brands to {selectedDeviceType?.name}</DialogTitle>
          <DialogDescription>
            Select the brands that offer this device type.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="mb-4">
            <Label className="mb-2 block">Selected Brands</Label>
            <div className="flex flex-wrap gap-2 min-h-10 p-2 border rounded-md bg-gray-50">
              {selectedBrands.length === 0 ? (
                <p className="text-gray-500 text-sm p-1">No brands selected</p>
              ) : (
                selectedBrands.map(brandId => {
                  const brand = displayBrands.find(b => b.id === brandId);
                  if (!brand) return null;
                  return (
                    <Badge key={brand.id} className="flex items-center gap-1 py-1 pl-2">
                      {brand.logo && (
                        <img 
                          src={brand.logo} 
                          alt={`${brand.name} logo`} 
                          className="h-4 w-4 object-contain mr-1"
                        />
                      )}
                      {brand.name}
                      <button 
                        type="button"
                        className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                        onClick={() => toggleBrandSelection(brand.id)}
                      >
                        <X size={12} />
                      </button>
                    </Badge>
                  );
                })
              )}
            </div>
          </div>
          
          <ScrollArea className="h-64 border rounded-md p-2">
            <div className="space-y-2">
              {displayBrands.map(brand => (
                <div 
                  key={brand.id} 
                  className={`flex items-center p-2 rounded-md cursor-pointer hover:bg-gray-100 ${
                    selectedBrands.includes(brand.id) ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => toggleBrandSelection(brand.id)}
                >
                  <Checkbox 
                    checked={selectedBrands.includes(brand.id)} 
                    onCheckedChange={() => toggleBrandSelection(brand.id)}
                    className="mr-2"
                  />
                  <div className="flex items-center flex-1">
                    {brand.logo && (
                      <img 
                        src={brand.logo} 
                        alt={`${brand.name} logo`} 
                        className="h-6 w-6 object-contain mr-2"
                      />
                    )}
                    <span>{brand.name}</span>
                  </div>
                </div>
              ))}
            </div>
            <ScrollBar />
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsAssignBrandsModalOpen(false)}>
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={saveSelectedBrands}
            disabled={
              createBrandDeviceTypeMutation.isPending || 
              deleteBrandDeviceTypeMutation.isPending
            }
          >
            {createBrandDeviceTypeMutation.isPending || deleteBrandDeviceTypeMutation.isPending ? 
              'Saving...' : 'Save Brand Assignments'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Device Type Management</h1>
        {renderAddModal()}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Types List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Device Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white rounded-lg overflow-hidden">
                <Table>
                  <TableCaption>List of device types in your catalog</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">ID</TableHead>
                      <TableHead>Icon</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayDeviceTypes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          No device types found. Add your first device type using the button above.
                        </TableCell>
                      </TableRow>
                    ) : (
                      displayDeviceTypes.map((deviceType) => (
                        <TableRow key={deviceType.id}>
                          <TableCell className="font-medium">{deviceType.id}</TableCell>
                          <TableCell>
                            {deviceType.icon ? (
                              <img 
                                src={deviceType.icon} 
                                alt={`${deviceType.name} icon`} 
                                className="h-8 w-8 object-contain"
                              />
                            ) : (
                              <div className="h-8 w-8 bg-gray-200 rounded-md flex items-center justify-center text-gray-500 text-xs">
                                No Icon
                              </div>
                            )}
                          </TableCell>
                          <TableCell>{deviceType.name}</TableCell>
                          <TableCell className="text-slate-500">{deviceType.slug}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={deviceType.active ? "default" : "outline"}
                              className={deviceType.active ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                            >
                              {deviceType.active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="h-8 px-2 text-xs"
                                onClick={() => openAssignBrandsModal(deviceType)}
                              >
                                Assign Brands
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => openEditModal(deviceType)}
                              >
                                <Pencil size={16} />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => openDeleteModal(deviceType)}
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
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Brand Associations */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Brand Associations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {displayDeviceTypes.map(deviceType => (
                  <div key={deviceType.id} className="border rounded-md p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {deviceType.icon && (
                          <img 
                            src={deviceType.icon} 
                            alt={`${deviceType.name} icon`} 
                            className="h-6 w-6 object-contain"
                          />
                        )}
                        <h3 className="text-lg font-medium">{deviceType.name}</h3>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => openAssignBrandsModal(deviceType)}
                      >
                        <Plus size={14} className="mr-1" />
                        Add Brands
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {!displayBrandDeviceTypes || displayBrandDeviceTypes.filter(relation => relation.device_type_id === deviceType.id).length === 0 ? (
                        <p className="text-sm text-gray-500">No brands assigned yet</p>
                      ) : (
                        displayBrandDeviceTypes
                          .filter(relation => relation.device_type_id === deviceType.id)
                          .map(relation => {
                            const brand = displayBrands.find(b => b.id === relation.brand_id);
                            if (!brand) return null;
                            
                            return (
                              <Badge 
                                key={relation.id} 
                                variant="secondary"
                                className="flex items-center gap-1 py-1 pl-2"
                              >
                                {brand.logo && (
                                  <img 
                                    src={brand.logo} 
                                    alt={`${brand.name} logo`} 
                                    className="h-4 w-4 object-contain mr-1"
                                  />
                                )}
                                {brand.name}
                                <button 
                                  type="button"
                                  className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                                  onClick={() => handleRemoveBrand(relation.id)}
                                >
                                  <X size={12} />
                                </button>
                              </Badge>
                            );
                          })
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {renderEditModal()}
      {renderDeleteModal()}
      {renderAssignBrandsModal()}
    </div>
  );
};

export default AdminDeviceTypes;