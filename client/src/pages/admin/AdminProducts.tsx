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
import { PlusCircle, Pencil, Trash2, Image as ImageIcon, Tag, Box } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';

interface Product {
  id: number;
  title: string;
  slug: string;
  price: string;
  description?: string;
  sku: string;
  status: 'active' | 'draft' | 'archived';
  partner_id?: number;
  region_id?: number;
  category_id?: number;
  brand_id?: number;
  model_id?: number;
  device_type_id?: number;
  featured: boolean;
  is_refurbished: boolean;
  condition?: string;
  images?: string[];
  main_image?: string;
  inventory_quantity: number;
  created_at: string;
  updated_at: string;
  seo_title?: string;
  seo_description?: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent_id?: number;
}

interface Brand {
  id: number;
  name: string;
  slug: string;
  logo?: string;
}

interface DeviceType {
  id: number;
  name: string;
  slug: string;
  icon?: string;
}

interface Model {
  id: number;
  name: string;
  device_type_id: number;
  brand_id: number;
}

const AdminProducts: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    price: '',
    description: '',
    sku: '',
    status: 'draft',
    partner_id: '',
    region_id: '',
    category_id: '',
    brand_id: '',
    model_id: '',
    device_type_id: '',
    featured: false,
    is_refurbished: true,
    condition: 'refurbished',
    inventory_quantity: 1,
    seo_title: '',
    seo_description: '',
  });
  const { toast } = useToast();

  // Query hooks for fetching data
  const { data: products, isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ['/api/products', selectedCategory, selectedTab, searchQuery],
    queryFn: async () => {
      let url = '/api/products';
      const params: string[] = [];
      
      if (selectedCategory) {
        params.push(`category_id=${selectedCategory}`);
      }
      
      if (selectedTab !== 'all') {
        params.push(`status=${selectedTab}`);
      }
      
      if (searchQuery) {
        params.push(`search=${encodeURIComponent(searchQuery)}`);
      }
      
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }
      
      return apiRequest('GET', url).then(res => res.json());
    },
  });

  const { data: categories, isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    retry: 1,
  });

  const { data: brands, isLoading: isLoadingBrands } = useQuery<Brand[]>({
    queryKey: ['/api/brands'],
    retry: 1,
  });

  const { data: deviceTypes, isLoading: isLoadingDeviceTypes } = useQuery<DeviceType[]>({
    queryKey: ['/api/device-types'],
    retry: 1,
  });

  const { data: models, isLoading: isLoadingModels } = useQuery<Model[]>({
    queryKey: ['/api/device-models', formData.brand_id, formData.device_type_id],
    queryFn: async () => {
      let url = '/api/device-models';
      const params: string[] = [];
      
      if (formData.brand_id) {
        params.push(`brand_id=${formData.brand_id}`);
      }
      
      if (formData.device_type_id) {
        params.push(`device_type_id=${formData.device_type_id}`);
      }
      
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }
      
      return apiRequest('GET', url).then(res => res.json());
    },
    enabled: !!(formData.brand_id || formData.device_type_id),
  });

  // Mutation hooks for CRUD operations
  const createProductMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest('POST', '/api/products', {
        ...data,
        price: parseFloat(data.price),
        inventory_quantity: parseInt(data.inventory_quantity.toString()),
        partner_id: data.partner_id ? parseInt(data.partner_id) : null,
        region_id: data.region_id ? parseInt(data.region_id) : null,
        category_id: data.category_id ? parseInt(data.category_id) : null,
        brand_id: data.brand_id ? parseInt(data.brand_id) : null,
        model_id: data.model_id ? parseInt(data.model_id) : null,
        device_type_id: data.device_type_id ? parseInt(data.device_type_id) : null,
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setIsAddModalOpen(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Product created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create product',
        variant: 'destructive',
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async (data: typeof formData & { id: number }) => {
      return apiRequest('PUT', `/api/products/${data.id}`, {
        ...data,
        price: parseFloat(data.price),
        inventory_quantity: parseInt(data.inventory_quantity.toString()),
        partner_id: data.partner_id ? parseInt(data.partner_id) : null,
        region_id: data.region_id ? parseInt(data.region_id) : null,
        category_id: data.category_id ? parseInt(data.category_id) : null,
        brand_id: data.brand_id ? parseInt(data.brand_id) : null,
        model_id: data.model_id ? parseInt(data.model_id) : null,
        device_type_id: data.device_type_id ? parseInt(data.device_type_id) : null,
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setIsEditModalOpen(false);
      setSelectedProduct(null);
      resetForm();
      toast({
        title: 'Success',
        description: 'Product updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update product',
        variant: 'destructive',
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setIsDeleteModalOpen(false);
      setSelectedProduct(null);
      toast({
        title: 'Success',
        description: 'Product deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete product',
        variant: 'destructive',
      });
    },
  });

  // Helper functions
  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      price: '',
      description: '',
      sku: '',
      status: 'draft',
      partner_id: '',
      region_id: '',
      category_id: '',
      brand_id: '',
      model_id: '',
      device_type_id: '',
      featured: false,
      is_refurbished: true,
      condition: 'refurbished',
      inventory_quantity: 1,
      seo_title: '',
      seo_description: '',
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // If changing device type or brand, clear model
    if (name === 'device_type_id' || name === 'brand_id') {
      setFormData(prev => ({ ...prev, model_id: '' }));
    }
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleGenerateSlug = () => {
    if (!formData.title) return;
    const slug = formData.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setFormData(prev => ({ ...prev, slug }));
  };

  const handleGenerateSku = () => {
    if (!formData.title) return;
    
    const brand = formData.brand_id && brands 
      ? brands.find(b => b.id.toString() === formData.brand_id)?.name.substring(0, 3).toUpperCase() 
      : 'PRD';
      
    const model = formData.model_id && models
      ? models.find(m => m.id.toString() === formData.model_id)?.name.substring(0, 2).toUpperCase()
      : '';
      
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    const sku = `${brand}${model}${random}`;
    setFormData(prev => ({ ...prev, sku }));
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title || !formData.slug || !formData.price || !formData.sku) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    createProductMutation.mutate(formData);
  };

  const handleEditProduct = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct) return;
    
    // Basic validation
    if (!formData.title || !formData.slug || !formData.price || !formData.sku) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    updateProductMutation.mutate({
      ...formData,
      id: selectedProduct.id,
    });
  };

  const handleDeleteProduct = () => {
    if (selectedProduct) {
      deleteProductMutation.mutate(selectedProduct.id);
    }
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      title: product.title,
      slug: product.slug,
      price: product.price,
      description: product.description || '',
      sku: product.sku,
      status: product.status,
      partner_id: product.partner_id ? product.partner_id.toString() : '',
      region_id: product.region_id ? product.region_id.toString() : '',
      category_id: product.category_id ? product.category_id.toString() : '',
      brand_id: product.brand_id ? product.brand_id.toString() : '',
      model_id: product.model_id ? product.model_id.toString() : '',
      device_type_id: product.device_type_id ? product.device_type_id.toString() : '',
      featured: product.featured,
      is_refurbished: product.is_refurbished,
      condition: product.condition || 'refurbished',
      inventory_quantity: product.inventory_quantity,
      seo_title: product.seo_title || '',
      seo_description: product.seo_description || '',
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const getCategoryName = (categoryId?: number) => {
    if (!categoryId || !categories) return 'Uncategorized';
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown Category';
  };

  const getBrandName = (brandId?: number) => {
    if (!brandId || !brands) return 'Unbranded';
    const brand = brands.find(b => b.id === brandId);
    return brand ? brand.name : 'Unknown Brand';
  };

  // Loading state
  if (isLoadingProducts && isLoadingCategories) {
    return (
      <div className="py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Product Management</h1>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  const statusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const renderAddEditForm = (isEdit: boolean = false) => (
    <form onSubmit={isEdit ? handleEditProduct : handleAddProduct} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4 md:col-span-2">
          <div>
            <Label htmlFor="title">Product Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Refurbished iPhone 12 Pro"
              required
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-grow">
              <Label htmlFor="slug">Slug</Label>
              <div className="flex gap-2">
                <Input
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  placeholder="e.g., refurbished-iphone-12-pro"
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
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Detailed product description"
              className="min-h-[120px]"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="price">Price ($)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={handleNumberInputChange}
              placeholder="e.g., 799.99"
              required
            />
          </div>

          <div>
            <Label htmlFor="sku">SKU</Label>
            <div className="flex gap-2">
              <Input
                id="sku"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                placeholder="e.g., IPH12P-001"
                required
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleGenerateSku}
                className="whitespace-nowrap"
              >
                Generate
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="inventory_quantity">Inventory Quantity</Label>
            <Input
              id="inventory_quantity"
              name="inventory_quantity"
              type="number"
              min="0"
              step="1"
              value={formData.inventory_quantity}
              onChange={handleNumberInputChange}
              placeholder="e.g., 10"
              required
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value) => handleSelectChange('status', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="condition">Condition</Label>
            <Select 
              value={formData.condition} 
              onValueChange={(value) => handleSelectChange('condition', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="refurbished">Refurbished</SelectItem>
                <SelectItem value="like-new">Like New</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="category_id">Category</Label>
            <Select 
              value={formData.category_id} 
              onValueChange={(value) => handleSelectChange('category_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Uncategorized</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="device_type_id">Device Type</Label>
            <Select 
              value={formData.device_type_id} 
              onValueChange={(value) => handleSelectChange('device_type_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select device type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {deviceTypes?.map((deviceType) => (
                  <SelectItem key={deviceType.id} value={deviceType.id.toString()}>
                    {deviceType.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="brand_id">Brand</Label>
            <Select 
              value={formData.brand_id} 
              onValueChange={(value) => handleSelectChange('brand_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {brands?.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id.toString()}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="model_id">Model</Label>
            <Select 
              value={formData.model_id} 
              onValueChange={(value) => handleSelectChange('model_id', value)}
              disabled={!formData.brand_id || !formData.device_type_id || isLoadingModels}
            >
              <SelectTrigger>
                <SelectValue placeholder={isLoadingModels ? "Loading models..." : "Select model"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {models?.map((model) => (
                  <SelectItem key={model.id} value={model.id.toString()}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2 pt-3">
            <Switch
              checked={formData.featured}
              onCheckedChange={(checked) => handleSwitchChange('featured', checked)}
              id="featured"
            />
            <Label htmlFor="featured">Featured Product</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.is_refurbished}
              onCheckedChange={(checked) => handleSwitchChange('is_refurbished', checked)}
              id="is_refurbished"
            />
            <Label htmlFor="is_refurbished">Refurbished Product</Label>
          </div>
        </div>

        <div className="space-y-4 md:col-span-2">
          <h3 className="text-lg font-medium">SEO Settings</h3>
          <div>
            <Label htmlFor="seo_title">SEO Title</Label>
            <Input
              id="seo_title"
              name="seo_title"
              value={formData.seo_title}
              onChange={handleInputChange}
              placeholder="SEO-optimized title (leave blank to use product title)"
            />
          </div>

          <div>
            <Label htmlFor="seo_description">SEO Description</Label>
            <Textarea
              id="seo_description"
              name="seo_description"
              value={formData.seo_description}
              onChange={handleInputChange}
              placeholder="SEO-optimized description"
              className="min-h-[80px]"
            />
          </div>
        </div>

        <div className="space-y-4 md:col-span-2">
          <h3 className="text-lg font-medium">Product Images</h3>
          <div className="border-2 border-dashed rounded-md p-8 text-center">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-2 text-sm text-gray-500">
              Image upload functionality will be implemented soon.
            </p>
          </div>
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
          disabled={isEdit ? updateProductMutation.isPending : createProductMutation.isPending}
        >
          {isEdit 
            ? (updateProductMutation.isPending ? 'Updating...' : 'Update Product') 
            : (createProductMutation.isPending ? 'Creating...' : 'Create Product')
          }
        </Button>
      </DialogFooter>
    </form>
  );

  const renderAddModal = () => (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Add New Product</DialogTitle>
        <DialogDescription>
          Create a new product for your marketplace.
        </DialogDescription>
      </DialogHeader>
      {renderAddEditForm(false)}
    </DialogContent>
  );

  const renderEditModal = () => (
    <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Update the product details.
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
          <DialogTitle>Delete Product</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this product? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="font-medium">
            {selectedProduct?.title}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            SKU: {selectedProduct?.sku}
          </p>
          <p className="text-sm text-gray-500">
            Price: ${selectedProduct?.price}
          </p>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDeleteProduct}
            disabled={deleteProductMutation.isPending}
          >
            {deleteProductMutation.isPending ? 'Deleting...' : 'Delete Product'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="py-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Product Management</h1>
          <p className="text-gray-500">Manage your marketplace products</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Product
            </Button>
          </DialogTrigger>
          {renderAddModal()}
        </Dialog>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Product Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search Products</Label>
                <Input
                  id="search"
                  placeholder="Search by title, SKU, or description"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category-filter">Category</Label>
                <Select 
                  value={selectedCategory ? selectedCategory.toString() : ''} 
                  onValueChange={(value) => setSelectedCategory(value ? parseInt(value) : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedTab === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTab('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={selectedTab === 'active' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTab('active')}
                  >
                    Active
                  </Button>
                  <Button
                    variant={selectedTab === 'draft' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTab('draft')}
                  >
                    Draft
                  </Button>
                  <Button
                    variant={selectedTab === 'archived' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTab('archived')}
                  >
                    Archived
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
            <CardDescription>
              Showing {products?.length || 0} products
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingProducts ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Inventory</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(!products || products.length === 0) ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No products found. Add your first product using the button above.
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                              {product.main_image ? (
                                <img 
                                  src={product.main_image} 
                                  alt={product.title} 
                                  className="w-full h-full object-cover rounded"
                                />
                              ) : (
                                <Box className="h-5 w-5 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{product.title}</p>
                              <p className="text-xs text-gray-500">{getBrandName(product.brand_id)}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                        <TableCell>${product.price}</TableCell>
                        <TableCell>
                          {product.inventory_quantity === 0 ? (
                            <span className="text-red-500">Out of stock</span>
                          ) : product.inventory_quantity < 5 ? (
                            <span className="text-yellow-500">{product.inventory_quantity} left</span>
                          ) : (
                            <span>{product.inventory_quantity}</span>
                          )}
                        </TableCell>
                        <TableCell>{getCategoryName(product.category_id)}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadgeClass(product.status)}`}>
                            {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openEditModal(product)}
                            >
                              <Pencil size={14} className="mr-1" />
                              Edit
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => openDeleteModal(product)}
                            >
                              <Trash2 size={14} className="mr-1" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Render modals */}
      {renderEditModal()}
      {renderDeleteModal()}
    </div>
  );
};

export default AdminProducts;