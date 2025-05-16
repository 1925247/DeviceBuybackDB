import React, { useState } from 'react';
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
import { queryClient } from '@/lib/queryClient';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiRequest } from '@/lib/queryClient';
import FileUpload from '@/components/ui/file-upload';

interface DeviceType {
  id: number;
  name: string;
  slug: string;
  icon: string;
}

interface Brand {
  id: number;
  name: string;
  slug: string;
  logo: string;
}

interface DeviceModel {
  id: number;
  name: string;
  slug: string;
  brand_id: number;
  device_type_id: number;
  image: string;
  variants?: string[];
  active: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

interface DeviceModelWithNames extends DeviceModel {
  brand_name: string;
  device_type_name: string;
}

const AdminModels: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<DeviceModelWithNames | null>(null);
  const [selectedDeviceType, setSelectedDeviceType] = useState<number | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    image: '',
    device_type_id: '',
    brand_id: '',
    active: true,
    featured: false,
    variants: [] as string[],
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newVariant, setNewVariant] = useState('');
  const { toast } = useToast();

  // Query hooks for fetching data
  const { data: deviceTypes, isLoading: isLoadingDeviceTypes } = useQuery<DeviceType[]>({
    queryKey: ['/api/device-types'],
  });

  const { data: brands, isLoading: isLoadingBrands } = useQuery<Brand[]>({
    queryKey: ['/api/brands'],
  });

  const { data: deviceModels, isLoading: isLoadingDeviceModels } = useQuery<DeviceModel[]>({
    queryKey: ['/api/device-models'],
  });

  // Enriched device models with brand and device type names
  const enrichedDeviceModels: DeviceModelWithNames[] = React.useMemo(() => {
    if (!deviceModels || !brands || !deviceTypes) return [];

    return deviceModels.map(model => {
      const brand = brands.find(b => b.id === model.brand_id);
      const deviceType = deviceTypes.find(dt => dt.id === model.device_type_id);

      return {
        ...model,
        brand_name: brand?.name || 'Unknown Brand',
        device_type_name: deviceType?.name || 'Unknown Type',
      };
    });
  }, [deviceModels, brands, deviceTypes]);

  // Filtered models based on selected device type and brand
  const filteredModels = enrichedDeviceModels.filter(model => {
    let matches = true;
    if (selectedDeviceType !== null && selectedDeviceType !== 0) {
      matches = matches && model.device_type_id === selectedDeviceType;
    }
    if (selectedBrand !== null && selectedBrand !== 0) {
      matches = matches && model.brand_id === selectedBrand;
    }
    return matches;
  });

  // Mutation hooks for creating, updating, and deleting device models
  const createModelMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest('POST', '/api/device-models', data);
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
      // Log the data we're sending to help with debugging
      console.log("Sending update data:", data);
      
      // Ensure fields match the backend's expected snake_case format
      // The backend expects specific field names that match database columns
      const payload = {
        id: data.id,
        name: data.name,
        slug: data.slug,
        image: data.image,
        brand_id: data.brand_id ? parseInt(data.brand_id) : undefined,
        device_type_id: data.device_type_id ? parseInt(data.device_type_id) : undefined,
        active: data.active,
        featured: data.featured,
        variants: data.variants
      };
      
      return await apiRequest('PUT', `/api/device-models/${data.id}`, payload);
    },
    onSuccess: (response) => {
      console.log("Update successful, response:", response);
      queryClient.invalidateQueries({ queryKey: ['/api/device-models'] });
      setIsEditModalOpen(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Device model updated successfully',
      });
    },
    onError: (error: Error) => {
      console.error("Update failed:", error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update device model',
        variant: 'destructive',
      });
    },
  });

  const deleteModelMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('DELETE', `/api/device-models/${id}`);
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

  // Upload image mutation
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
      setFormData(prev => ({ ...prev, image: data.url }));
      toast({
        title: 'Success',
        description: 'Image uploaded successfully',
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
      image: '',
      device_type_id: '',
      brand_id: '',
      active: true,
      featured: false,
      variants: [],
    });
    setSelectedFile(null);
    setNewVariant('');
  };
  
  const handleFileUpload = (file: File) => {
    setSelectedFile(file);
    uploadImageMutation.mutate(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleAddVariant = () => {
    if (newVariant.trim() === '') return;
    if (formData.variants.includes(newVariant.trim())) {
      toast({
        title: 'Duplicate Variant',
        description: 'This variant already exists.',
        variant: 'destructive',
      });
      return;
    }
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, newVariant.trim()],
    }));
    setNewVariant('');
  };

  const handleRemoveVariant = (variant: string) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter(v => v !== variant),
    }));
  };

  const handleAddModel = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields before submission
    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Model name is required',
        variant: 'destructive',
      });
      return;
    }
    
    if (!formData.device_type_id) {
      toast({
        title: 'Validation Error',
        description: 'Device type is required',
        variant: 'destructive',
      });
      return;
    }
    
    if (!formData.brand_id) {
      toast({
        title: 'Validation Error',
        description: 'Brand is required',
        variant: 'destructive',
      });
      return;
    }
    
    if (!formData.image) {
      toast({
        title: 'Validation Error',
        description: 'Please upload a model image',
        variant: 'destructive',
      });
      return;
    }
    
    // Generate slug if not provided
    let modelSlug = formData.slug;
    if (!modelSlug.trim()) {
      modelSlug = formData.name.toLowerCase().replace(/\s+/g, '-');
    }
    
    const processedData = {
      ...formData,
      slug: modelSlug,
      device_type_id: parseInt(formData.device_type_id),
      brand_id: parseInt(formData.brand_id),
      active: Boolean(formData.active),
      featured: Boolean(formData.featured),
    };
    
    createModelMutation.mutate(processedData as any);
  };

  const handleEditModel = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedModel) return;
    
    // Validate required fields before submission
    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Model name is required',
        variant: 'destructive',
      });
      return;
    }
    
    if (!formData.device_type_id) {
      toast({
        title: 'Validation Error',
        description: 'Device type is required',
        variant: 'destructive',
      });
      return;
    }
    
    if (!formData.brand_id) {
      toast({
        title: 'Validation Error',
        description: 'Brand is required',
        variant: 'destructive',
      });
      return;
    }
    
    if (!formData.image) {
      toast({
        title: 'Validation Error',
        description: 'Please upload a model image',
        variant: 'destructive',
      });
      return;
    }
    
    // Generate slug if not provided
    let modelSlug = formData.slug;
    if (!modelSlug.trim()) {
      modelSlug = formData.name.toLowerCase().replace(/\s+/g, '-');
    }
    
    const processedData = {
      ...formData,
      id: selectedModel.id,
      slug: modelSlug,
      device_type_id: parseInt(formData.device_type_id),
      brand_id: parseInt(formData.brand_id),
      active: Boolean(formData.active),
      featured: Boolean(formData.featured),
    };
    
    updateModelMutation.mutate(processedData as any);
  };

  const handleDeleteModel = () => {
    if (selectedModel) {
      deleteModelMutation.mutate(selectedModel.id);
    }
  };

  const openEditModal = (model: DeviceModelWithNames) => {
    setSelectedModel(model);
    setFormData({
      name: model.name,
      slug: model.slug,
      image: model.image || '',
      device_type_id: model.device_type_id.toString(),
      brand_id: model.brand_id.toString(),
      active: model.active,
      featured: model.featured,
      variants: model.variants || [],
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (model: DeviceModelWithNames) => {
    setSelectedModel(model);
    setIsDeleteModalOpen(true);
  };

  // Loading state
  if (isLoadingDeviceTypes || isLoadingBrands || isLoadingDeviceModels) {
    return (
      <div className="py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Device Models</h1>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // Error handling for missing data
  if (!deviceTypes || !brands) {
    return (
      <div className="py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Device Models</h1>
        <div className="bg-red-50 p-4 rounded border border-red-200 text-red-700">
          Error loading required data. Please try refreshing the page.
        </div>
      </div>
    );
  }

  // Render functions
  const renderVariantInput = () => (
    <div className="space-y-2">
      <Label>Model Variants</Label>
      <div className="flex space-x-2">
        <Input
          value={newVariant}
          onChange={(e) => setNewVariant(e.target.value)}
          placeholder="Add a variant (e.g., 128GB, 8GB RAM)"
        />
        <Button type="button" size="sm" onClick={handleAddVariant}>
          <Plus size={16} />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {formData.variants.map((variant, index) => (
          <Badge key={index} variant="secondary" className="flex items-center gap-1">
            {variant}
            <button
              type="button"
              onClick={() => handleRemoveVariant(variant)}
              className="ml-1 rounded-full hover:bg-gray-200 p-1"
            >
              <X size={14} />
            </button>
          </Badge>
        ))}
      </div>
      <p className="text-xs text-gray-500">
        Variants are used for different configurations of the same model (storage, RAM, etc.)
      </p>
    </div>
  );

  const renderAddModal = () => (
    <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
      <DialogTrigger asChild>
        <Button className="mb-4 flex items-center gap-2">
          <PlusCircle size={16} />
          Add New Model
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Device Model</DialogTitle>
          <DialogDescription>
            Create a new device model for your catalog.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleAddModel} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="device_type_id">Device Type</Label>
            <Select 
              value={formData.device_type_id} 
              onValueChange={(value) => handleSelectChange('device_type_id', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a device type" />
              </SelectTrigger>
              <SelectContent>
                {deviceTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="brand_id">Brand</Label>
            <Select 
              value={formData.brand_id} 
              onValueChange={(value) => handleSelectChange('brand_id', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a brand" />
              </SelectTrigger>
              <SelectContent>
                {brands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id.toString()}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Model Name</Label>
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
              onUrlChange={(url) => setFormData((prev) => ({ ...prev, image: url }))}
              initialUrl={formData.image}
              label="Model Image"
              description="Upload a high-quality image of this device model"
            />
          </div>
          
          {renderVariantInput()}
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => handleCheckboxChange('active', checked as boolean)}
            />
            <Label htmlFor="active">Active</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) => handleCheckboxChange('featured', checked as boolean)}
            />
            <Label htmlFor="featured">Featured</Label>
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
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Device Model</DialogTitle>
          <DialogDescription>
            Update the device model details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleEditModel} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-device_type_id">Device Type</Label>
            <Select 
              value={formData.device_type_id} 
              onValueChange={(value) => handleSelectChange('device_type_id', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a device type" />
              </SelectTrigger>
              <SelectContent>
                {deviceTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-brand_id">Brand</Label>
            <Select 
              value={formData.brand_id} 
              onValueChange={(value) => handleSelectChange('brand_id', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a brand" />
              </SelectTrigger>
              <SelectContent>
                {brands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id.toString()}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-name">Model Name</Label>
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
          </div>
          
          <div className="space-y-2">
            <FileUpload
              onFileChange={handleFileUpload}
              onUrlChange={(url) => setFormData((prev) => ({ ...prev, image: url }))}
              initialUrl={formData.image}
              label="Model Image"
              description="Upload a high-quality image of this device model"
            />
          </div>
          
          {renderVariantInput()}
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="edit-active"
              checked={formData.active}
              onCheckedChange={(checked) => handleCheckboxChange('active', checked as boolean)}
            />
            <Label htmlFor="edit-active">Active</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="edit-featured"
              checked={formData.featured}
              onCheckedChange={(checked) => handleCheckboxChange('featured', checked as boolean)}
            />
            <Label htmlFor="edit-featured">Featured</Label>
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
            Are you sure you want to delete this device model? This action cannot be undone and may affect valuations and devices associated with this model.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="font-medium">
            {selectedModel?.name} ({selectedModel?.brand_name})
          </p>
          <p className="text-sm text-gray-500">
            {selectedModel?.device_type_name}
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

  return (
    <div className="py-8 px-4">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Device Models</h1>
        <div className="flex flex-col md:flex-row gap-3">
          <Select 
            value={selectedDeviceType?.toString() || 'all'} 
            onValueChange={(value) => setSelectedDeviceType(value === 'all' ? null : parseInt(value))}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by device type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Device Types</SelectItem>
              {deviceTypes.map((deviceType) => (
                <SelectItem key={deviceType.id} value={deviceType.id.toString()}>
                  {deviceType.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select 
            value={selectedBrand?.toString() || 'all'} 
            onValueChange={(value) => setSelectedBrand(value === 'all' ? null : parseInt(value))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by brand" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Brands</SelectItem>
              {brands.map((brand) => (
                <SelectItem key={brand.id} value={brand.id.toString()}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {renderAddModal()}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Models</CardTitle>
            <CardDescription>Total number of device models</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{enrichedDeviceModels.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Active Models</CardTitle>
            <CardDescription>Number of active device models</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              {enrichedDeviceModels.filter(model => model.active).length}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Featured Models</CardTitle>
            <CardDescription>Number of featured device models</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              {enrichedDeviceModels.filter(model => model.featured).length}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableCaption>List of device models</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Model Name</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Variants</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredModels.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  No device models found. Add your first model using the button above.
                </TableCell>
              </TableRow>
            ) : (
              filteredModels.map((model) => (
                <TableRow key={model.id}>
                  <TableCell>
                    {model.image ? (
                      <img 
                        src={model.image} 
                        alt={`${model.name}`} 
                        className="h-12 w-auto object-contain"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                        No image
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{model.name}</TableCell>
                  <TableCell>{model.brand_name}</TableCell>
                  <TableCell>{model.device_type_name}</TableCell>
                  <TableCell>
                    {model.variants && model.variants.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {model.variants.map((variant, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {variant}
                          </Badge>
                        ))}
                      </div>
                    ) : "No variants"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={model.active ? "default" : "secondary"}>
                      {model.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {model.featured && (
                      <Badge variant="default">Featured</Badge>
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