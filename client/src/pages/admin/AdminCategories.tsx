import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { PlusCircle, Pencil, Trash2, ChevronRight, FolderTree } from 'lucide-react';
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

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parent_id: number | null;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
  seo_title: string | null;
  seo_description: string | null;
  image: string | null;
}

const AdminCategories: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parent_id: '',
    is_visible: true,
    seo_title: '',
    seo_description: '',
    image: '',
  });
  const { toast } = useToast();

  // Query hooks for fetching data
  const { data: categories, isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      return apiRequest('GET', '/api/categories').then(res => res.json());
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to load categories',
        variant: 'destructive',
      });
    },
  });

  // Mutation hooks for category operations
  const createCategoryMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest('POST', '/api/categories', {
        ...data,
        parent_id: data.parent_id ? parseInt(data.parent_id) : null,
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      setIsAddModalOpen(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Category created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create category',
        variant: 'destructive',
      });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async (data: typeof formData & { id: number }) => {
      return apiRequest('PUT', `/api/categories/${data.id}`, {
        ...data,
        parent_id: data.parent_id ? parseInt(data.parent_id) : null,
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      setIsEditModalOpen(false);
      setSelectedCategory(null);
      resetForm();
      toast({
        title: 'Success',
        description: 'Category updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update category',
        variant: 'destructive',
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      setIsDeleteModalOpen(false);
      setSelectedCategory(null);
      toast({
        title: 'Success',
        description: 'Category deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete category',
        variant: 'destructive',
      });
    },
  });

  // Helper functions
  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      parent_id: '',
      is_visible: true,
      seo_title: '',
      seo_description: '',
      image: '',
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, is_visible: checked }));
  };

  const handleGenerateSlug = () => {
    if (!formData.name) return;
    const slug = formData.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setFormData(prev => ({ ...prev, slug }));
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.slug) {
      toast({
        title: 'Validation Error',
        description: 'Name and slug are required fields',
        variant: 'destructive',
      });
      return;
    }
    
    createCategoryMutation.mutate(formData);
  };

  const handleEditCategory = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCategory) return;
    
    // Basic validation
    if (!formData.name || !formData.slug) {
      toast({
        title: 'Validation Error',
        description: 'Name and slug are required fields',
        variant: 'destructive',
      });
      return;
    }
    
    updateCategoryMutation.mutate({
      ...formData,
      id: selectedCategory.id,
    });
  };

  const handleDeleteCategory = () => {
    if (selectedCategory) {
      deleteCategoryMutation.mutate(selectedCategory.id);
    }
  };

  const openEditModal = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      parent_id: category.parent_id ? category.parent_id.toString() : '',
      is_visible: category.is_visible,
      seo_title: category.seo_title || '',
      seo_description: category.seo_description || '',
      image: category.image || '',
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteModalOpen(true);
  };

  const getParentCategoryName = (parentId: number | null) => {
    if (!parentId || !categories) return 'None';
    const parentCategory = categories.find(c => c.id === parentId);
    return parentCategory ? parentCategory.name : 'Unknown';
  };

  // Organize categories into parent/child hierarchy
  const organizeCategories = (cats: Category[] | undefined) => {
    if (!cats) return [];
    
    const parentCategories = cats.filter(c => !c.parent_id);
    const childCategoriesByParentId: Record<number, Category[]> = {};
    
    cats.filter(c => c.parent_id).forEach(childCat => {
      if (!childCat.parent_id) return;
      
      if (!childCategoriesByParentId[childCat.parent_id]) {
        childCategoriesByParentId[childCat.parent_id] = [];
      }
      
      childCategoriesByParentId[childCat.parent_id].push(childCat);
    });
    
    return { parentCategories, childCategoriesByParentId };
  };

  const { parentCategories, childCategoriesByParentId } = organizeCategories(categories);

  // Loading state
  if (isLoadingCategories) {
    return (
      <div className="py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Category Management</h1>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  const renderAddEditForm = (isEdit: boolean = false) => (
    <form onSubmit={isEdit ? handleEditCategory : handleAddCategory} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Category Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., Smartphones, Laptops"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <div className="flex gap-2">
            <Input
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              placeholder="e.g., smartphones, laptops"
              required
            />
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleGenerateSlug}
              className="whitespace-nowrap"
            >
              Generate
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Used in URLs: /category/{formData.slug || 'example-slug'}
          </p>
        </div>
        
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Optional description of this category"
            rows={3}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="parent_id">Parent Category</Label>
          <Select 
            value={formData.parent_id} 
            onValueChange={(value) => handleSelectChange('parent_id', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="None (Top Level)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None (Top Level)</SelectItem>
              {categories?.filter(c => 
                // Don't show the current category as a parent option
                (!isEdit || c.id !== selectedCategory?.id) && 
                // Don't show any children of the current category as parent options
                (!isEdit || !childCategoriesByParentId[selectedCategory?.id || 0] || 
                 !childCategoriesByParentId[selectedCategory?.id || 0].find(child => child.id === c.id))
              ).map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            checked={formData.is_visible}
            onCheckedChange={handleSwitchChange}
            id="is_visible"
          />
          <Label htmlFor="is_visible">Visible on Storefront</Label>
        </div>
        
        <div className="space-y-2 md:col-span-2">
          <h3 className="text-base font-medium mb-2">SEO Settings</h3>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="seo_title">SEO Title</Label>
              <Input
                id="seo_title"
                name="seo_title"
                value={formData.seo_title}
                onChange={handleInputChange}
                placeholder="Optional SEO title (leave blank to use category name)"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="seo_description">SEO Description</Label>
              <Textarea
                id="seo_description"
                name="seo_description"
                value={formData.seo_description}
                onChange={handleInputChange}
                placeholder="Optional SEO description"
                rows={2}
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="image">Category Image URL</Label>
          <Input
            id="image"
            name="image"
            value={formData.image}
            onChange={handleInputChange}
            placeholder="Optional image URL for this category"
          />
          <p className="text-xs text-gray-500 mt-1">
            Image upload functionality will be implemented soon.
          </p>
        </div>
      </div>
      
      <DialogFooter>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => isEdit ? setIsEditModalOpen(false) : setIsAddModalOpen(false)}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isEdit ? updateCategoryMutation.isPending : createCategoryMutation.isPending}
        >
          {isEdit 
            ? (updateCategoryMutation.isPending ? 'Updating...' : 'Update Category') 
            : (createCategoryMutation.isPending ? 'Creating...' : 'Create Category')
          }
        </Button>
      </DialogFooter>
    </form>
  );

  const renderAddModal = () => (
    <DialogContent className="max-w-3xl">
      <DialogHeader>
        <DialogTitle>Add New Category</DialogTitle>
        <DialogDescription>
          Create a new product category for your marketplace.
        </DialogDescription>
      </DialogHeader>
      {renderAddEditForm(false)}
    </DialogContent>
  );

  const renderEditModal = () => (
    <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
          <DialogDescription>
            Update the category information.
          </DialogDescription>
        </DialogHeader>
        {renderAddEditForm(true)}
      </DialogContent>
    </Dialog>
  );

  const renderDeleteModal = () => (
    <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Category</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this category? This action cannot be undone and may affect products associated with this category.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="font-medium">
            {selectedCategory?.name}
          </p>
          {selectedCategory?.description && (
            <p className="text-sm text-gray-500 mt-1">
              {selectedCategory.description}
            </p>
          )}
          
          {childCategoriesByParentId[selectedCategory?.id || 0]?.length > 0 && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-amber-800 text-sm font-medium">
                Warning: This category has {childCategoriesByParentId[selectedCategory?.id || 0].length} subcategories that will become top-level categories.
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDeleteCategory}
            disabled={deleteCategoryMutation.isPending}
          >
            {deleteCategoryMutation.isPending ? 'Deleting...' : 'Delete Category'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Category Management</h1>
          <p className="text-gray-500">Manage product categories for your marketplace</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle size={16} />
              Add New Category
            </Button>
          </DialogTrigger>
          {renderAddModal()}
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FolderTree size={18} />
            <CardTitle>Categories</CardTitle>
          </div>
          <CardDescription>
            Organize your products with categories and subcategories
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(!categories || categories.length === 0) ? (
            <div className="bg-gray-50 p-8 rounded-md text-center">
              <FolderTree className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">No Categories Found</h3>
              <p className="text-gray-500 mb-4">
                You haven't created any product categories yet. Categories help organize your products and improve navigation.
              </p>
              <Button onClick={() => setIsAddModalOpen(true)}>
                Create Your First Category
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Render parent categories first */}
                {parentCategories.map((category) => (
                  <React.Fragment key={category.id}>
                    <TableRow className="bg-gray-50">
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell className="text-sm text-gray-500">{category.slug}</TableCell>
                      <TableCell>—</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${category.is_visible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {category.is_visible ? 'Visible' : 'Hidden'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openEditModal(category)}
                          >
                            <Pencil size={14} className="mr-1" />
                            Edit
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => openDeleteModal(category)}
                          >
                            <Trash2 size={14} className="mr-1" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Render child categories indented */}
                    {childCategoriesByParentId[category.id]?.map((childCategory) => (
                      <TableRow key={childCategory.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <ChevronRight size={14} className="mr-2 text-gray-400" />
                            {childCategory.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">{childCategory.slug}</TableCell>
                        <TableCell>{category.name}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${childCategory.is_visible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {childCategory.is_visible ? 'Visible' : 'Hidden'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openEditModal(childCategory)}
                            >
                              <Pencil size={14} className="mr-1" />
                              Edit
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => openDeleteModal(childCategory)}
                            >
                              <Trash2 size={14} className="mr-1" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Render modals */}
      {renderEditModal()}
      {renderDeleteModal()}
    </div>
  );
};

export default AdminCategories;