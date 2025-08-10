import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../lib/queryClient';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  Plus, 
  Upload, 
  Edit, 
  Trash2, 
  Settings, 
  DollarSign, 
  HelpCircle,
  Smartphone,
  Tag,
  Package,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Search,
  Filter,
  MoreVertical,
  Star
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const AdvancedModelIntegration = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [activeTab, setActiveTab] = useState('models');
  const [selectedModel, setSelectedModel] = useState(null);
  const [isCreatingModel, setIsCreatingModel] = useState(false);
  const [editingModel, setEditingModel] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  
  const [modelFormData, setModelFormData] = useState({
    name: '',
    brandId: '',
    deviceTypeId: '',
    description: '',
    image: null,
    featured: false
  });
  const [variantFormData, setVariantFormData] = useState({
    name: '',
    storage: '',
    color: '',
    condition: '',
    basePrice: ''
  });

  // Queries
  const { data: deviceTypes = [] } = useQuery({
    queryKey: ['/api/device-types'],
    queryFn: () => apiRequest('/api/device-types')
  });

  const { data: brands = [] } = useQuery({
    queryKey: ['/api/brands'],
    queryFn: () => apiRequest('/api/brands')
  });

  const { data: models = [], isLoading: modelsLoading } = useQuery({
    queryKey: ['/api/device-models', { includeDetails: true }],
    queryFn: () => apiRequest('/api/device-models?includeDetails=true')
  });

  const { data: questionGroups = [] } = useQuery({
    queryKey: ['/api/question-groups'],
    queryFn: () => apiRequest('/api/question-groups')
  });

  // Mutations
  const createModelMutation = useMutation({
    mutationFn: (formData) => {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          data.append(key, formData[key]);
        }
      });
      return apiRequest('/admin/models', {
        method: 'POST',
        body: data
      });
    },
    onSuccess: (data) => {
      toast({
        title: 'Success',
        description: 'Model created successfully'
      });
      resetForm();
      queryClient.invalidateQueries(['/api/device-models']);
      setSelectedModel(data);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create model',
        variant: 'destructive'
      });
    }
  });

  const updateModelMutation = useMutation({
    mutationFn: ({ id, formData }) => {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          data.append(key, formData[key]);
        }
      });
      return apiRequest(`/api/device-models/${id}`, {
        method: 'PUT',
        body: data
      });
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Model updated successfully'
      });
      resetForm();
      queryClient.invalidateQueries(['/api/device-models']);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update model',
        variant: 'destructive'
      });
    }
  });

  const deleteModelMutation = useMutation({
    mutationFn: (id) => apiRequest(`/api/device-models/${id}`, { method: 'DELETE' }),
    onSuccess: (_, deletedId) => {
      toast({
        title: 'Success',
        description: 'Model deleted successfully'
      });
      queryClient.invalidateQueries(['/api/device-models']);
      if (selectedModel?.id === deletedId) {
        setSelectedModel(null);
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete model',
        variant: 'destructive'
      });
    }
  });

  const createVariantMutation = useMutation({
    mutationFn: ({ modelId, variantData }) => 
      apiRequest(`/admin/models/${modelId}/variants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(variantData)
      }),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Variant added successfully'
      });
      setVariantFormData({
        name: '',
        storage: '',
        color: '',
        condition: '',
        basePrice: ''
      });
      queryClient.invalidateQueries(['/api/device-models']);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add variant',
        variant: 'destructive'
      });
    }
  });

  const deleteVariantMutation = useMutation({
    mutationFn: (variantId) => apiRequest(`/api/device-model-variants/${variantId}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Variant deleted successfully'
      });
      queryClient.invalidateQueries(['/api/device-models']);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete variant',
        variant: 'destructive'
      });
    }
  });

  // Utility functions
  const resetForm = () => {
    setIsCreatingModel(false);
    setEditingModel(null);
    setModelFormData({
      name: '',
      brandId: '',
      deviceTypeId: '',
      description: '',
      image: null,
      featured: false
    });
    setPreviewImage(null);
  };

  const loadModelForEdit = (model) => {
    setEditingModel(model);
    setModelFormData({
      name: model.name,
      brandId: model.brandId?.toString() || model.brand_id?.toString() || '',
      deviceTypeId: model.deviceTypeId?.toString() || model.device_type_id?.toString() || '',
      description: model.description || '',
      image: null,
      featured: model.featured || false
    });
    setPreviewImage(model.image);
    setIsCreatingModel(true);
  };

  // Event handlers
  const handleModelSubmit = (e) => {
    e.preventDefault();
    if (!editingModel && !modelFormData.image) {
      toast({
        title: 'Error',
        description: 'Model image is required for new models',
        variant: 'destructive'
      });
      return;
    }
    
    if (editingModel) {
      updateModelMutation.mutate({ id: editingModel.id, formData: modelFormData });
    } else {
      createModelMutation.mutate(modelFormData);
    }
  };

  const handleDeleteModel = (model) => {
    if (confirm(`Are you sure you want to delete "${model.name}"? This action cannot be undone.`)) {
      deleteModelMutation.mutate(model.id);
    }
  };

  const handleVariantSubmit = (e) => {
    e.preventDefault();
    if (!selectedModel) return;
    
    createVariantMutation.mutate({
      modelId: selectedModel.id,
      variantData: {
        ...variantFormData,
        basePrice: parseFloat(variantFormData.basePrice)
      }
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setModelFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Filter models based on search and brand
  const filteredModels = models.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBrand = !filterBrand || filterBrand === 'all' || model.brandId?.toString() === filterBrand || model.brand_id?.toString() === filterBrand;
    return matchesSearch && matchesBrand;
  });

  // Component renders
  const ModelForm = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          {editingModel ? 'Edit Model' : 'Create New Model'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleModelSubmit} className="space-y-6">
          {/* Image Preview Section */}
          {(previewImage || modelFormData.image) && (
            <div className="flex justify-center">
              <div className="relative">
                <img 
                  src={previewImage} 
                  alt="Model preview" 
                  className="w-32 h-32 object-cover rounded-lg border-2 border-dashed border-gray-300"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="absolute -top-2 -right-2 rounded-full h-8 w-8 p-0"
                  onClick={() => {
                    setPreviewImage(null);
                    setModelFormData(prev => ({ ...prev, image: null }));
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="modelName">Model Name *</Label>
              <Input
                id="modelName"
                value={modelFormData.name}
                onChange={(e) => setModelFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., iPhone 15 Pro"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="brand">Brand *</Label>
              <Select 
                value={modelFormData.brandId} 
                onValueChange={(value) => setModelFormData(prev => ({ ...prev, brandId: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map(brand => (
                    <SelectItem key={brand.id} value={brand.id.toString()}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="deviceType">Device Type *</Label>
              <Select 
                value={modelFormData.deviceTypeId} 
                onValueChange={(value) => setModelFormData(prev => ({ ...prev, deviceTypeId: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select device type" />
                </SelectTrigger>
                <SelectContent>
                  {deviceTypes.map(type => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="modelImage">Model Image {!editingModel && '*'}</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="modelImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  required={!editingModel}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('modelImage').click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {modelFormData.image ? 'Change Image' : (editingModel ? 'Update Image' : 'Upload Image')}
                </Button>
                {modelFormData.image && (
                  <span className="text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    {modelFormData.image.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={modelFormData.description}
              onChange={(e) => setModelFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Model description..."
              rows={3}
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={modelFormData.featured}
                onChange={(e) => setModelFormData(prev => ({ ...prev, featured: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                Featured Model
              </span>
            </label>
          </div>

          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={createModelMutation.isPending || updateModelMutation.isPending}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {(createModelMutation.isPending || updateModelMutation.isPending) 
                ? (editingModel ? 'Updating...' : 'Creating...') 
                : (editingModel ? 'Update Model' : 'Create Model')
              }
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={resetForm}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );

  const VariantManagement = ({ model }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Variant Pricing - {model?.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVariantSubmit} className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label>Variant Name</Label>
              <Input
                value={variantFormData.name}
                onChange={(e) => setVariantFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Pro Max"
                required
              />
            </div>
            <div>
              <Label>Storage</Label>
              <Input
                value={variantFormData.storage}
                onChange={(e) => setVariantFormData(prev => ({ ...prev, storage: e.target.value }))}
                placeholder="e.g., 256GB"
                required
              />
            </div>
            <div>
              <Label>Color</Label>
              <Input
                value={variantFormData.color}
                onChange={(e) => setVariantFormData(prev => ({ ...prev, color: e.target.value }))}
                placeholder="e.g., Space Black"
                required
              />
            </div>
            <div>
              <Label>Condition</Label>
              <Select 
                value={variantFormData.condition} 
                onValueChange={(value) => setVariantFormData(prev => ({ ...prev, condition: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="like-new">Like New</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Base Price (₹)</Label>
              <Input
                type="number"
                value={variantFormData.basePrice}
                onChange={(e) => setVariantFormData(prev => ({ ...prev, basePrice: e.target.value }))}
                placeholder="45000"
                required
              />
            </div>
          </div>
          <Button 
            type="submit" 
            disabled={createVariantMutation.isPending}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {createVariantMutation.isPending ? 'Adding...' : 'Add Variant'}
          </Button>
        </form>

        {/* Existing Variants Display */}
        {model?.variants && model.variants.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-lg">Existing Variants ({model.variants.length})</h4>
            </div>
            <div className="grid gap-3">
              {model.variants.map((variant, index) => (
                <div key={variant.id || index} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-base">{variant.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            <Package className="w-3 h-3 mr-1" />
                            {variant.storage}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {variant.color}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              variant.condition === 'new' ? 'bg-green-50 text-green-700 border-green-200' :
                              variant.condition === 'like-new' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              variant.condition === 'good' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                              'bg-orange-50 text-orange-700 border-orange-200'
                            }`}
                          >
                            {variant.condition}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-green-600 font-semibold text-lg">₹{variant.basePrice?.toLocaleString() || 0}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <HelpCircle className="w-4 h-4" />
                        Map Questions
                      </Button>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-xs">
                          <DialogHeader>
                            <DialogTitle>Variant Actions</DialogTitle>
                          </DialogHeader>
                          <div className="flex flex-col gap-2">
                            <Button variant="outline" className="justify-start">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Variant
                            </Button>
                            <Button 
                              variant="destructive" 
                              className="justify-start"
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete this variant "${variant.name}"?`)) {
                                  deleteVariantMutation.mutate(variant.id);
                                }
                                document.querySelector('[data-state="open"]')?.click();
                              }}
                              disabled={deleteVariantMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              {deleteVariantMutation.isPending ? 'Deleting...' : 'Delete Variant'}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                  
                  {variant.description && (
                    <p className="text-sm text-gray-600 mt-2">{variant.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {model?.variants?.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h4 className="font-medium text-gray-600 mb-1">No Variants Added</h4>
            <p className="text-sm text-gray-500">Add your first variant above to start pricing management</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const ModelsGrid = () => (
    <div className="space-y-6">
      {/* Header with Search and Filter Controls */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search models..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterBrand} onValueChange={setFilterBrand}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by brand" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Brands</SelectItem>
              {brands.map(brand => (
                <SelectItem key={brand.id} value={brand.id.toString()}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button 
          onClick={() => setIsCreatingModel(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add New Model
        </Button>
      </div>

      {/* Models Grid */}
      {modelsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-80 bg-gray-100 animate-pulse rounded-lg"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredModels.map((model) => (
            <Card 
              key={model.id} 
              className={`group transition-all hover:shadow-lg border-2 ${
                selectedModel?.id === model.id 
                  ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <CardContent className="p-0">
                {/* Model Image */}
                <div className="relative aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                  <img 
                    src={model.image || '/placeholder.png'} 
                    alt={model.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      e.target.src = '/placeholder.png';
                    }}
                  />
                  {model.featured && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-yellow-500 text-white">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        Featured
                      </Badge>
                    </div>
                  )}
                  
                  {/* Action Menu */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-8 w-8 p-0 bg-white/80 backdrop-blur-sm hover:bg-white"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-xs">
                        <DialogHeader>
                          <DialogTitle>Model Actions</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col gap-2">
                          <Button
                            variant="outline"
                            className="justify-start"
                            onClick={() => {
                              setSelectedModel(model);
                              document.querySelector('[data-state="open"]')?.click();
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                          <Button
                            variant="outline"
                            className="justify-start"
                            onClick={() => {
                              loadModelForEdit(model);
                              document.querySelector('[data-state="open"]')?.click();
                            }}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Model
                          </Button>
                          <Button
                            variant="destructive"
                            className="justify-start"
                            onClick={() => {
                              handleDeleteModel(model);
                              document.querySelector('[data-state="open"]')?.click();
                            }}
                            disabled={deleteModelMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {deleteModelMutation.isPending ? 'Deleting...' : 'Delete'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {/* Model Info */}
                <div className="p-4 space-y-3">
                  <div>
                    <h4 
                      className="font-semibold text-lg cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={() => setSelectedModel(model)}
                    >
                      {model.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {brands.find(b => b.id === model.brandId)?.name || brands.find(b => b.id === model.brand_id)?.name} • 
                      {deviceTypes.find(d => d.id === model.deviceTypeId)?.name || deviceTypes.find(d => d.id === model.device_type_id)?.name}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant={model.active !== false ? "default" : "secondary"}>
                      {model.active !== false ? "Active" : "Inactive"}
                    </Badge>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      {model.variants?.length || 0} variants
                    </span>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setSelectedModel(model)}
                    >
                      <Settings className="w-3 h-3 mr-1" />
                      Manage
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadModelForEdit(model)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredModels.length === 0 && !modelsLoading && (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <Smartphone className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-medium text-gray-600 mb-3">
              {searchTerm || filterBrand ? 'No Models Match Your Search' : 'No Models Found'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterBrand 
                ? 'Try adjusting your search criteria or create a new model.'
                : 'Start building your device catalog by creating your first model.'
              }
            </p>
            <div className="flex gap-3 justify-center">
              {(searchTerm || filterBrand) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterBrand('all');
                  }}
                >
                  Clear Filters
                </Button>
              )}
              <Button onClick={() => setIsCreatingModel(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Model
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Advanced Model Integration</h1>
          <p className="text-gray-600">Unified device management workflow</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="models" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Models
          </TabsTrigger>
          <TabsTrigger value="management" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Management
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Overview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-6">
          {isCreatingModel && <ModelForm />}
          <ModelsGrid />
        </TabsContent>

        <TabsContent value="management" className="space-y-6">
          {selectedModel ? (
            <VariantManagement model={selectedModel} />
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Select a Model</h3>
                  <p className="text-gray-500">Choose a model from the Models tab to manage variants and pricing</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{models.length}</p>
                    <p className="text-sm text-gray-600">Total Models</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Tag className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{brands.length}</p>
                    <p className="text-sm text-gray-600">Active Brands</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <HelpCircle className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{questionGroups.length}</p>
                    <p className="text-sm text-gray-600">Question Groups</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedModelIntegration;