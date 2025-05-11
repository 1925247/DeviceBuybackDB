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
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface DeviceModel {
  id: number;
  name: string;
  slug: string;
  brand_id: number;
  device_type_id: number;
  image: string;
  active: boolean;
  featured: boolean;
  variants: string[];
  brand?: {
    id: number;
    name: string;
    slug: string;
    logo: string;
  };
  deviceType?: {
    id: number;
    name: string;
    slug: string;
    icon: string;
  };
  created_at: string;
  updated_at: string;
}

interface Brand {
  id: number;
  name: string;
  slug: string;
  logo: string;
  created_at: string;
  updated_at: string;
}

interface DeviceType {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

const AdminModels: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<DeviceModel | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    brand_id: '',
    device_type_id: '',
    image: '',
    active: true,
    featured: false,
    variants: [] as string[],
  });
  const { toast } = useToast();

  // Query hooks for fetching data
  const { data: deviceModels, isLoading: isLoadingModels } = useQuery<DeviceModel[]>({
    queryKey: ['/api/device-models'],
  });

  const { data: brands, isLoading: isLoadingBrands } = useQuery<Brand[]>({
    queryKey: ['/api/brands'],
  });

  const { data: deviceTypes, isLoading: isLoadingDeviceTypes } = useQuery<DeviceType[]>({
    queryKey: ['/api/device-types'],
  });

  // Mutation hooks for creating, updating, and deleting device models
  const createModelMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch('/api/device-models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create device model');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/device-models'] });
      setIsAddModalOpen(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Device model created successfully',
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

  const updateModelMutation = useMutation({
    mutationFn: async (data: typeof formData & { id: number }) => {
      const response = await fetch(`/api/device-models/${data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update device model');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/device-models'] });
      setIsEditModalOpen(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Device model updated successfully',
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

  const deleteModelMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/device-models/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete device model');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/device-models'] });
      setIsDeleteModalOpen(false);
      setSelectedModel(null);
      toast({
        title: 'Success',
        description: 'Device model deleted successfully',
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
      brand_id: '',
      device_type_id: '',
      image: '',
      active: true,
      featured: false,
      variants: [],
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddModel = (e: React.FormEvent) => {
    e.preventDefault();
    createModelMutation.mutate(formData);
  };

  const handleEditModel = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedModel) {
      updateModelMutation.mutate({ ...formData, id: selectedModel.id });
    }
  };

  const handleDeleteModel = () => {
    if (selectedModel) {
      deleteModelMutation.mutate(selectedModel.id);
    }
  };

  const openEditModal = (model: DeviceModel) => {
    setSelectedModel(model);
    setFormData({
      name: model.name,
      slug: model.slug,
      brand_id: model.brand_id.toString(),
      device_type_id: model.device_type_id.toString(),
      image: model.image || '',
      active: model.active,
      featured: model.featured,
      variants: model.variants || [],
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (model: DeviceModel) => {
    setSelectedModel(model);
    setIsDeleteModalOpen(true);
  };

  // Render functions
  // State for handling variants
  const [variantInput, setVariantInput] = useState('');
  
  const addVariant = () => {
    if (variantInput.trim() !== '') {
      setFormData(prev => ({
        ...prev,
        variants: [...prev.variants, variantInput.trim()]
      }));
      setVariantInput('');
    }
  };

  const removeVariant = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const renderAddModal = () => (
    <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
      <DialogTrigger asChild>
        <Button className="mb-4 flex items-center gap-2">
          <PlusCircle size={16} />
          Add New Model
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add New Device Model</DialogTitle>
          <DialogDescription>
            Create a new device model for your catalog.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleAddModel} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
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
                Used in URLs (e.g., "iphone-14-pro")
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand_id">Brand</Label>
              <Select
                value={formData.brand_id}
                onValueChange={(value) => handleSelectChange('brand_id', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Brand" />
                </SelectTrigger>
                <SelectContent>
                  {brands?.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id.toString()}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="device_type_id">Device Type</Label>
              <Select
                value={formData.device_type_id}
                onValueChange={(value) => handleSelectChange('device_type_id', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Device Type" />
                </SelectTrigger>
                <SelectContent>
                  {deviceTypes?.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="image">Image URL</Label>
            <Input
              id="image"
              name="image"
              value={formData.image}
              onChange={handleInputChange}
              placeholder="/assets/models/model-name.png or https://..."
            />
            <p className="text-xs text-gray-500">
              Path to device image (local or external URL)
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="active"
                name="active"
                checked={formData.active}
                onChange={handleCheckboxChange}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
              />
              <Label htmlFor="active" className="cursor-pointer">Active</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                checked={formData.featured}
                onChange={handleCheckboxChange}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
              />
              <Label htmlFor="featured" className="cursor-pointer">Featured on Homepage</Label>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Variants</Label>
            <div className="flex flex-col space-y-2">
              <div className="flex space-x-2">
                <Input 
                  placeholder="Add a variant (e.g., 128GB, 256GB)"
                  value={variantInput}
                  onChange={(e) => setVariantInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addVariant();
                    }
                  }}
                />
                <Button 
                  type="button" 
                  onClick={addVariant}
                  variant="outline"
                >
                  Add
                </Button>
              </div>
              
              {formData.variants.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.variants.map((variant, index) => (
                    <div key={index} className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-1">
                      <span>{variant}</span>
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createModelMutation.isPending}>
              {createModelMutation.isPending ? 'Creating...' : 'Create Model'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  const renderEditModal = () => (
    <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Device Model</DialogTitle>
          <DialogDescription>
            Update the details of your device model.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleEditModel} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
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
                Used in URLs (e.g., "iphone-14-pro")
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-brand_id">Brand</Label>
              <Select
                value={formData.brand_id}
                onValueChange={(value) => handleSelectChange('brand_id', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Brand" />
                </SelectTrigger>
                <SelectContent>
                  {brands?.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id.toString()}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-device_type_id">Device Type</Label>
              <Select
                value={formData.device_type_id}
                onValueChange={(value) => handleSelectChange('device_type_id', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Device Type" />
                </SelectTrigger>
                <SelectContent>
                  {deviceTypes?.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-image">Image URL</Label>
            <Input
              id="edit-image"
              name="image"
              value={formData.image}
              onChange={handleInputChange}
              placeholder="/assets/models/model-name.png or https://..."
            />
            <p className="text-xs text-gray-500">
              Path to device image (local or external URL)
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-active"
                name="active"
                checked={formData.active}
                onChange={handleCheckboxChange}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
              />
              <Label htmlFor="edit-active" className="cursor-pointer">Active</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-featured"
                name="featured"
                checked={formData.featured}
                onChange={handleCheckboxChange}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
              />
              <Label htmlFor="edit-featured" className="cursor-pointer">Featured on Homepage</Label>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Variants</Label>
            <div className="flex flex-col space-y-2">
              <div className="flex space-x-2">
                <Input 
                  placeholder="Add a variant (e.g., 128GB, 256GB)"
                  value={variantInput}
                  onChange={(e) => setVariantInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addVariant();
                    }
                  }}
                />
                <Button 
                  type="button" 
                  onClick={addVariant}
                  variant="outline"
                >
                  Add
                </Button>
              </div>
              
              {formData.variants.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.variants.map((variant, index) => (
                    <div key={index} className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-1">
                      <span>{variant}</span>
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateModelMutation.isPending}>
              {updateModelMutation.isPending ? 'Updating...' : 'Update Model'}
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
          <DialogTitle>Delete Device Model</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this device model? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="font-medium">
            {selectedModel?.name}
          </p>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDeleteModel}
            disabled={deleteModelMutation.isPending}
          >
            {deleteModelMutation.isPending ? 'Deleting...' : 'Delete Model'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Loading state
  if (isLoadingModels || isLoadingBrands || isLoadingDeviceTypes) {
    return (
      <div className="py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Device Model Management</h1>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // Error handling for missing data
  if (!deviceModels || !brands || !deviceTypes) {
    return (
      <div className="py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Device Model Management</h1>
        <div className="bg-red-50 p-4 rounded border border-red-200 text-red-700">
          Error loading data. Please try refreshing the page.
        </div>
      </div>
    );
  }

  // Get brand and device type names for each model
  const getBrandName = (brandId: number) => {
    const brand = brands.find((b) => b.id === brandId);
    return brand ? brand.name : 'Unknown';
  };

  const getDeviceTypeName = (typeId: number) => {
    const type = deviceTypes.find((t) => t.id === typeId);
    return type ? type.name : 'Unknown';
  };

  return (
    <div className="py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Device Model Management</h1>
        {renderAddModal()}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableCaption>List of device models in your catalog</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">ID</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Device Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Variants</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deviceModels.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  No device models found. Add your first device model using the button above.
                </TableCell>
              </TableRow>
            ) : (
              deviceModels.map((model) => (
                <TableRow key={model.id} className={!model.active ? "bg-gray-50" : ""}>
                  <TableCell className="font-medium">{model.id}</TableCell>
                  <TableCell>
                    {model.image ? (
                      <img 
                        src={model.image} 
                        alt={model.name} 
                        className="h-10 w-auto object-contain rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://placehold.co/60x60?text=No+Image';
                        }}
                      />
                    ) : (
                      <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">
                        No image
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{model.name}</div>
                    <div className="text-xs text-gray-500">{model.slug}</div>
                    {model.featured && (
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 mt-1">
                        Featured
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {model.brand ? (
                      <div className="flex items-center space-x-2">
                        {model.brand.logo && (
                          <img 
                            src={model.brand.logo} 
                            alt={model.brand.name} 
                            className="h-5 w-5 object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://placehold.co/20x20?text=B';
                            }}
                          />
                        )}
                        <span>{model.brand.name}</span>
                      </div>
                    ) : (
                      getBrandName(model.brand_id)
                    )}
                  </TableCell>
                  <TableCell>
                    {model.deviceType ? (
                      model.deviceType.name
                    ) : (
                      getDeviceTypeName(model.device_type_id)
                    )}
                  </TableCell>
                  <TableCell>
                    {model.active ? (
                      <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                        Inactive
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {model.variants && model.variants.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {model.variants.slice(0, 3).map((variant, idx) => (
                          <span key={idx} className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                            {variant}
                          </span>
                        ))}
                        {model.variants.length > 3 && (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                            +{model.variants.length - 3}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500">No variants</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => openEditModal(model)}
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        onClick={() => openDeleteModal(model)}
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
      </div>

      {renderEditModal()}
      {renderDeleteModal()}
    </div>
  );
};

export default AdminModels;