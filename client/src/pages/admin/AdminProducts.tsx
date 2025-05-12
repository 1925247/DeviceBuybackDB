import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import FileUpload from '@/components/ui/file-upload';
import { 
  Package2, 
  PlusCircle, 
  Pencil, 
  Trash2, 
  Tag, 
  DollarSign, 
  CheckCircle2,
  XCircle,
  BarChart4,
  Search,
  Eye,
  Copy,
  ArrowUpDown,
  Filter
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

import { formatCurrency, generateSKU, slugify } from '@/lib/utils';

// Form schema for product
const productFormSchema = z.object({
  title: z.string().min(2, {
    message: "Product title must be at least 2 characters.",
  }),
  slug: z.string().min(2, {
    message: "Slug must be at least 2 characters.",
  }).optional(),
  sku: z.string().min(4, {
    message: "SKU must be at least 4 characters.",
  }).optional(),
  description: z.string().optional().nullable(),
  price: z.coerce.number().min(0, {
    message: "Price must be a positive number.",
  }),
  compare_at_price: z.coerce.number().min(0, {
    message: "Compare at price must be a positive number.",
  }).optional().nullable(),
  cost_price: z.coerce.number().min(0, {
    message: "Cost price must be a positive number.",
  }).optional().nullable(),
  status: z.enum(["active", "draft", "archived"]).default("active"),
  featured: z.boolean().default(false),
  tax_exempt: z.boolean().default(false),
  requires_shipping: z.boolean().default(true),
  is_physical: z.boolean().default(true),
  stock_quantity: z.coerce.number().int().min(0).default(0),
  backorder_allowed: z.boolean().default(false),
  track_inventory: z.boolean().default(true),
  categories: z.array(z.number()).default([]),
  tags: z.array(z.string()).default([]),
  brand_id: z.number().optional().nullable(),
  device_model_id: z.number().optional().nullable(),
  weight: z.coerce.number().min(0).optional().nullable(),
  dimensions: z.object({
    length: z.coerce.number().min(0).optional().nullable(),
    width: z.coerce.number().min(0).optional().nullable(),
    height: z.coerce.number().min(0).optional().nullable(),
  }).optional(),
  seo_title: z.string().optional().nullable(),
  seo_description: z.string().optional().nullable(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

// Component for each product row in the table
const ProductRow = ({ product, onEdit, onDelete }: { product: any, onEdit: (product: any) => void, onDelete: (id: number) => void }) => (
  <TableRow>
    <TableCell>
      <div className="flex items-center">
        {product.images && product.images[0] ? (
          <div className="w-10 h-10 rounded mr-2 bg-gray-100 overflow-hidden">
            <img 
              src={product.images[0].url} 
              alt={product.title} 
              className="w-full h-full object-cover" 
            />
          </div>
        ) : (
          <div className="w-10 h-10 rounded mr-2 bg-gray-100 flex items-center justify-center">
            <Package2 size={16} className="text-gray-400" />
          </div>
        )}
        <div>
          <div className="font-medium">{product.title}</div>
          <div className="text-xs text-gray-500">{product.sku}</div>
        </div>
      </div>
    </TableCell>
    <TableCell>
      {product.status === 'active' && (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Active
        </Badge>
      )}
      {product.status === 'draft' && (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          Draft
        </Badge>
      )}
      {product.status === 'archived' && (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
          Archived
        </Badge>
      )}
    </TableCell>
    <TableCell>{formatCurrency(product.price)}</TableCell>
    <TableCell>
      {product.stock_quantity > 10 ? (
        <span className="text-green-600">{product.stock_quantity}</span>
      ) : product.stock_quantity > 0 ? (
        <span className="text-yellow-600">{product.stock_quantity}</span>
      ) : (
        <span className="text-red-600">Out of stock</span>
      )}
    </TableCell>
    <TableCell>
      {product.categories?.map((category: any) => (
        <Badge key={category.id} variant="secondary" className="mr-1">
          {category.name}
        </Badge>
      ))}
    </TableCell>
    <TableCell>{new Date(product.created_at).toLocaleDateString()}</TableCell>
    <TableCell>
      <div className="flex space-x-2">
        <Button variant="ghost" size="icon" onClick={() => window.open(`/buy/details/${product.slug}`, '_blank')}>
          <Eye className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onEdit(product)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(product.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </TableCell>
  </TableRow>
);

// Main Products Page Component
const AdminProducts = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<any>(null);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch products
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return response.json();
    }
  });

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

  // Filter products based on search and filters
  const filteredProducts = React.useMemo(() => {
    return products.filter((product: any) => {
      // Search term filter
      const matchesSearch = searchTerm === '' || 
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(product.id).includes(searchTerm);
      
      // Status filter
      const matchesStatus = statusFilter === null || product.status === statusFilter;
      
      // Category filter
      const matchesCategory = categoryFilter === null || 
        (product.categories && product.categories.some((cat: any) => cat.id === categoryFilter));
      
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [products, searchTerm, statusFilter, categoryFilter]);

  // Add product mutation
  const addProductMutation = useMutation({
    mutationFn: async (product: ProductFormValues) => {
      const response = await apiRequest('POST', '/api/products', product);
      if (!response.ok) {
        throw new Error('Failed to add product');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Product added',
        description: 'Product has been successfully added',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
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

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, product }: { id: number, product: ProductFormValues }) => {
      const response = await apiRequest('PUT', `/api/products/${id}`, product);
      if (!response.ok) {
        throw new Error('Failed to update product');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Product updated',
        description: 'Product has been successfully updated',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setIsAddDialogOpen(false);
      setCurrentProduct(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/products/${id}`);
      if (!response.ok) {
        throw new Error('Failed to delete product');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Product deleted',
        description: 'Product has been successfully deleted',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
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

  // Form setup
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      title: '',
      slug: '',
      sku: generateSKU('P'),
      description: '',
      price: 0,
      compare_at_price: null,
      cost_price: null,
      status: 'draft',
      featured: false,
      tax_exempt: false,
      requires_shipping: true,
      is_physical: true,
      stock_quantity: 0,
      backorder_allowed: false,
      track_inventory: true,
      categories: [],
      tags: [],
      brand_id: null,
      device_model_id: null,
      weight: null,
      dimensions: {
        length: null,
        width: null,
        height: null,
      },
      seo_title: null,
      seo_description: null,
    }
  });

  // Handle form submission
  const onSubmit = (values: ProductFormValues) => {
    if (!values.slug) {
      values.slug = slugify(values.title);
    }
    
    if (currentProduct) {
      updateProductMutation.mutate({ id: currentProduct.id, product: values });
    } else {
      addProductMutation.mutate(values);
    }
  };

  // Handle edit button click
  const handleEdit = (product: any) => {
    setCurrentProduct(product);
    form.reset({
      title: product.title,
      slug: product.slug,
      sku: product.sku,
      description: product.description,
      price: product.price,
      compare_at_price: product.compare_at_price,
      cost_price: product.cost_price,
      status: product.status,
      featured: product.featured,
      tax_exempt: product.tax_exempt,
      requires_shipping: product.requires_shipping,
      is_physical: product.is_physical,
      stock_quantity: product.stock_quantity,
      backorder_allowed: product.backorder_allowed,
      track_inventory: product.track_inventory,
      categories: product.categories ? product.categories.map((cat: any) => cat.id) : [],
      tags: product.tags ? product.tags.map((tag: any) => tag.name) : [],
      brand_id: product.brand_id,
      device_model_id: product.device_model_id,
      weight: product.weight,
      dimensions: {
        length: product.dimensions?.length || null,
        width: product.dimensions?.width || null,
        height: product.dimensions?.height || null,
      },
      seo_title: product.seo_title,
      seo_description: product.seo_description,
    });
    setIsAddDialogOpen(true);
  };

  // Handle delete button click
  const handleDelete = (id: number) => {
    setProductToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  // Confirm deletion
  const confirmDelete = () => {
    if (productToDelete) {
      deleteProductMutation.mutate(productToDelete);
    }
  };

  // Handle title change to update slug
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    form.setValue('title', title);
    
    // Only auto-update slug if it's a new product or slug is empty
    if (!currentProduct || !form.getValues().slug) {
      form.setValue('slug', slugify(title));
    }
  };

  // Handle dialog open/close
  const openAddDialog = () => {
    form.reset({
      title: '',
      slug: '',
      sku: generateSKU('P'),
      description: '',
      price: 0,
      compare_at_price: null,
      cost_price: null,
      status: 'draft',
      featured: false,
      tax_exempt: false,
      requires_shipping: true,
      is_physical: true,
      stock_quantity: 0,
      backorder_allowed: false,
      track_inventory: true,
      categories: [],
      tags: [],
      brand_id: null,
      device_model_id: null,
      weight: null,
      dimensions: {
        length: null,
        width: null,
        height: null,
      },
      seo_title: null,
      seo_description: null,
    });
    setCurrentProduct(null);
    setIsAddDialogOpen(true);
  };

  const closeAddDialog = () => {
    setIsAddDialogOpen(false);
    setCurrentProduct(null);
  };

  // Calculate product statistics
  const productStats = React.useMemo(() => {
    return {
      total: products.length,
      active: products.filter((p: any) => p.status === 'active').length,
      draft: products.filter((p: any) => p.status === 'draft').length,
      archived: products.filter((p: any) => p.status === 'archived').length,
      outOfStock: products.filter((p: any) => p.stock_quantity === 0).length,
      lowStock: products.filter((p: any) => p.stock_quantity > 0 && p.stock_quantity <= 5).length,
    };
  }, [products]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-gray-500">Manage your product catalog</p>
        </div>
        <Button onClick={openAddDialog}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Products</p>
                <h3 className="text-2xl font-bold">{productStats.total}</h3>
              </div>
              <Package2 className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active</p>
                <h3 className="text-2xl font-bold text-green-600">{productStats.active}</h3>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Draft</p>
                <h3 className="text-2xl font-bold text-yellow-600">{productStats.draft}</h3>
              </div>
              <Pencil className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Archived</p>
                <h3 className="text-2xl font-bold text-gray-600">{productStats.archived}</h3>
              </div>
              <Archive className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Out of Stock</p>
                <h3 className="text-2xl font-bold text-red-600">{productStats.outOfStock}</h3>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Low Stock</p>
                <h3 className="text-2xl font-bold text-amber-600">{productStats.lowStock}</h3>
              </div>
              <AlertCircle className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative w-full sm:w-1/3">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input 
            placeholder="Search products..." 
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select
            value={statusFilter || ""}
            onValueChange={(value) => setStatusFilter(value || null)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={categoryFilter?.toString() || ""}
            onValueChange={(value) => setCategoryFilter(value ? parseInt(value) : null)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">All categories</SelectItem>
              {categories.map((category: any) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchTerm('');
              setStatusFilter(null);
              setCategoryFilter(null);
            }}
          >
            Clear filters
          </Button>
        </div>
      </div>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Inventory</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingProducts ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                    </div>
                    <div className="mt-2">Loading products...</div>
                  </TableCell>
                </TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <div className="flex justify-center">
                      <Package2 className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="mt-2">No products found</div>
                    <div className="mt-1 text-sm text-gray-500">
                      {searchTerm || statusFilter || categoryFilter 
                        ? 'Try adjusting your filters'
                        : 'Add your first product to get started'
                      }
                    </div>
                    {!searchTerm && !statusFilter && !categoryFilter && (
                      <Button variant="outline" className="mt-4" onClick={openAddDialog}>
                        Add Product
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product: any) => (
                  <ProductRow 
                    key={product.id} 
                    product={product} 
                    onEdit={handleEdit} 
                    onDelete={handleDelete} 
                  />
                ))
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={7} className="text-right">
                  {filteredProducts.length} of {products.length} products
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Product Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{currentProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
              {currentProduct ? 'Update the product details below.' : 'Fill in the details to add a new product to your catalog.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid grid-cols-5 w-full">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="pricing">Pricing</TabsTrigger>
                  <TabsTrigger value="inventory">Inventory</TabsTrigger>
                  <TabsTrigger value="organization">Organization</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>
                
                {/* Basic Info Tab */}
                <TabsContent value="basic" className="space-y-4 py-4">
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter product name" 
                              {...field} 
                              onChange={handleTitleChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="slug"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Slug</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="product-url-slug" 
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
                        name="sku"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SKU</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="SKU123" 
                                {...field} 
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormDescription>
                              Stock Keeping Unit (unique product code)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter product description" 
                              className="min-h-32" 
                              {...field} 
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Product Images Upload */}
                    <div>
                      <FormLabel>Product Images</FormLabel>
                      <div className="mt-2">
                        <FileUpload
                          label="Main Product Image"
                          description="Upload the primary image for this product"
                          initialUrl={currentProduct?.images?.[0]?.url || ''}
                          onFileChange={(file) => {
                            setProductImage(file);
                          }}
                          onUrlChange={(url) => {
                            setProductImageUrl(url);
                          }}
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Additional images can be added after saving the product
                      </p>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Product visibility status
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="featured"
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
                              Featured Product
                            </FormLabel>
                            <FormDescription>
                              Display this product prominently on the homepage and feature sections
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
                
                {/* Pricing Tab */}
                <TabsContent value="pricing" className="space-y-4 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                                <DollarSign className="h-4 w-4" />
                              </span>
                              <Input 
                                type="number" 
                                step="0.01" 
                                min="0" 
                                placeholder="0.00" 
                                className="pl-10"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Current selling price
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="compare_at_price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Compare at Price</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                                <DollarSign className="h-4 w-4" />
                              </span>
                              <Input 
                                type="number" 
                                step="0.01" 
                                min="0" 
                                placeholder="0.00" 
                                className="pl-10"
                                {...field}
                                value={field.value === null ? '' : field.value}
                                onChange={(e) => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Original price (to show discounts)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="cost_price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cost Price</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                                <DollarSign className="h-4 w-4" />
                              </span>
                              <Input 
                                type="number" 
                                step="0.01" 
                                min="0" 
                                placeholder="0.00" 
                                className="pl-10"
                                {...field}
                                value={field.value === null ? '' : field.value}
                                onChange={(e) => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Your cost (for profit calculations)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Separator />
                  
                  <FormField
                    control={form.control}
                    name="tax_exempt"
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
                            Tax Exempt
                          </FormLabel>
                          <FormDescription>
                            This product is exempt from taxes
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </TabsContent>
                
                {/* Inventory Tab */}
                <TabsContent value="inventory" className="space-y-4 py-4">
                  <FormField
                    control={form.control}
                    name="track_inventory"
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
                            Track Inventory
                          </FormLabel>
                          <FormDescription>
                            Track stock counts for this product
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="stock_quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stock Quantity</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              placeholder="0" 
                              {...field}
                              disabled={!form.watch('track_inventory')}
                            />
                          </FormControl>
                          <FormDescription>
                            Current stock level
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="space-y-3">
                      <FormField
                        control={form.control}
                        name="backorder_allowed"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!form.watch('track_inventory')}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Allow Backorders
                              </FormLabel>
                              <FormDescription>
                                Allow customers to purchase when out of stock
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="requires_shipping"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Requires Shipping
                              </FormLabel>
                              <FormDescription>
                                This product requires shipping
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Product Type</h3>
                    
                    <FormField
                      control={form.control}
                      name="is_physical"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormControl>
                            <RadioGroup
                              onValueChange={(value) => field.onChange(value === 'physical')}
                              defaultValue={field.value ? 'physical' : 'digital'}
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="physical" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Physical product
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="digital" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Digital product
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {form.watch('is_physical') && (
                    <div className="space-y-4 pt-4">
                      <h3 className="text-lg font-medium">Shipping Information</h3>
                      
                      <FormField
                        control={form.control}
                        name="weight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weight (in kg)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01" 
                                min="0" 
                                placeholder="0.00" 
                                {...field}
                                value={field.value === null ? '' : field.value}
                                onChange={(e) => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="dimensions.length"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Length (cm)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.1" 
                                  min="0" 
                                  placeholder="0.0" 
                                  {...field}
                                  value={field.value === null ? '' : field.value}
                                  onChange={(e) => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="dimensions.width"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Width (cm)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.1" 
                                  min="0" 
                                  placeholder="0.0" 
                                  {...field}
                                  value={field.value === null ? '' : field.value}
                                  onChange={(e) => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="dimensions.height"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Height (cm)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.1" 
                                  min="0" 
                                  placeholder="0.0" 
                                  {...field}
                                  value={field.value === null ? '' : field.value}
                                  onChange={(e) => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                {/* Organization Tab */}
                <TabsContent value="organization" className="space-y-4 py-4">
                  <FormField
                    control={form.control}
                    name="categories"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categories</FormLabel>
                        <FormDescription>
                          Select categories for this product
                        </FormDescription>
                        <div className="mt-2 space-y-2">
                          {isLoadingCategories ? (
                            <div className="animate-pulse h-20 bg-gray-100 rounded"></div>
                          ) : categories.length === 0 ? (
                            <div className="text-sm text-gray-500">
                              No categories found. Create categories first.
                            </div>
                          ) : (
                            categories.map((category: any) => (
                              <div key={category.id} className="flex items-center space-x-2">
                                <Checkbox 
                                  id={`category-${category.id}`} 
                                  checked={field.value.includes(category.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      field.onChange([...field.value, category.id]);
                                    } else {
                                      field.onChange(field.value.filter((id: number) => id !== category.id));
                                    }
                                  }}
                                />
                                <Label htmlFor={`category-${category.id}`}>{category.name}</Label>
                              </div>
                            ))
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="brand_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(value !== "none" ? parseInt(value) : null)}
                            value={field.value?.toString() || "none"}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select brand" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              {/* Map brands here when available */}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="device_model_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Device Model</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(value !== "none" ? parseInt(value) : null)}
                            value={field.value?.toString() || "none"}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select device model" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              {/* Map device models here when available */}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
                
                {/* Advanced Tab */}
                <TabsContent value="advanced" className="space-y-4 py-4">
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
                              placeholder="SEO title (if different from product name)" 
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
                </TabsContent>
              </Tabs>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeAddDialog}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={addProductMutation.isPending || updateProductMutation.isPending}
                >
                  {(addProductMutation.isPending || updateProductMutation.isPending) && (
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                  )}
                  {currentProduct ? 'Update Product' : 'Add Product'}
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
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete} 
              disabled={deleteProductMutation.isPending}
            >
              {deleteProductMutation.isPending && (
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

// Missing component definition
const Archive = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="5" x="2" y="3" rx="1" />
    <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
    <path d="M10 12h4" />
  </svg>
);

const AlertCircle = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" x2="12" y1="8" y2="12" />
    <line x1="12" x2="12.01" y1="16" y2="16" />
  </svg>
);

export default AdminProducts;