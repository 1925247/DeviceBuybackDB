import React, { useState, useEffect } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
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
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { Smartphone, Trash2, Edit, Plus, X, Loader, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

// Define types
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
  image: string;
  brand_id: number;
  device_type_id: number;
  active: boolean;
  featured: boolean;
  variants: string[] | null;
  description?: string;
  specs?: any;
  brand?: Brand;
  deviceType?: DeviceType;
  created_at?: string;
  updated_at?: string;
}

interface ValuationPrice {
  condition: string;
  price: number | string;
  multiplier: number;
}

interface ModelFormData {
  name: string;
  brand_id: string;
  device_type_id: string;
  image: string;
  active: boolean;
  featured: boolean;
  variants: string[];
  description: string;
  base_price: string;
  valuations: ValuationPrice[];
}

const DEFAULT_VALUATIONS = [
  { condition: 'Excellent', price: '', multiplier: 1.0 },
  { condition: 'Good', price: '', multiplier: 0.8 },
  { condition: 'Fair', price: '', multiplier: 0.6 },
  { condition: 'Poor', price: '', multiplier: 0.4 }
];

const AdminModels: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<DeviceModel | null>(null);
  const [formData, setFormData] = useState<ModelFormData>({
    name: '',
    brand_id: '',
    device_type_id: '',
    image: '',
    active: true,
    featured: false,
    variants: [''],
    description: '',
    base_price: '',
    valuations: [...DEFAULT_VALUATIONS]
  });

  const { toast } = useToast();

  // Query hooks for fetching data
  const { data: deviceTypes, isLoading: isLoadingDeviceTypes } = useQuery<DeviceType[]>({
    queryKey: ['/api/device-types'],
  });

  const { data: brands, isLoading: isLoadingBrands } = useQuery<Brand[]>({
    queryKey: ['/api/brands'],
  });

  const { data: models, isLoading: isLoadingModels, refetch: refetchModels } = useQuery<DeviceModel[]>({
    queryKey: ['/api/device-models'],
  });

  // Mutation hooks for creating, updating, and deleting models
  const createModelMutation = useMutation({
    mutationFn: async (data: any) => {
      // First create the model
      const response = await fetch('/api/device-models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data.model),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create model');
      }
      
      const newModel = await response.json();
      
      // Then create the valuations for the model
      if (data.valuations && data.valuations.length > 0) {
        for (const valuation of data.valuations) {
          await fetch('/api/valuations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              device_model_id: newModel.id,
              condition: valuation.condition,
              base_price: parseFloat(valuation.price.toString()),
              condition_multiplier: valuation.multiplier,
              active: true
            }),
          });
        }
      }
      
      return newModel;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/device-models'] });
      queryClient.invalidateQueries({ queryKey: ['/api/valuations'] });
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
    mutationFn: async (data: any) => {
      // First update the model
      const response = await fetch(`/api/device-models/${data.model.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data.model),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update model');
      }
      
      const updatedModel = await response.json();
      
      // Then update the valuations for the model
      // First, delete existing valuations
      await fetch(`/api/valuations/model/${updatedModel.id}`, {
        method: 'DELETE',
      });
      
      // Then create new valuations
      if (data.valuations && data.valuations.length > 0) {
        for (const valuation of data.valuations) {
          await fetch('/api/valuations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              device_model_id: updatedModel.id,
              condition: valuation.condition,
              base_price: parseFloat(valuation.price.toString()),
              condition_multiplier: valuation.multiplier,
              active: true,
              variant: data.model.variant || null
            }),
          });
        }
      }
      
      return updatedModel;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/device-models'] });
      queryClient.invalidateQueries({ queryKey: ['/api/valuations'] });
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
      // First delete all valuations for this model
      await fetch(`/api/valuations/model/${id}`, {
        method: 'DELETE',
      });
      
      // Then delete the model
      const response = await fetch(`/api/device-models/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete model');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/device-models'] });
      queryClient.invalidateQueries({ queryKey: ['/api/valuations'] });
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
      brand_id: '',
      device_type_id: '',
      image: '',
      active: true,
      featured: false,
      variants: [''],
      description: '',
      base_price: '',
      valuations: [...DEFAULT_VALUATIONS]
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleVariantChange = (index: number, value: string) => {
    const updatedVariants = [...formData.variants];
    updatedVariants[index] = value;
    setFormData((prev) => ({ ...prev, variants: updatedVariants }));
  };

  const handleValuationChange = (index: number, field: 'price', value: string) => {
    const updatedValuations = [...formData.valuations];
    updatedValuations[index] = { ...updatedValuations[index], [field]: value };
    
    // Update base price if changing the Excellent condition price
    if (index === 0 && field === 'price' && value) {
      setFormData((prev) => ({ 
        ...prev, 
        base_price: value,
        valuations: updatedValuations 
      }));
    } else {
      setFormData((prev) => ({ ...prev, valuations: updatedValuations }));
    }
  };

  const addVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, '']
    }));
  };

  const removeVariant = (index: number) => {
    if (formData.variants.length > 1) {
      const updatedVariants = formData.variants.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, variants: updatedVariants }));
    }
  };

  const handleAddModel = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty variants
    const filteredVariants = formData.variants.filter(v => v.trim() !== '');
    
    // Calculate pricing for different conditions
    const valuations = formData.valuations.map(v => ({
      ...v,
      price: v.price || (parseFloat(formData.base_price) * v.multiplier).toString()
    }));
    
    // Prepare model data
    const modelData = {
      model: {
        name: formData.name,
        brand_id: parseInt(formData.brand_id),
        device_type_id: parseInt(formData.device_type_id),
        image: formData.image,
        active: formData.active,
        featured: formData.featured,
        variants: filteredVariants.length > 0 ? filteredVariants : null,
        description: formData.description || null,
        slug: formData.name.toLowerCase().replace(/\s+/g, '-')
      },
      valuations: valuations
    };
    
    createModelMutation.mutate(modelData);
  };

  const handleEditModel = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedModel) {
      // Filter out empty variants
      const filteredVariants = formData.variants.filter(v => v.trim() !== '');
      
      // Calculate pricing for different conditions
      const valuations = formData.valuations.map(v => ({
        ...v,
        price: v.price || (parseFloat(formData.base_price) * v.multiplier).toString()
      }));
      
      // Prepare model data
      const modelData = {
        model: {
          id: selectedModel.id,
          name: formData.name,
          brand_id: parseInt(formData.brand_id),
          device_type_id: parseInt(formData.device_type_id),
          image: formData.image,
          active: formData.active,
          featured: formData.featured,
          variants: filteredVariants.length > 0 ? filteredVariants : null,
          description: formData.description || null,
          slug: formData.name.toLowerCase().replace(/\s+/g, '-')
        },
        valuations: valuations
      };
      
      updateModelMutation.mutate(modelData);
    }
  };

  const handleDeleteModel = () => {
    if (selectedModel) {
      deleteModelMutation.mutate(selectedModel.id);
    }
  };

  const openEditModal = (model: DeviceModel) => {
    setSelectedModel(model);
    
    // Fetch valuations for this model
    const fetchValuations = async () => {
      try {
        const response = await fetch(`/api/valuations?deviceModelId=${model.id}`);
        const valuationData = await response.json();
        
        let modelValuations = [...DEFAULT_VALUATIONS];
        
        // If we have valuations in the database, use them
        if (valuationData && valuationData.length > 0) {
          // Map valuations to our format
          modelValuations = modelValuations.map(defaultVal => {
            const match = valuationData.find((v: any) => 
              v.condition.toLowerCase() === defaultVal.condition.toLowerCase()
            );
            
            if (match) {
              return {
                condition: defaultVal.condition,
                price: match.base_price.toString(),
                multiplier: match.condition_multiplier
              };
            }
            
            return defaultVal;
          });
        }
        
        // Get the base price (price for excellent condition)
        const basePrice = modelValuations[0]?.price || '';
        
        setFormData({
          name: model.name,
          brand_id: model.brand_id.toString(),
          device_type_id: model.device_type_id.toString(),
          image: model.image || '',
          active: model.active,
          featured: model.featured,
          variants: model.variants || [''],
          description: model.description || '',
          base_price: basePrice.toString(),
          valuations: modelValuations
        });
        
        setIsEditModalOpen(true);
      } catch (error) {
        console.error("Error fetching valuations:", error);
        
        // Still open the edit modal with default values
        setFormData({
          name: model.name,
          brand_id: model.brand_id.toString(),
          device_type_id: model.device_type_id.toString(),
          image: model.image || '',
          active: model.active,
          featured: model.featured,
          variants: model.variants || [''],
          description: model.description || '',
          base_price: '',
          valuations: [...DEFAULT_VALUATIONS]
        });
        
        setIsEditModalOpen(true);
      }
    };
    
    fetchValuations();
  };

  const openDeleteModal = (model: DeviceModel) => {
    setSelectedModel(model);
    setIsDeleteModalOpen(true);
  };

  // When base price changes, update all condition prices
  useEffect(() => {
    if (formData.base_price) {
      const basePrice = parseFloat(formData.base_price);
      if (!isNaN(basePrice)) {
        const updatedValuations = formData.valuations.map(v => ({
          ...v,
          price: (basePrice * v.multiplier).toFixed(2)
        }));
        
        setFormData(prev => ({
          ...prev,
          valuations: updatedValuations
        }));
      }
    }
  }, [formData.base_price]);

  if (isLoadingDeviceTypes || isLoadingBrands || isLoadingModels) {
    return (
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Device Models</h1>
        </div>
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading device models...</p>
        </div>
      </div>
    );
  }

  // Group models by device type
  const modelsByType: Record<string, DeviceModel[]> = {};
  models?.forEach(model => {
    const deviceType = model.deviceType?.name || 'Other';
    if (!modelsByType[deviceType]) {
      modelsByType[deviceType] = [];
    }
    modelsByType[deviceType].push(model);
  });

  const deviceTypeOptions = Object.keys(modelsByType);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Device Models</h1>
        <div className="flex space-x-2">
          <Button onClick={() => refetchModels()} variant="outline">
            Refresh
          </Button>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                <Plus size={16} />
                Add New Model
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Device Model</DialogTitle>
                <DialogDescription>
                  Create a new device model with variants and pricing.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddModel} className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Model Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., iPhone 15 Pro"
                      />
                    </div>
                    
                    <div>
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
                    
                    <div>
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
                    
                    <div>
                      <Label htmlFor="image">Image URL</Label>
                      <Input
                        id="image"
                        name="image"
                        value={formData.image}
                        onChange={handleInputChange}
                        placeholder="/assets/models/iphone-15-pro.png"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter the path to the image. For local images, use the format "/assets/models/filename.png".
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Brief description of the model"
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="active"
                        checked={formData.active}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange('active', checked as boolean)
                        }
                      />
                      <Label htmlFor="active" className="cursor-pointer">Active</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="featured"
                        checked={formData.featured}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange('featured', checked as boolean)
                        }
                      />
                      <Label htmlFor="featured" className="cursor-pointer">Featured</Label>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Variants</Label>
                        <Button 
                          type="button" 
                          onClick={addVariant}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="h-3.5 w-3.5 mr-1" /> Add Variant
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        {formData.variants.map((variant, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              value={variant}
                              onChange={(e) => handleVariantChange(index, e.target.value)}
                              placeholder="e.g., 128GB, 256GB, etc."
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeVariant(index)}
                              disabled={formData.variants.length <= 1}
                              className="h-9 w-9"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Add storage options or other variants.
                      </p>
                    </div>
                    
                    <div className="mt-6">
                      <div className="mb-2">
                        <Label htmlFor="base_price">Base Price (Excellent Condition)</Label>
                        <Input
                          id="base_price"
                          name="base_price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.base_price}
                          onChange={handleInputChange}
                          required
                          placeholder="e.g., 999.99"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          The price for a device in excellent condition.
                        </p>
                      </div>
                      
                      <div className="mt-4">
                        <Label>Condition-based Pricing</Label>
                        <div className="mt-2 space-y-3 border rounded-md p-3">
                          {formData.valuations.map((valuation, index) => (
                            <div key={index} className="grid grid-cols-2 gap-2">
                              <div className="font-medium text-sm flex items-center">
                                {valuation.condition} ({(valuation.multiplier * 100).toFixed(0)}%)
                              </div>
                              <div>
                                <Input
                                  value={valuation.price.toString()}
                                  onChange={(e) => handleValuationChange(index, 'price', e.target.value)}
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  placeholder={`${valuation.condition} price`}
                                  disabled={index === 0} // Excellent is tied to base price
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Prices are calculated automatically based on condition multipliers.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <DialogFooter className="mt-6">
                  <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createModelMutation.isPending}>
                    {createModelMutation.isPending ? (
                      <><Loader size={16} className="mr-2 animate-spin" /> Creating...</>
                    ) : (
                      'Create Model'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <div className="flex-shrink-0 mt-0.5">
            <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Device Models Management</h3>
            <div className="mt-1 text-sm text-blue-700">
              <p>Here you can manage all device models available for buyback and sales. Use this page to:</p>
              <ul className="list-disc ml-5 mt-1 space-y-1">
                <li>Add new device models with their storage variants</li>
                <li>Set pricing for different storage options and conditions</li>
                <li>Edit existing devices or update their images</li>
                <li>Manage which models are active in the buyback/sales system</li>
              </ul>
              <p className="mt-1 font-medium">Click the "Add New Model" button to create a new device.</p>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue={deviceTypeOptions[0] || 'all'} className="mb-6">
        <TabsList className="mb-2">
          {deviceTypeOptions.map((type) => (
            <TabsTrigger key={type} value={type}>
              {type} ({modelsByType[type].length})
            </TabsTrigger>
          ))}
        </TabsList>

        {deviceTypeOptions.map((type) => (
          <TabsContent key={type} value={type}>
            <Card>
              <CardHeader>
                <CardTitle>{type} Models</CardTitle>
                <CardDescription>
                  Manage {type.toLowerCase()} models and their configurations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {modelsByType[type].length > 0 ? (
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Brand</TableHead>
                          <TableHead>Variants</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {modelsByType[type].map((model) => (
                          <TableRow key={model.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {model.image ? (
                                  <div className="h-8 w-8 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
                                    <img 
                                      src={model.image} 
                                      alt={model.name} 
                                      className="h-full w-full object-contain"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/assets/placeholder.png';
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <div className="h-8 w-8 rounded bg-gray-100 flex items-center justify-center">
                                    <Smartphone size={16} className="text-gray-500" />
                                  </div>
                                )}
                                <div>
                                  <p className="font-medium">{model.name}</p>
                                  <p className="text-xs text-gray-500">ID: {model.id}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {model.brand?.name || 'Unknown Brand'}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {model.variants ? (
                                  model.variants.map((variant, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {variant}
                                    </Badge>
                                  ))
                                ) : (
                                  <span className="text-gray-500 text-sm">No variants</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Badge variant={model.active ? "success" : "secondary"} className="whitespace-nowrap">
                                  {model.active ? 'Active' : 'Inactive'}
                                </Badge>
                                {model.featured && (
                                  <Badge variant="default" className="bg-amber-500">
                                    Featured
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEditModal(model)}
                                  title="Edit Model"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openDeleteModal(model)}
                                  className="text-red-600 hover:text-red-800"
                                  title="Delete Model"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500">No {type.toLowerCase()} models found.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Device Model</DialogTitle>
            <DialogDescription>
              Update the device model details, variants, and pricing.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditModel} className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">Model Name</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
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
                
                <div>
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
                
                <div>
                  <Label htmlFor="edit-image">Image URL</Label>
                  <Input
                    id="edit-image"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the path to the image. For local images, use the format "/assets/models/filename.png".
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Brief description of the model"
                    rows={3}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-active"
                    checked={formData.active}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange('active', checked as boolean)
                    }
                  />
                  <Label htmlFor="edit-active" className="cursor-pointer">Active</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange('featured', checked as boolean)
                    }
                  />
                  <Label htmlFor="edit-featured" className="cursor-pointer">Featured</Label>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Variants</Label>
                    <Button 
                      type="button" 
                      onClick={addVariant}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add Variant
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {formData.variants.map((variant, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={variant}
                          onChange={(e) => handleVariantChange(index, e.target.value)}
                          placeholder="e.g., 128GB, 256GB, etc."
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeVariant(index)}
                          disabled={formData.variants.length <= 1}
                          className="h-9 w-9"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Add storage options or other variants.
                  </p>
                </div>
                
                <div className="mt-6">
                  <div className="mb-2">
                    <Label htmlFor="edit-base_price">Base Price (Excellent Condition)</Label>
                    <Input
                      id="edit-base_price"
                      name="base_price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.base_price}
                      onChange={handleInputChange}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      The price for a device in excellent condition.
                    </p>
                  </div>
                  
                  <div className="mt-4">
                    <Label>Condition-based Pricing</Label>
                    <div className="mt-2 space-y-3 border rounded-md p-3">
                      {formData.valuations.map((valuation, index) => (
                        <div key={index} className="grid grid-cols-2 gap-2">
                          <div className="font-medium text-sm flex items-center">
                            {valuation.condition} ({(valuation.multiplier * 100).toFixed(0)}%)
                          </div>
                          <div>
                            <Input
                              value={valuation.price.toString()}
                              onChange={(e) => handleValuationChange(index, 'price', e.target.value)}
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder={`${valuation.condition} price`}
                              disabled={index === 0} // Excellent is tied to base price
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Prices are calculated automatically based on condition multipliers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateModelMutation.isPending}>
                {updateModelMutation.isPending ? (
                  <><Loader size={16} className="mr-2 animate-spin" /> Updating...</>
                ) : (
                  'Update Model'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Device Model</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this device model? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedModel && (
            <div className="py-4">
              <div className="bg-gray-50 p-4 rounded-md space-y-2">
                <div className="flex items-center gap-2">
                  {selectedModel.image && (
                    <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
                      <img 
                        src={selectedModel.image} 
                        alt={selectedModel.name} 
                        className="h-full w-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/placeholder.png';
                        }}
                      />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{selectedModel.name}</p>
                    <p className="text-sm text-gray-500">{selectedModel.brand?.name}</p>
                  </div>
                </div>
                
                {selectedModel.variants && selectedModel.variants.length > 0 && (
                  <div>
                    <p className="text-sm font-medium">Variants:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedModel.variants.map((variant, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {variant}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <p className="text-sm text-red-600">
                  <strong>Warning:</strong> This will also delete all associated valuations and pricing data.
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteModel}
              disabled={deleteModelMutation.isPending}
            >
              {deleteModelMutation.isPending ? (
                <><Loader size={16} className="mr-2 animate-spin" /> Deleting...</>
              ) : (
                'Delete Model'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminModels;