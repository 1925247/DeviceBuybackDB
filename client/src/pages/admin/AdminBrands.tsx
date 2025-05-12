import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import FileUpload from '@/components/ui/file-upload';

interface Brand {
  id: number;
  name: string;
  slug: string;
  logo: string;
  created_at: string;
  updated_at: string;
}

const AdminBrands: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    logo: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  // Query hooks for fetching data
  const { data: brands, isLoading: isLoadingBrands } = useQuery<Brand[]>({
    queryKey: ['/api/brands'],
  });

  // Mutation hooks for creating, updating, and deleting brands
  const createBrandMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch('/api/brands', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create brand');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/brands'] });
      setIsAddModalOpen(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Brand created successfully',
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

  const updateBrandMutation = useMutation({
    mutationFn: async (data: typeof formData & { id: number }) => {
      const response = await fetch(`/api/brands/${data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update brand');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/brands'] });
      setIsEditModalOpen(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Brand updated successfully',
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

  const deleteBrandMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/brands/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete brand');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/brands'] });
      setIsDeleteModalOpen(false);
      setSelectedBrand(null);
      toast({
        title: 'Success',
        description: 'Brand deleted successfully',
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

  // Upload logo mutation
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
      setFormData(prev => ({ ...prev, logo: data.url }));
      toast({
        title: 'Success',
        description: 'Logo uploaded successfully',
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
      logo: '',
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

  const handleAddBrand = (e: React.FormEvent) => {
    e.preventDefault();
    createBrandMutation.mutate(formData);
  };

  const handleEditBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBrand) {
      updateBrandMutation.mutate({ ...formData, id: selectedBrand.id });
    }
  };

  const handleDeleteBrand = () => {
    if (selectedBrand) {
      deleteBrandMutation.mutate(selectedBrand.id);
    }
  };

  const openEditModal = (brand: Brand) => {
    setSelectedBrand(brand);
    setFormData({
      name: brand.name,
      slug: brand.slug,
      logo: brand.logo || '',
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (brand: Brand) => {
    setSelectedBrand(brand);
    setIsDeleteModalOpen(true);
  };

  // Loading state
  if (isLoadingBrands) {
    return (
      <div className="py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Brand Management</h1>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // Error handling for missing data
  if (!brands) {
    return (
      <div className="py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Brand Management</h1>
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
          Add New Brand
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Brand</DialogTitle>
          <DialogDescription>
            Create a new device brand for your catalog.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleAddBrand} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Brand Name</Label>
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
              onUrlChange={(url) => setFormData((prev) => ({ ...prev, logo: url }))}
              initialUrl={formData.logo}
              label="Logo"
              description="Upload a brand logo or enter a URL (recommended size: 128x128px)"
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createBrandMutation.isPending}>
              {createBrandMutation.isPending ? 'Creating...' : 'Create Brand'}
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
          <DialogTitle>Edit Brand</DialogTitle>
          <DialogDescription>
            Update the details of your brand.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleEditBrand} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Brand Name</Label>
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
              onUrlChange={(url) => setFormData((prev) => ({ ...prev, logo: url }))}
              initialUrl={formData.logo}
              label="Logo"
              description="Upload a brand logo or enter a URL (recommended size: 128x128px)"
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateBrandMutation.isPending}>
              {updateBrandMutation.isPending ? 'Updating...' : 'Update Brand'}
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
          <DialogTitle>Delete Brand</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this brand? This action cannot be undone and may affect device models associated with this brand.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="font-medium">
            {selectedBrand?.name}
          </p>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDeleteBrand}
            disabled={deleteBrandMutation.isPending}
          >
            {deleteBrandMutation.isPending ? 'Deleting...' : 'Delete Brand'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Brand Management</h1>
        {renderAddModal()}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableCaption>List of brands in your catalog</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">ID</TableHead>
              <TableHead>Logo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No brands found. Add your first brand using the button above.
                </TableCell>
              </TableRow>
            ) : (
              brands.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell className="font-medium">{brand.id}</TableCell>
                  <TableCell>
                    {brand.logo ? (
                      <img 
                        src={brand.logo} 
                        alt={`${brand.name} logo`} 
                        className="h-8 w-auto object-contain"
                      />
                    ) : (
                      <div className="h-8 w-8 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                        No logo
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{brand.name}</TableCell>
                  <TableCell>{brand.slug}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => openEditModal(brand)}
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        onClick={() => openDeleteModal(brand)}
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

export default AdminBrands;