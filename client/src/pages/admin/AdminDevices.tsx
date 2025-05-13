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
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { PlusCircle, Pencil, Trash2, FileIcon } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import FileUpload from '@/components/ui/file-upload';

interface DeviceType {
  id: number;
  name: string;
  slug: string;
  icon: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

const AdminDevices: React.FC = () => {
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
  const { toast } = useToast();

  // Query hooks for fetching data
  const { data: deviceTypes, isLoading: isLoadingDeviceTypes } = useQuery<DeviceType[]>({
    queryKey: ['/api/device-types'],
  });

  // Mutation hooks for creating, updating, and deleting device types
  const createDeviceTypeMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest('POST', '/api/device-types', data);
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
      return await apiRequest('PUT', `/api/device-types/${data.id}`, data);
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
      return await apiRequest('DELETE', `/api/device-types/${id}`);
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
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, active: checked }));
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

  // Generate a slug from the name
  const generateSlug = () => {
    const slug = formData.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setFormData(prev => ({ ...prev, slug }));
  };

  // Loading state
  if (isLoadingDeviceTypes) {
    return (
      <div className="py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Device Type Management</h1>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // Error handling for missing data
  if (!deviceTypes) {
    return (
      <div className="py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Device Type Management</h1>
        <div className="bg-red-50 p-4 rounded border border-red-200 text-red-700">
          Error loading data. Please try refreshing the page.
        </div>
      </div>
    );
  }

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
            Create a new device type category for your catalog.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleAddDeviceType} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Type Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              onBlur={generateSlug}
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
              label="Icon Image"
              description="Upload an icon for this device type (recommended size: 128x128px)"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.active}
              onCheckedChange={handleSwitchChange}
              id="active"
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
            <Label htmlFor="edit-name">Type Name</Label>
            <Input
              id="edit-name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              onBlur={generateSlug}
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
              label="Icon Image"
              description="Upload an icon for this device type (recommended size: 128x128px)"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.active}
              onCheckedChange={handleSwitchChange}
              id="edit-active"
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
    <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Device Type</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this device type? This action cannot be undone and may affect device models, pricing, and questionnaires associated with this type.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="font-medium">
            {selectedDeviceType?.name}
          </p>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
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

  return (
    <div className="py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Device Type Management</h1>
        {renderAddModal()}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
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
            {deviceTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No device types found. Add your first device type using the button above.
                </TableCell>
              </TableRow>
            ) : (
              deviceTypes.map((deviceType) => (
                <TableRow key={deviceType.id}>
                  <TableCell className="font-medium">{deviceType.id}</TableCell>
                  <TableCell>
                    {deviceType.icon ? (
                      <img 
                        src={deviceType.icon} 
                        alt={`${deviceType.name} icon`} 
                        className="h-8 w-auto object-contain"
                      />
                    ) : (
                      <div className="h-8 w-8 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                        <FileIcon size={16} />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{deviceType.name}</TableCell>
                  <TableCell>{deviceType.slug}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${deviceType.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {deviceType.active ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => openEditModal(deviceType)}
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        onClick={() => openDeleteModal(deviceType)}
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

export default AdminDevices;