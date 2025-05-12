import React, { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiRequest } from '@/lib/queryClient';

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
}

interface Valuation {
  id: number;
  device_model_id: number;
  base_price: string;
  condition_excellent: string;
  condition_good: string;
  condition_fair: string;
  condition_poor: string;
  variant_multipliers?: Record<string, number> | null;
  created_at: string;
  updated_at: string;
}

interface ValuationWithModelInfo extends Valuation {
  model_name: string;
  brand_name: string;
  device_type_name: string;
}

const AdminPricing: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedValuation, setSelectedValuation] = useState<ValuationWithModelInfo | null>(null);
  const [selectedDeviceType, setSelectedDeviceType] = useState<number | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    device_model_id: '',
    base_price: '',
    condition_excellent: '100',
    condition_good: '80',
    condition_fair: '60',
    condition_poor: '40',
    variant_multipliers: {} as Record<string, number>,
  });
  const [variantKeys, setVariantKeys] = useState<string[]>([]);
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

  const { data: valuations, isLoading: isLoadingValuations } = useQuery<Valuation[]>({
    queryKey: ['/api/valuations'],
  });

  // Filtered models based on selected device type and brand
  const filteredModels = deviceModels?.filter(model => {
    let matches = true;
    if (selectedDeviceType !== null) {
      matches = matches && Number(model.device_type_id) === Number(selectedDeviceType);
    }
    if (selectedBrand !== null) {
      matches = matches && Number(model.brand_id) === Number(selectedBrand);
    }
    return matches;
  });

  // Enriched valuations with model, brand, and device type names
  const enrichedValuations: ValuationWithModelInfo[] = React.useMemo(() => {
    if (!valuations || !deviceModels || !brands || !deviceTypes) return [];

    return valuations.map(valuation => {
      const model = deviceModels.find(m => Number(m.id) === Number(valuation.device_model_id));
      const brand = model ? brands.find(b => Number(b.id) === Number(model.brand_id)) : null;
      const deviceType = model ? deviceTypes.find(dt => Number(dt.id) === Number(model.device_type_id)) : null;

      return {
        ...valuation,
        model_name: model?.name || 'Unknown Model',
        brand_name: brand?.name || 'Unknown Brand',
        device_type_name: deviceType?.name || 'Unknown Type',
      };
    });
  }, [valuations, deviceModels, brands, deviceTypes]);

  // Mutation hooks for creating, updating, and deleting valuations
  const createValuationMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest('POST', '/api/valuations', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/valuations'] });
      setIsAddModalOpen(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Valuation created successfully',
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

  const updateValuationMutation = useMutation({
    mutationFn: async (data: typeof formData & { id: number }) => {
      return await apiRequest('PUT', `/api/valuations/${data.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/valuations'] });
      setIsEditModalOpen(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Valuation updated successfully',
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

  const deleteValuationMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('DELETE', `/api/valuations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/valuations'] });
      setIsDeleteModalOpen(false);
      setSelectedValuation(null);
      toast({
        title: 'Success',
        description: 'Valuation deleted successfully',
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
      device_model_id: '',
      base_price: '',
      condition_excellent: '100',
      condition_good: '80',
      condition_fair: '60',
      condition_poor: '40',
      variant_multipliers: {},
    });
    setVariantKeys([]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));

    // If this is a device model change, update variant options
    if (name === 'device_model_id') {
      const modelId = Number(value);
      const model = deviceModels?.find(m => Number(m.id) === modelId);
      if (model && model.variants && model.variants.length > 0) {
        const newVariantMultipliers = { ...formData.variant_multipliers };
        model.variants.forEach(variant => {
          if (!newVariantMultipliers[variant]) {
            newVariantMultipliers[variant] = 1;
          }
        });
        setFormData(prev => ({ ...prev, variant_multipliers: newVariantMultipliers }));
        setVariantKeys(model.variants);
      } else {
        setFormData(prev => ({ ...prev, variant_multipliers: {} }));
        setVariantKeys([]);
      }
    }
  };

  const handleVariantInputChange = (variant: string, value: string) => {
    const numValue = parseFloat(value) || 1;
    setFormData(prev => ({
      ...prev,
      variant_multipliers: {
        ...prev.variant_multipliers,
        [variant]: numValue,
      },
    }));
  };

  const handleAddValuation = (e: React.FormEvent) => {
    e.preventDefault();
    const processedData = {
      ...formData,
      device_model_id: parseInt(formData.device_model_id),
      base_price: parseFloat(formData.base_price),
      condition_excellent: parseFloat(formData.condition_excellent),
      condition_good: parseFloat(formData.condition_good),
      condition_fair: parseFloat(formData.condition_fair),
      condition_poor: parseFloat(formData.condition_poor),
      variant_multipliers: Object.keys(formData.variant_multipliers).length > 0 ? formData.variant_multipliers : null,
    };
    createValuationMutation.mutate(processedData as any);
  };

  const handleEditValuation = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedValuation) {
      const processedData = {
        ...formData,
        id: selectedValuation.id,
        device_model_id: parseInt(formData.device_model_id),
        base_price: parseFloat(formData.base_price),
        condition_excellent: parseFloat(formData.condition_excellent),
        condition_good: parseFloat(formData.condition_good),
        condition_fair: parseFloat(formData.condition_fair),
        condition_poor: parseFloat(formData.condition_poor),
        variant_multipliers: Object.keys(formData.variant_multipliers).length > 0 ? formData.variant_multipliers : null,
      };
      updateValuationMutation.mutate(processedData as any);
    }
  };

  const handleDeleteValuation = () => {
    if (selectedValuation) {
      deleteValuationMutation.mutate(selectedValuation.id);
    }
  };

  const openEditModal = (valuation: ValuationWithModelInfo) => {
    setSelectedValuation(valuation);
    
    // Find model to get variants
    const model = deviceModels?.find(m => m.id === valuation.device_model_id);
    const variants = model?.variants || [];
    setVariantKeys(variants);
    
    setFormData({
      device_model_id: valuation.device_model_id.toString(),
      base_price: valuation.base_price,
      condition_excellent: valuation.condition_excellent,
      condition_good: valuation.condition_good,
      condition_fair: valuation.condition_fair,
      condition_poor: valuation.condition_poor,
      variant_multipliers: valuation.variant_multipliers || {},
    });
    
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (valuation: ValuationWithModelInfo) => {
    setSelectedValuation(valuation);
    setIsDeleteModalOpen(true);
  };

  // Loading state
  if (isLoadingDeviceTypes || isLoadingBrands || isLoadingDeviceModels || isLoadingValuations) {
    return (
      <div className="py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Device Valuations</h1>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
          Add New Valuation
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Valuation</DialogTitle>
          <DialogDescription>
            Create a new valuation for a device model.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleAddValuation} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="device_model_id">Device Model</Label>
            <Select 
              value={formData.device_model_id} 
              onValueChange={(value) => handleSelectChange('device_model_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {filteredModels?.map((model) => (
                  <SelectItem key={model.id} value={model.id.toString()}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="base_price">Base Price ($)</Label>
            <Input
              id="base_price"
              name="base_price"
              type="number"
              step="0.01"
              min="0"
              value={formData.base_price}
              onChange={handleInputChange}
              required
            />
            <p className="text-xs text-gray-500">
              The standard price for this device model in excellent condition.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="condition_excellent">Excellent (%)</Label>
              <Input
                id="condition_excellent"
                name="condition_excellent"
                type="number"
                min="0"
                max="100"
                value={formData.condition_excellent}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="condition_good">Good (%)</Label>
              <Input
                id="condition_good"
                name="condition_good"
                type="number"
                min="0"
                max="100"
                value={formData.condition_good}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="condition_fair">Fair (%)</Label>
              <Input
                id="condition_fair"
                name="condition_fair"
                type="number"
                min="0"
                max="100"
                value={formData.condition_fair}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="condition_poor">Poor (%)</Label>
              <Input
                id="condition_poor"
                name="condition_poor"
                type="number"
                min="0"
                max="100"
                value={formData.condition_poor}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          
          {variantKeys.length > 0 && (
            <div className="space-y-2">
              <Label>Variant Multipliers</Label>
              <div className="space-y-4 border rounded-md p-4">
                {variantKeys.map((variant) => (
                  <div key={variant} className="flex items-center space-x-2">
                    <Label className="w-1/2">{variant}</Label>
                    <Input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={formData.variant_multipliers[variant] || 1}
                      onChange={(e) => handleVariantInputChange(variant, e.target.value)}
                      className="w-1/2"
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                Multipliers applied to the base price for each variant.
              </p>
            </div>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createValuationMutation.isPending}>
              {createValuationMutation.isPending ? 'Creating...' : 'Create Valuation'}
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
          <DialogTitle>Edit Valuation</DialogTitle>
          <DialogDescription>
            Update the valuation details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleEditValuation} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-device_model_id">Device Model</Label>
            <Select 
              value={formData.device_model_id} 
              onValueChange={(value) => handleSelectChange('device_model_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {deviceModels?.map((model) => (
                  <SelectItem key={model.id} value={model.id.toString()}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-base_price">Base Price ($)</Label>
            <Input
              id="edit-base_price"
              name="base_price"
              type="number"
              step="0.01"
              min="0"
              value={formData.base_price}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-condition_excellent">Excellent (%)</Label>
              <Input
                id="edit-condition_excellent"
                name="condition_excellent"
                type="number"
                min="0"
                max="100"
                value={formData.condition_excellent}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-condition_good">Good (%)</Label>
              <Input
                id="edit-condition_good"
                name="condition_good"
                type="number"
                min="0"
                max="100"
                value={formData.condition_good}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-condition_fair">Fair (%)</Label>
              <Input
                id="edit-condition_fair"
                name="condition_fair"
                type="number"
                min="0"
                max="100"
                value={formData.condition_fair}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-condition_poor">Poor (%)</Label>
              <Input
                id="edit-condition_poor"
                name="condition_poor"
                type="number"
                min="0"
                max="100"
                value={formData.condition_poor}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          
          {variantKeys.length > 0 && (
            <div className="space-y-2">
              <Label>Variant Multipliers</Label>
              <div className="space-y-4 border rounded-md p-4">
                {variantKeys.map((variant) => (
                  <div key={variant} className="flex items-center space-x-2">
                    <Label className="w-1/2">{variant}</Label>
                    <Input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={formData.variant_multipliers[variant] || 1}
                      onChange={(e) => handleVariantInputChange(variant, e.target.value)}
                      className="w-1/2"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateValuationMutation.isPending}>
              {updateValuationMutation.isPending ? 'Updating...' : 'Update Valuation'}
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
          <DialogTitle>Delete Valuation</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this valuation? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="font-medium">
            {selectedValuation?.model_name} ({selectedValuation?.brand_name})
          </p>
          <p className="text-sm text-gray-500">
            Base Price: ${selectedValuation?.base_price}
          </p>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDeleteValuation}
            disabled={deleteValuationMutation.isPending}
          >
            {deleteValuationMutation.isPending ? 'Deleting...' : 'Delete Valuation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const formatPrice = (price: string) => {
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const formatPercentage = (value: string) => {
    return `${parseFloat(value)}%`;
  };

  return (
    <div className="py-8 px-4">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Device Valuations</h1>
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
              {deviceTypes?.map((deviceType) => (
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
              {brands?.map((brand) => (
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
            <CardTitle>Total Valuations</CardTitle>
            <CardDescription>Total number of valuations</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{enrichedValuations.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Average Base Price</CardTitle>
            <CardDescription>Average base price across all models</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              {enrichedValuations.length > 0 ? 
                formatPrice((enrichedValuations.reduce(
                  (sum, v) => sum + parseFloat(v.base_price), 0
                ) / enrichedValuations.length).toFixed(2)) : 
                '$0.00'
              }
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Models Covered</CardTitle>
            <CardDescription>Number of device models with valuations</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              {new Set(enrichedValuations.map(v => v.device_model_id)).size}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableCaption>List of device valuations</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Device Model</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Base Price</TableHead>
              <TableHead>Excellent</TableHead>
              <TableHead>Good</TableHead>
              <TableHead>Fair</TableHead>
              <TableHead>Poor</TableHead>
              <TableHead>Variants</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enrichedValuations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                  No valuations found. Add your first valuation using the button above.
                </TableCell>
              </TableRow>
            ) : (
              enrichedValuations.map((valuation) => (
                <TableRow key={valuation.id}>
                  <TableCell className="font-medium">{valuation.model_name}</TableCell>
                  <TableCell>{valuation.brand_name}</TableCell>
                  <TableCell>{valuation.device_type_name}</TableCell>
                  <TableCell>{formatPrice(valuation.base_price)}</TableCell>
                  <TableCell>{formatPercentage(valuation.condition_excellent)}</TableCell>
                  <TableCell>{formatPercentage(valuation.condition_good)}</TableCell>
                  <TableCell>{formatPercentage(valuation.condition_fair)}</TableCell>
                  <TableCell>{formatPercentage(valuation.condition_poor)}</TableCell>
                  <TableCell>
                    {valuation.variant_multipliers ? 
                      Object.keys(valuation.variant_multipliers).length : 
                      0}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => openEditModal(valuation)}
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        onClick={() => openDeleteModal(valuation)}
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

export default AdminPricing;