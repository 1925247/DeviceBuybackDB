import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  FolderTree, 
  PlusCircle, 
  Pencil, 
  Trash2, 
  ImageIcon,
  Save,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Search
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { slugify } from '@/lib/utils';

// Form schema for category
const categoryFormSchema = z.object({
  name: z.string().min(2, {
    message: "Category name must be at least 2 characters.",
  }),
  slug: z.string().min(2, {
    message: "Slug must be at least 2 characters.",
  }).optional(),
  description: z.string().optional().nullable(),
  parent_id: z.number().optional().nullable(),
  image: z.string().optional().nullable(),
  is_visible: z.boolean().default(true),
  seo_title: z.string().optional().nullable(),
  seo_description: z.string().optional().nullable()
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

// Component for each category row in the table
const CategoryRow = ({ category, categories, onEdit, onDelete, onToggleVisibility }: { 
  category: any, 
  categories: any[], 
  onEdit: (category: any) => void, 
  onDelete: (id: number) => void,
  onToggleVisibility: (id: number, isVisible: boolean) => void
}) => {
  const getParentName = (parentId: number | null) => {
    if (!parentId) return "None";
    const parent = categories.find((c: any) => c.id === parentId);
    return parent ? parent.name : "Unknown";
  };

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center">
          {category.image ? (
            <div className="w-10 h-10 rounded mr-2 bg-gray-100 overflow-hidden">
              <img 
                src={category.image} 
                alt={category.name} 
                className="w-full h-full object-cover" 
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded mr-2 bg-gray-100 flex items-center justify-center">
              <FolderTree size={16} className="text-gray-400" />
            </div>
          )}
          <div>
            <div className="font-medium">{category.name}</div>
            <div className="text-xs text-gray-500">{category.slug}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>{getParentName(category.parent_id)}</TableCell>
      <TableCell>
        {category.is_visible ? (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Visible
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            Hidden
          </Badge>
        )}
      </TableCell>
      <TableCell className="hidden md:table-cell">{new Date(category.created_at).toLocaleDateString()}</TableCell>
      <TableCell>
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onToggleVisibility(category.id, !category.is_visible)}
            title={category.is_visible ? "Hide category" : "Show category"}
          >
            {category.is_visible ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onEdit(category)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(category.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

// Main Categories Page Component
const AdminCategories = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<any>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch categories
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      return response.json();
    }
  });

  // Sort and filter categories
  const filteredCategories = React.useMemo(() => {
    let sorted = [...categories];
    
    // Sort by name
    sorted.sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });

    // Filter by search term
    return sorted.filter(category => 
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(category.id).includes(searchTerm)
    );
  }, [categories, searchTerm, sortOrder]);

  // Add category mutation
  const addCategoryMutation = useMutation({
    mutationFn: async (category: CategoryFormValues) => {
      const response = await apiRequest('POST', '/api/categories', category);
      if (!response.ok) {
        throw new Error('Failed to add category');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Category added',
        description: 'Category has been successfully added',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, category }: { id: number, category: CategoryFormValues }) => {
      const response = await apiRequest('PUT', `/api/categories/${id}`, category);
      if (!response.ok) {
        throw new Error('Failed to update category');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Category updated',
        description: 'Category has been successfully updated',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      setIsAddDialogOpen(false);
      setCurrentCategory(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/categories/${id}`);
      if (!response.ok) {
        throw new Error('Failed to delete category');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Category deleted',
        description: 'Category has been successfully deleted',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Toggle category visibility mutation
  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({ id, isVisible }: { id: number, isVisible: boolean }) => {
      const response = await apiRequest('PUT', `/api/categories/${id}`, { is_visible: isVisible });
      if (!response.ok) {
        throw new Error('Failed to update category visibility');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Visibility updated',
        description: 'Category visibility has been updated',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Form setup
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      parent_id: null,
      image: '',
      is_visible: true,
      seo_title: '',
      seo_description: ''
    }
  });

  // Handle form submission
  const onSubmit = (values: CategoryFormValues) => {
    if (!values.slug) {
      values.slug = slugify(values.name);
    }
    
    if (currentCategory) {
      updateCategoryMutation.mutate({ id: currentCategory.id, category: values });
    } else {
      addCategoryMutation.mutate(values);
    }
  };

  // Handle edit button click
  const handleEdit = (category: any) => {
    setCurrentCategory(category);
    form.reset({
      name: category.name,
      slug: category.slug,
      description: category.description,
      parent_id: category.parent_id,
      image: category.image,
      is_visible: category.is_visible,
      seo_title: category.seo_title,
      seo_description: category.seo_description
    });
    setIsAddDialogOpen(true);
  };

  // Handle delete button click
  const handleDelete = (id: number) => {
    setCategoryToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  // Handle visibility toggle
  const handleToggleVisibility = (id: number, isVisible: boolean) => {
    toggleVisibilityMutation.mutate({ id, isVisible });
  };

  // Confirm deletion
  const confirmDelete = () => {
    if (categoryToDelete) {
      deleteCategoryMutation.mutate(categoryToDelete);
    }
  };

  // Handle title change to update slug
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    form.setValue('name', name);
    
    // Only auto-update slug if it's a new category or slug is empty
    if (!currentCategory || !form.getValues().slug) {
      form.setValue('slug', slugify(name));
    }
  };

  // Sort toggle handler
  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  // Handle dialog open/close
  const openAddDialog = () => {
    form.reset({
      name: '',
      slug: '',
      description: '',
      parent_id: null,
      image: '',
      is_visible: true,
      seo_title: '',
      seo_description: ''
    });
    setCurrentCategory(null);
    setIsAddDialogOpen(true);
  };

  const closeAddDialog = () => {
    setIsAddDialogOpen(false);
    setCurrentCategory(null);
  };

  // Check if any category has children
  const hasChildren = (categoryId: number) => {
    return categories.some((c: any) => c.parent_id === categoryId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-gray-500">Manage your product categories</p>
        </div>
        <Button onClick={openAddDialog}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative w-full sm:w-1/3">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input 
            placeholder="Search categories..." 
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button 
          variant="outline" 
          onClick={toggleSortOrder}
          className="flex items-center"
        >
          Sort by Name {sortOrder === 'asc' ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
        </Button>
      </div>

      {/* Categories Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingCategories ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                    </div>
                    <div className="mt-2">Loading categories...</div>
                  </TableCell>
                </TableRow>
              ) : filteredCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    <div className="flex justify-center">
                      <FolderTree className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="mt-2">No categories found</div>
                    <div className="mt-1 text-sm text-gray-500">
                      {searchTerm 
                        ? 'Try adjusting your search query'
                        : 'Add your first category to get started'
                      }
                    </div>
                    {!searchTerm && (
                      <Button variant="outline" className="mt-4" onClick={openAddDialog}>
                        Add Category
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredCategories.map((category: any) => (
                  <CategoryRow 
                    key={category.id} 
                    category={category}
                    categories={categories}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleVisibility={handleToggleVisibility}
                  />
                ))
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={5} className="text-right">
                  {filteredCategories.length} of {categories.length} categories
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Category Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>{currentCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
            <DialogDescription>
              {currentCategory ? 'Update the category details below.' : 'Fill in the details to add a new category.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter category name" 
                            {...field} 
                            onChange={handleNameChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="category-url-slug" 
                            {...field} 
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormDescription>
                          URL-friendly name (auto-generated from title)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="parent_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parent Category</FormLabel>
                        <FormControl>
                          <select 
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={field.value?.toString() || ''}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                          >
                            <option value="">None (Top Level)</option>
                            {categories
                              .filter((c: any) => !currentCategory || c.id !== currentCategory.id)
                              .map((category: any) => (
                                <option 
                                  key={category.id} 
                                  value={category.id}
                                  disabled={currentCategory && hasChildren(currentCategory.id) && category.parent_id === currentCategory.id}
                                >
                                  {category.name}
                                </option>
                              ))
                            }
                          </select>
                        </FormControl>
                        <FormDescription>
                          Select a parent category (optional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://example.com/image.jpg" 
                            {...field} 
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormDescription>
                          URL to category image (optional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="is_visible"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Visible
                          </FormLabel>
                          <FormDescription>
                            Show this category on the website
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter category description" 
                        className="min-h-20" 
                        {...field} 
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">SEO Information</h3>
                
                <FormField
                  control={form.control}
                  name="seo_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SEO Title</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="SEO title (if different from category name)" 
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Recommended: 50-60 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="seo_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SEO Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="SEO meta description" 
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Recommended: 150-160 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeAddDialog}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={addCategoryMutation.isPending || updateCategoryMutation.isPending}
                >
                  {(addCategoryMutation.isPending || updateCategoryMutation.isPending) && (
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                  )}
                  {currentCategory ? 'Update Category' : 'Add Category'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this category? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {categories.some((c: any) => c.parent_id === categoryToDelete) && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                This category has subcategories. Deleting it will make them top-level categories.
              </AlertDescription>
            </Alert>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete} 
              disabled={deleteCategoryMutation.isPending}
            >
              {deleteCategoryMutation.isPending && (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCategories;